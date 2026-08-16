// ============================================================
//  KAMPF-ENGINE – Elemental-Duell
//
//  Diese Datei kennt Karten, Zonen, Zuege und Schaden.
//  Sie kennt KEINE Anzeige: kein document, kein Fenster, keine Farbe,
//  kein Text fuer Menschen. Alles, was passiert, wird als Ereignis
//  gemeldet. Wer etwas anzeigen will, hoert zu.
//
//  Das ist die Bedingung dafuer, dass dieselbe Engine spaeter
//  (a) den Kampfbildschirm antreibt,
//  (b) in der Simulation tausende Duelle ohne Anzeige durchrechnet,
//  (c) um passive Effekte erweitert werden kann, ohne dass hier
//      herumoperiert werden muss.
//
//  Ereignisse:
//    duell-start, rundenbeginn, zug-beginn, zug-ende,
//    angriff, vor-schaden, nach-schaden,
//    wechsel, ausruestung,
//    synthese-versuch, synthese-gelungen, synthese-misslungen,
//    elemental-erschöpft, duell-ende
//
//  "vor-schaden" bekommt ein veraenderbares Objekt: Zuhoerer duerfen
//  daten.schaden aendern. Dort haengen spaeter die passiven Effekte.
// ============================================================

(function () {
  "use strict";

  // --- Zufall mit Saat, damit Ergebnisse wiederholbar sind ----
  function zufallsQuelle(saat) {
    let a = saat >>> 0;
    return function () {
      a += 0x6D2B79F5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // --- Hilfen -------------------------------------------------
  function istAusruestung(karte) {
    return karte.klasse === "Ausrüstung" || karte.lp === null || karte.lp === undefined;
  }

  function istEnergie(karte) {
    return istAusruestung(karte) &&
      (karte.eigenschaften || []).indexOf(window.REGELN.energieMerkmal) !== -1;
  }

  // Abschnitt 6: "Kein Edukt bleibt uebrig" – das ist die Regel und der
  // Standard. Die beiden anderen Einstellungen sind Messvarianten; sie
  // widersprechen der Massenbilanz, die auf jeder Verbindungs-Karte
  // gedruckt steht (siehe regeln.js, eduktVerbrauch).
  function eduktVerbrauchWaehlen(edukte, art) {
    if (art === "keines") return [];
    // "alle" – und alles Unbekannte, damit ein Tippfehler in einer
    // Variante zur Regel zurueckfaellt und nicht zu halber Chemie.
    if (art !== "eines") return edukte.slice();
    // Genau eines wird verbraucht. Hat die Reaktion nur ein Edukt (die
    // Gaerung), ist das dieses – sonst gaebe es kein Produkt.
    if (edukte.length <= 1) return edukte.slice();
    // Am Tisch waehlt der Spieler; in der Simulation muss die Wahl
    // wiederholbar sein. Verbraucht wird das angeschlagenste Edukt: Die
    // Verbindung kommt mit vollen LP, also rettet das die meisten LP.
    let schwaechstes = 0;
    for (let i = 1; i < edukte.length; i++) {
      if (edukte[i].lp < edukte[schwaechstes].lp) schwaechstes = i;
    }
    return [edukte[schwaechstes]];
  }

  function neueInstanz(karte) {
    return {
      karte: karte,
      lp: karte.lp,
      maxLp: karte.lp,
      zustaende: []   // Platz fuer spaetere Statuszustaende
    };
  }

  // ------------------------------------------------------------
  //  Schadensberechnung – die vier Gesetze aus Abschnitt 5
  // ------------------------------------------------------------
  function schadenBerechnen(attacke, zielKarte) {
    const R = window.REGELN;
    const eigenschaften = zielKarte.eigenschaften || [];
    let faktor = 1;
    const gruende = [];
    for (let i = 0; i < R.typenMatrix.length; i++) {
      const regel = R.typenMatrix[i];
      if (regel.typ === attacke.typ && eigenschaften.indexOf(regel.zielEigenschaft) !== -1) {
        faktor *= regel.faktor;
        gruende.push(regel);
      }
    }
    // Aufgerundet wird auf R.rundungsSchritt – seit Fassung VIII auf die
    // ganze Zahl, weil der neue Punktezähler (zwei Scheiben, Zehner und
    // Einer) jede Zahl von 0 bis 79 anzeigt. Halbe Lebenspunkte gäbe es
    // auf keiner Scheibe, deshalb wird überhaupt gerundet.
    const schritt = R.rundungsSchritt || 1;
    return {
      basis: attacke.schaden,
      faktor: faktor,
      gruende: gruende,
      schaden: Math.ceil(attacke.schaden * faktor / schritt) * schritt
    };
  }

  // ------------------------------------------------------------
  //  Duell
  //
  //  deck = {
  //    name:          Anzeigename des Spielers
  //    elementals:    [karte, ...]   kommen offen ins Team
  //    ausruestung:   [karte, ...]   verdeckt auf der Hand
  //    verbindungen:  [karte, ...]   verdeckt auf der Hand
  //  }
  // ------------------------------------------------------------
  function Duell(deckA, deckB, optionen) {
    optionen = optionen || {};
    const R = window.REGELN;

    this.stufe = optionen.stufe || "I";
    this.regelsatz = R.meisterstufen[this.stufe];
    this.zufall = optionen.zufall || zufallsQuelle(optionen.saat || 1);

    // Volltreffer: NUR in der App, und nur wenn ausdruecklich verlangt.
    // Vorgabe ist aus – sonst waeren die Regeltests nicht mehr
    // wiederholbar und das gedruckte Spiel braeuchte einen Wuerfel.
    this.volltreffer = (optionen.volltreffer === true && R.appZusatz)
      ? R.appZusatz.volltreffer : null;
    this.zuhoerer = {};
    this.zugZaehler = 0;
    this.vorbei = false;
    this.sieger = null;
    this.grund = null;
    this.protokoll = [];
    this.mitProtokoll = optionen.mitProtokoll === true;

    this.spieler = [this.spielerAufbauen(deckA, 0), this.spielerAufbauen(deckB, 1)];

    // Abschnitt 3: Es beginnt, wessen aktives Elemental die kleinere
    // Teilchenmasse hat. Bei Gleichstand entscheidet der Zufall.
    const masseA = this.spieler[0].arena.karte.masse || 0;
    const masseB = this.spieler[1].arena.karte.masse || 0;
    if (masseA < masseB) this.amZug = 0;
    else if (masseB < masseA) this.amZug = 1;
    else this.amZug = this.zufall() < 0.5 ? 0 : 1;

    // Wer begonnen hat, bleibt abrufbar – die Simulation misst damit,
    // wie schwer die Initiative wiegt.
    this.beginner = this.amZug;

    this.melde("duell-start", {
      stufe: this.stufe,
      beginner: this.amZug,
      masseA: masseA,
      masseB: masseB,
      gleichstand: masseA === masseB
    });
  }

  Duell.prototype.spielerAufbauen = function (deck, index) {
    const instanzen = deck.elementals.map(neueInstanz);
    return {
      index: index,
      name: deck.name || ("Spieler " + (index + 1)),
      arena: instanzen[0],
      bank: instanzen.slice(1),
      hand: {
        ausruestung: (deck.ausruestung || []).slice(),
        verbindungen: (deck.verbindungen || []).slice()
      },
      ablage: [],
      // Was Ausruestung hinterlaesst: Schadensboni (Wunderkerze,
      // pH-Kompass), erlaubte Zweitsynthesen (Gasbrenner einmalig,
      // Platin-Katalysator dauerhaft) und die Angriffssperre
      // (Duftphiole).
      boni: [],
      zweiteSynthese: 0,
      zweiteSyntheseDauerhaft: false,
      angriffGesperrt: false
    };
  };

  // --- Ereignisse ---------------------------------------------
  Duell.prototype.bei = function (name, fn) {
    (this.zuhoerer[name] || (this.zuhoerer[name] = [])).push(fn);
    return this;
  };

  Duell.prototype.melde = function (name, daten) {
    const liste = this.zuhoerer[name];
    if (liste) for (let i = 0; i < liste.length; i++) liste[i](daten, this);
    if (this.mitProtokoll) this.protokoll.push({ ereignis: name, daten: daten });
    return daten;
  };

  // --- Zustand ------------------------------------------------
  Duell.prototype.gegner = function (spieler) {
    return this.spieler[1 - spieler.index];
  };

  // Das Team eines Spielers: Arena plus Bank. Beides zaehlt fuer die
  // Synthese als "im Team" (Abschnitt 6).
  Duell.prototype.team = function (spieler) {
    return (spieler.arena ? [spieler.arena] : []).concat(spieler.bank);
  };

  // Darf dieser Spieler in der geschenkten Aktion noch eine zweite
  // Synthese durchfuehren? Der Gasbrenner zaehlt herunter, der
  // Platin-Katalysator bleibt liegen (ein Katalysator wird nicht
  // verbraucht) und gilt deshalb in jedem Zug.
  Duell.prototype.darfZweiteSynthese = function (spieler) {
    return spieler.zweiteSyntheseDauerhaft === true ||
           (spieler.zweiteSynthese || 0) > 0;
  };

  // ------------------------------------------------------------
  //  Moegliche Zuege – genau eine Aktion pro Zug (Abschnitt 4)
  // ------------------------------------------------------------
  Duell.prototype.moeglicheZuege = function (spieler) {
    const zuege = [];

    // Angreifen – es sei denn, eine Duftphiole hat den Angriff
    // gesperrt ("Der Gegner kann in seinem naechsten Zug nicht
    // angreifen").
    if (!spieler.angriffGesperrt) {
      const attacken = spieler.arena.karte.attacken || [];
      for (let i = 0; i < attacken.length; i++) {
        zuege.push({ art: "angriff", index: i });
      }
    }

    // Wechseln
    for (let i = 0; i < spieler.bank.length; i++) {
      zuege.push({ art: "wechsel", index: i });
    }

    // Synthese – aber nie zweimal im selben Zug. Ist die Synthese eine
    // freie Aktion, darf die geschenkte Aktion keine weitere sein
    // (Abschnitt 6: eine Synthese pro Zug). Ausnahme sind Gasbrenner
    // und Platin-Katalysator: Sie erlauben genau eine zweite. Eine
    // dritte kann daraus nicht werden – nach der zweiten ist die
    // Zusatzaktion aufgebraucht und der Zug wechselt (fuehreAus).
    if (!this.zusatzaktionVerbraucht || this.darfZweiteSynthese(spieler)) {
      const synthesen = this.moeglicheSynthesen(spieler);
      for (let i = 0; i < synthesen.length; i++) zuege.push(synthesen[i]);
    }

    // Ausruestung spielen – die vierte Aktion aus Abschnitt 4.
    // Ausgefuehrt wird, was ein maschinenlesbares Feld "wirkung"
    // traegt. Karten, die nur Fliesstext haben, erscheinen hier
    // nicht; der Bildschirm zeigt sie trotzdem an und sagt, dass
    // sie noch nicht wirken.
    const items = this.moeglicheAusruestung(spieler);
    for (let i = 0; i < items.length; i++) zuege.push(items[i]);

    return zuege;
  };

  // ------------------------------------------------------------
  //  Abschnitt 4: Ausruestung spielen
  //
  //  Eine Karte ist spielbar, wenn sie eine ausfuehrbare Wirkung hat
  //  UND es ein gueltiges Ziel dafuer gibt. Der Glimmspan ohne
  //  Sauerstoff gegenueber ist keine Aktion, sondern eine
  //  weggeworfene Karte – und das soll das Spiel nicht zulassen.
  // ------------------------------------------------------------
  Duell.prototype.moeglicheAusruestung = function (spieler) {
    const raus = [];
    for (let i = 0; i < spieler.hand.ausruestung.length; i++) {
      const karte = spieler.hand.ausruestung[i];
      const w = karte.wirkung;
      if (!w) continue;

      const ziele = this.moeglicheZiele(spieler, w);
      if (w.ziel && w.ziel !== "keines" && !ziele.length) continue;

      raus.push({ art: "ausruestung", index: i, ziele: ziele,
                  ziel: ziele.length === 1 ? ziele[0] : null });
    }
    return raus;
  };

  // Ein Ziel wird als {seite, ort, pos} beschrieben, nicht als Verweis
  // auf ein Objekt: So laesst es sich unveraendert uebers Netz schicken
  // und auf der Gegenseite wieder aufloesen.
  Duell.prototype.moeglicheZiele = function (spieler, w) {
    const raus = [];
    const gegner = this.gegner(spieler);

    function passt(instanz) {
      if (!w.bedingung) return true;
      const k = instanz.karte, b = w.bedingung;
      if (b.eigenschaft && (k.eigenschaften || []).indexOf(b.eigenschaft) === -1) return false;
      if (b.klasse && k.klasse !== b.klasse) return false;
      if (b.name && k.name !== b.name) return false;
      return true;
    }

    if (w.ziel === "eigenesElemental") {
      if (spieler.arena && passt(spieler.arena)) raus.push({ seite: spieler.index, ort: "arena" });
      for (let n = 0; n < spieler.bank.length; n++) {
        if (passt(spieler.bank[n])) raus.push({ seite: spieler.index, ort: "bank", pos: n });
      }
    } else if (w.ziel === "eigeneArena") {
      if (spieler.arena && passt(spieler.arena)) raus.push({ seite: spieler.index, ort: "arena" });
    } else if (w.ziel === "gegnerArena") {
      if (gegner.arena && passt(gegner.arena)) raus.push({ seite: gegner.index, ort: "arena" });
    }
    return raus;
  };

  Duell.prototype.instanzAn = function (ziel) {
    if (!ziel) return null;
    const spieler = this.spieler[ziel.seite];
    if (!spieler) return null;
    if (ziel.ort === "arena") return spieler.arena;
    return spieler.bank[ziel.pos] || null;
  };

  Duell.prototype.moeglicheSynthesen = function (spieler) {
    const R = window.REGELN;
    const ergebnis = [];
    const team = this.team(spieler);
    // Seit Fassung IX kostet ⚡ nichts mehr (R.zuendungNoetig: false).
    // Die Pruefung steht nur noch fuer die Variante "zuendung-pflicht".
    const hatEnergie = !R.zuendungNoetig || spieler.hand.ausruestung.some(istEnergie);

    for (let i = 0; i < spieler.hand.verbindungen.length; i++) {
      const verbindung = spieler.hand.verbindungen[i];
      const synthese = verbindung.synthese;
      if (!synthese || !synthese.edukte || !synthese.edukte.length) continue;

      // Alle Edukte muessen im Team liegen – jedes Edukt braucht ein
      // eigenes Exemplar (kein Elemental zaehlt doppelt).
      const belegt = [];
      let vollstaendig = true;
      for (let e = 0; e < synthese.edukte.length; e++) {
        const name = synthese.edukte[e];
        let gefunden = -1;
        for (let t = 0; t < team.length; t++) {
          if (team[t].karte.name === name && belegt.indexOf(t) === -1) { gefunden = t; break; }
        }
        if (gefunden === -1) { vollstaendig = false; break; }
        belegt.push(gefunden);
      }
      if (!vollstaendig) continue;

      // Ab Stufe II darf eine Verbindung im Spiel selbst Edukt sein.
      // Darunter nicht: dann muessen alle Edukte synthesefreie Karten sein.
      if (!this.regelsatz.syntheseKetten) {
        const kette = belegt.some(function (t) { return team[t].karte.synthese; });
        if (kette) continue;
      }

      // Aktivierungsenergie
      if (synthese.aktivierung && !hatEnergie) continue;

      ergebnis.push({
        art: "synthese",
        index: i,
        edukteImTeam: belegt.map(function (t) { return team[t]; })
      });
    }
    return ergebnis;
  };

  // ------------------------------------------------------------
  //  Zug ausfuehren
  // ------------------------------------------------------------
  Duell.prototype.fuehreAus = function (zug) {
    if (this.vorbei) return false;
    const spieler = this.spieler[this.amZug];

    // Kein Zug moeglich – seit es die Duftphiole gibt, kann das
    // vorkommen: Angriff gesperrt, Bank leer, nichts auf der Hand.
    // Dann wird ausgesetzt, statt einen Zug zu erfinden.
    if (!zug) zug = { art: "aussetzen" };

    this.melde("zug-beginn", { spieler: spieler, zug: zug, nummer: this.zugZaehler + 1 });

    if (zug.art === "angriff") this.angreifen(spieler, zug.index);
    else if (zug.art === "wechsel") this.wechseln(spieler, zug.index);
    else if (zug.art === "synthese") this.synthetisieren(spieler, zug);
    else if (zug.art === "ausruestung") this.ausruestungSpielen(spieler, zug);

    this.melde("zug-ende", { spieler: spieler, zug: zug });
    this.dauerwirkungen(spieler);

    this.zugZaehler++;
    if (!this.vorbei) {
      if (this.zugZaehler >= window.REGELN.maxZuege) {
        this.beenden(null, "zuglimit");
      } else if (zug.art === "synthese" && window.REGELN.syntheseIstFreieAktion &&
                 !this.zusatzaktionVerbraucht && spieler.arena) {
        // Freie Aktion: derselbe Spieler bleibt am Zug, aber nur einmal.
        this.zusatzaktionVerbraucht = true;
        this.melde("zusatzaktion", { spieler: spieler });
      } else {
        this.zusatzaktionVerbraucht = false;
        // Die Angriffssperre gilt fuer GENAU einen Zug: Wer sie
        // hatte, hat sie jetzt abgesessen.
        spieler.angriffGesperrt = false;
        this.amZug = 1 - this.amZug;
        this.zustaendeAblaufen(this.spieler[this.amZug]);
        this.melde("rundenbeginn", { spieler: this.spieler[this.amZug] });
      }
    }
    return true;
  };

  Duell.prototype.angreifen = function (spieler, index) {
    const gegner = this.gegner(spieler);
    const attacke = spieler.arena.karte.attacken[index];
    const berechnung = schadenBerechnen(attacke, gegner.arena.karte);

    // Ausruestungsboni kommen NACH der Typen-Matrix dazu, nicht davor:
    // Die Wunderkerze gibt "+5 Schaden", nicht "+5 vor der
    // Verdopplung". Sonst waere sie gegen brennbare Ziele doppelt so
    // stark wie auf der Karte steht.
    const bonus = this.bonusVerbrauchen(spieler, attacke.typ);
    if (bonus) {
      berechnung.bonus = bonus.wert;
      berechnung.bonusQuelle = bonus.quellen;
      berechnung.schaden = Math.max(0, berechnung.schaden + bonus.wert);
    }

    // Volltreffer – zuletzt, aus demselben Grund wie der Bonus davor:
    // Er verstaerkt den fertigen Schaden, nicht die Verdopplung der
    // Typen-Matrix. Attacken ohne Schaden (reine Effektkarten wie
    // Zinkpanzer) koennen keinen Volltreffer landen.
    //
    // Gezogen wird aus this.zufall, dem gesaeten Generator des Duells –
    // NIE aus Math.random. Im Netzspiel ueberträgt kanal.js nur die Zuege,
    // beide Geraete rechnen denselben Verlauf nach; ein ungesaeter Wurf
    // liesse sie auseinanderlaufen.
    if (this.volltreffer && berechnung.schaden > 0 &&
        this.zufall() < this.volltreffer.chance) {
      const schritt = window.REGELN.rundungsSchritt || 1;
      berechnung.volltreffer = true;
      berechnung.vorVolltreffer = berechnung.schaden;
      berechnung.schaden =
        Math.ceil(berechnung.schaden * this.volltreffer.faktor / schritt) * schritt;
    }

    this.melde("angriff", {
      spieler: spieler, ziel: gegner, attacke: attacke, berechnung: berechnung
    });

    this.schadenZufuegen(gegner, berechnung.schaden, {
      quelle: spieler, attacke: attacke, berechnung: berechnung
    });

    this.wirkungAusfuehren(spieler, attacke);
  };

  // "bis zu deinem naechsten Zug" – also genau hier, wenn der eigene
  // Zug wieder beginnt. Ein Schutz, der nie ablaeuft, waere keiner.
  Duell.prototype.zustaendeAblaufen = function (spieler) {
    const alle = this.team(spieler);
    for (let t = 0; t < alle.length; t++) {
      const instanz = alle[t];
      for (let i = instanz.zustaende.length - 1; i >= 0; i--) {
        if (instanz.zustaende[i].seite === spieler.index) {
          const weg = instanz.zustaende.splice(i, 1)[0];
          this.melde("zustand-abgelaufen", { spieler: spieler, instanz: instanz, zustand: weg });
        }
      }
    }
  };

  // Dauerwirkung der Karte selbst, ausgeloest am Ende des eigenen Zuges.
  // Kalium etwa reagiert schon mit der Luft und verliert stetig LP.
  // Gilt nur fuer das Elemental in der Arena – auf der Bank ruht es.
  Duell.prototype.dauerwirkungen = function (spieler) {
    if (this.vorbei || !spieler.arena) return;
    const wirkung = spieler.arena.karte.wirkung;
    if (!wirkung || wirkung.ausloeser !== "zugende") return;

    if (wirkung.art === "selbstschaden") {
      this.melde("wirkung", { spieler: spieler, wirkung: wirkung, dauerhaft: true });
      this.schadenZufuegen(spieler, wirkung.wert, { quelle: spieler, selbstschaden: true });
    }
  };

  // Maschinenlesbare Wirkung einer Attacke. Alles, was hier steht, wird
  // wirklich ausgefuehrt – im Unterschied zum Fliesstext in "effekt".
  Duell.prototype.wirkungAusfuehren = function (spieler, attacke) {
    const wirkung = attacke.wirkung;
    if (!wirkung || !spieler.arena) return;

    if (wirkung.art === "selbstschaden") {
      // Der Angreifer zahlt selbst. Fluor etwa reagiert mit fast allem,
      // auch mit sich. Das kann ihn erschoepfen – dann rueckt nach.
      this.melde("wirkung", { spieler: spieler, attacke: attacke, wirkung: wirkung });
      this.schadenZufuegen(spieler, wirkung.wert, {
        quelle: spieler, attacke: attacke, selbstschaden: true
      });
    }
  };

  // Sammelt die Schadensboni ein, die auf diese Attacke passen, und
  // verbraucht sie. "rest: Infinity" liegt aus und bleibt (pH-Kompass).
  Duell.prototype.bonusVerbrauchen = function (spieler, typ) {
    let wert = 0;
    const quellen = [];
    for (let i = spieler.boni.length - 1; i >= 0; i--) {
      const b = spieler.boni[i];
      if (b.art !== "schadensbonus") continue;
      if (b.typ && b.typ !== typ) continue;
      wert += b.wert;
      quellen.push(b.quelle);
      if (b.rest !== Infinity) {
        b.rest -= 1;
        if (b.rest <= 0) spieler.boni.splice(i, 1);
      }
    }
    return wert ? { wert: wert, quellen: quellen } : null;
  };

  // Schutzzustaende am Ziel: Loeschdecke-artige Wirkungen setzen den
  // Schaden auf 0 oder halbieren ihn. Sie haengen an der Instanz, nicht
  // am Spieler – ein Erlenmeyerkolben schuetzt GENAU das Elemental,
  // auf das er gespielt wurde.
  Duell.prototype.schutzAnwenden = function (leidtragender, schaden, herkunft) {
    const instanz = leidtragender.arena;
    if (!instanz || !instanz.zustaende.length || schaden <= 0) return schaden;
    const typ = (herkunft && herkunft.attacke) ? herkunft.attacke.typ : null;

    for (let i = 0; i < instanz.zustaende.length; i++) {
      const z = instanz.zustaende[i];
      if (z.art !== "schutz") continue;
      if (z.gegen !== "alle" && z.gegen !== typ) continue;
      const vorher = schaden;
      schaden = Math.ceil(schaden * z.faktor);
      this.melde("schutz-gewirkt", {
        ziel: leidtragender, instanz: instanz, quelle: z.quelle,
        vorher: vorher, nachher: schaden
      });
      if (z.nurEinmal) { instanz.zustaende.splice(i, 1); i--; }
      if (schaden <= 0) break;
    }
    return schaden;
  };

  // Zentraler Schadensweg. Alles, was Schaden macht, laeuft hier durch –
  // damit passive Effekte spaeter genau eine Stelle zum Einhaengen haben.
  Duell.prototype.schadenZufuegen = function (leidtragender, schaden, herkunft) {
    schaden = this.schutzAnwenden(leidtragender, schaden, herkunft);
    const daten = this.melde("vor-schaden", {
      ziel: leidtragender,
      instanz: leidtragender.arena,
      schaden: schaden,           // <- Zuhoerer duerfen das aendern
      herkunft: herkunft || {}
    });

    const wirklich = Math.max(0, daten.schaden);
    leidtragender.arena.lp -= wirklich;

    this.melde("nach-schaden", {
      ziel: leidtragender, instanz: leidtragender.arena,
      schaden: wirklich, restLp: leidtragender.arena.lp
    });

    if (leidtragender.arena.lp <= 0) this.erschoepfen(leidtragender);
  };

  // Abschnitt 4: LP auf 0 -> erschoepft, ablegen, sofort und ohne
  // Zugverbrauch nachruecken. Kein Elemental mehr -> Niederlage.
  Duell.prototype.erschoepfen = function (spieler) {
    const gefallen = spieler.arena;
    gefallen.lp = 0;
    spieler.ablage.push(gefallen.karte);
    spieler.arena = null;

    this.melde("elemental-erschöpft", { spieler: spieler, instanz: gefallen });

    if (spieler.bank.length === 0) {
      this.beenden(this.gegner(spieler), "keine-elementals");
      return;
    }
    spieler.arena = spieler.bank.shift();
    this.melde("wechsel", { spieler: spieler, instanz: spieler.arena, erzwungen: true });
  };

  // ------------------------------------------------------------
  //  Ausruestung ausfuehren
  //
  //  Die Karte geht IMMER auf die Ablage – auch wenn ihre Wirkung
  //  ins Leere geht. Regelwerk Abschnitt 7: "Jede Ausruestung kann
  //  nur einmal pro Duell verwendet werden und kommt danach auf die
  //  Ablage."
  // ------------------------------------------------------------
  Duell.prototype.ausruestungSpielen = function (spieler, zug) {
    const karte = spieler.hand.ausruestung[zug.index];
    if (!karte) return;
    const w = karte.wirkung || {};
    const zielInstanz = this.instanzAn(zug.ziel);

    spieler.hand.ausruestung.splice(zug.index, 1);
    spieler.ablage.push(karte);

    this.melde("ausruestung-gespielt", {
      spieler: spieler, karte: karte, wirkung: w,
      ziel: zug.ziel || null, instanz: zielInstanz
    });

    if (w.art === "heilung" && zielInstanz) {
      const vorher = zielInstanz.lp;
      zielInstanz.lp = Math.min(zielInstanz.maxLp, zielInstanz.lp + (w.wert || 0));
      this.melde("geheilt", {
        spieler: spieler, instanz: zielInstanz,
        wert: zielInstanz.lp - vorher, restLp: zielInstanz.lp
      });

    } else if (w.art === "direktschaden" && zielInstanz) {
      const gegner = this.gegner(spieler);
      if (gegner.arena === zielInstanz) {
        this.schadenZufuegen(gegner, w.wert || 0, { quelle: spieler, ausruestung: karte });
      }

    } else if (w.art === "schutz" && zielInstanz) {
      // Gilt bis zum naechsten eigenen Zug – dort wird er geloescht.
      zielInstanz.zustaende.push({
        art: "schutz", gegen: w.gegen || "alle", faktor: (w.faktor === undefined ? 0 : w.faktor),
        nurEinmal: !!w.nurEinmal, quelle: karte.name, seite: spieler.index
      });

    } else if (w.art === "schadensbonus") {
      spieler.boni.push({
        art: "schadensbonus", wert: w.wert || 0, typ: w.typ || null,
        rest: w.anzahl || 1, quelle: karte.name
      });
      if (w.gegnerMalus) {
        this.gegner(spieler).boni.push({
          art: "schadensbonus", wert: -w.gegnerMalus, typ: null, rest: 1, quelle: karte.name
        });
      }

    } else if (w.art === "dauerbonus") {
      // "Bleibt liegen" – gilt bis zum Ende des Duells.
      spieler.boni.push({
        art: "schadensbonus", wert: w.wert || 0, typ: w.typ || null,
        rest: Infinity, quelle: karte.name
      });

    } else if (w.art === "zwangswechsel" && zielInstanz) {
      const gegner = this.gegner(spieler);
      if (gegner.arena === zielInstanz && gegner.bank.length) {
        const neu = gegner.bank.shift();
        gegner.bank.push(gegner.arena);
        gegner.arena = neu;
        this.melde("wechsel", { spieler: gegner, instanz: neu, erzwungen: true });
      }

    } else if (w.art === "angriffsperre") {
      this.gegner(spieler).angriffGesperrt = true;

    } else if (w.art === "zweiteSynthese") {
      // Der Gasbrenner wird abgelegt und erlaubt EINE zweite Synthese.
      // Der Platin-Katalysator bleibt liegen – ein Katalysator wird
      // chemisch nicht verbraucht, also gilt er in jedem Zug.
      if (w.dauerhaft) spieler.zweiteSyntheseDauerhaft = true;
      else spieler.zweiteSynthese = (spieler.zweiteSynthese || 0) + (w.anzahl || 1);

    } else if (w.art === "blick") {
      // Reine Anzeigewirkung: Die Engine deckt nichts auf, sie sagt
      // nur Bescheid. Was gezeigt wird, entscheidet der Bildschirm.
      this.melde("blick", { spieler: spieler, gegner: this.gegner(spieler), umfang: w.umfang || "hand" });
    }
  };

  Duell.prototype.wechseln = function (spieler, bankIndex) {
    const neu = spieler.bank[bankIndex];
    spieler.bank[bankIndex] = spieler.arena;
    spieler.arena = neu;
    this.melde("wechsel", { spieler: spieler, instanz: neu, erzwungen: false });
  };

  Duell.prototype.synthetisieren = function (spieler, zug) {
    const R = window.REGELN;
    const verbindung = spieler.hand.verbindungen[zug.index];
    const synthese = verbindung.synthese;

    this.melde("synthese-versuch", { spieler: spieler, verbindung: verbindung });

    // Aktivierungsenergie ablegen – nur noch unter "zuendung-pflicht".
    if (R.zuendungNoetig && synthese.aktivierung) {
      const pos = spieler.hand.ausruestung.findIndex(istEnergie);
      if (pos === -1) {
        this.melde("synthese-misslungen", {
          spieler: spieler, verbindung: verbindung, grund: "keine-aktivierungsenergie"
        });
        return;
      }
      spieler.ablage.push(spieler.hand.ausruestung.splice(pos, 1)[0]);
    }

    // Ist die Zusatzaktion schon verbraucht, ist DIES die zweite
    // Synthese des Zuges – sie geht auf das Konto des Gasbrenners.
    // Der Platin-Katalysator (dauerhaft) zaehlt nicht herunter.
    // Erst hier, damit eine misslungene Synthese nichts kostet.
    if (this.zusatzaktionVerbraucht && !spieler.zweiteSyntheseDauerhaft) {
      spieler.zweiteSynthese = (spieler.zweiteSynthese || 0) - 1;
    }

    // Welche Edukte verbraucht werden, entscheidet R.eduktVerbrauch.
    // Gefunden werden mussten sie in jedem Fall alle – ohne vollstaendige
    // Edukte gibt es keine Reaktion (moeglicheSynthesen prueft das).
    const verbraucht = eduktVerbrauchWaehlen(zug.edukteImTeam, R.eduktVerbrauch);

    // Edukte ablegen. War die Arena unter den Edukten, ist sie danach frei.
    let arenaFreiGeworden = false;
    for (let i = 0; i < verbraucht.length; i++) {
      const instanz = verbraucht[i];
      if (spieler.arena === instanz) {
        spieler.arena = null;
        arenaFreiGeworden = true;
      } else {
        const b = spieler.bank.indexOf(instanz);
        if (b !== -1) spieler.bank.splice(b, 1);
      }
      spieler.ablage.push(instanz.karte);
    }

    // Verbindung von der Hand nehmen und mit vollen LP einsetzen
    spieler.hand.verbindungen.splice(zug.index, 1);
    const neueKarte = neueInstanz(verbindung);
    if (arenaFreiGeworden || !spieler.arena) spieler.arena = neueKarte;
    else spieler.bank.push(neueKarte);

    this.melde("synthese-gelungen", {
      spieler: spieler,
      verbindung: verbindung,
      instanz: neueKarte,
      wortgleichung: synthese.wortgleichung,
      bilanz: synthese.bilanz,
      inArena: spieler.arena === neueKarte
    });

    // Exotherme Reaktion: Sofortschaden am aktiven Elemental des Gegners.
    // Reaktionsenergie kennt keine Angriffstypen, die Matrix greift nicht.
    if (synthese.exotherm) {
      let energie = synthese.exotherm;
      // Brennstoff-Regel: War eines der Edukte brennbar, wird mehr
      // Energie frei – der Brennstoff ist es, der sie liefert.
      if (R.brennstoffBonus) {
        const mitBrennstoff = zug.edukteImTeam.some(function (instanz) {
          return (instanz.karte.eigenschaften || []).indexOf("brennbar") !== -1;
        });
        if (mitBrennstoff) energie += R.brennstoffBonus;
      }
      const gegner = this.gegner(spieler);
      if (gegner.arena) {
        this.schadenZufuegen(gegner, energie, {
          quelle: spieler, exotherm: true, verbindung: verbindung
        });
      }
    }
  };

  Duell.prototype.beenden = function (sieger, grund) {
    this.vorbei = true;
    this.sieger = sieger;
    this.grund = grund;
    this.melde("duell-ende", { sieger: sieger, grund: grund, zuege: this.zugZaehler });
  };

  // ------------------------------------------------------------
  //  Aussenschnittstelle
  // ------------------------------------------------------------
  window.ENGINE = {
    Duell: Duell,
    schadenBerechnen: schadenBerechnen,
    neueInstanz: neueInstanz,
    istAusruestung: istAusruestung,
    istEnergie: istEnergie,
    zufallsQuelle: zufallsQuelle
  };
})();
