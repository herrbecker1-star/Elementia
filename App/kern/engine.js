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
  //  App-Regeln – was NUR in der App gilt
  //
  //  Am Tisch bleibt das Spiel deterministisch und knapp, weil jeder
  //  Wuerfelwurf Unterrichtszeit kostet. In der App rechnet der
  //  Rechner, dort kostet es nichts. Alles, was hier steht, gehoert
  //  zu REGELN.appZusatz und darf im gedruckten Regelwerk nicht
  //  vorkommen.
  //
  //  Warum eine LISTE statt einzelner Wahrheitswerte: Der groesste
  //  Messfehler dieses Projekts war ein Schalter, der nicht
  //  durchgereicht wurde – "volltreffer" fehlte in den Optionen der
  //  Werkstatt, und saemtliche Balancing-Zahlen beschrieben deshalb
  //  das Tischspiel, waehrend sie die App beschreiben sollten. Mit
  //  vier App-Regeln waere dieselbe Falle viermal so tief. Sie sind
  //  deshalb EINZELN schaltbar: Nur so laesst sich messen, welche
  //  Regel welche Zahl bewegt.
  // ------------------------------------------------------------
  const APP_REGELN = ["volltreffer", "daneben", "appAttacken", "synergien"];

  // Wirkungen, die dem eigenen Elemental gelten. Alles andere trifft
  // den Gegner. Nur noetig, weil eine ATTACKE ihr Ziel nicht im Zug
  // mitfuehrt – bei der Ausruestung waehlt es der Spieler.
  const HILFT = { heilung: true, schutz: true, schadensbonus: true,
                  dauerbonus: true, zweiteSynthese: true };

  function appRegelnLesen(optionen) {
    const aus = {};
    for (let i = 0; i < APP_REGELN.length; i++) aus[APP_REGELN[i]] = false;

    const q = optionen.appRegeln;
    if (q === true) {
      // "App wie gespielt" – der Sammelschalter.
      for (let i = 0; i < APP_REGELN.length; i++) aus[APP_REGELN[i]] = true;
    } else if (q && typeof q === "object") {
      for (let i = 0; i < APP_REGELN.length; i++) {
        aus[APP_REGELN[i]] = q[APP_REGELN[i]] === true;
      }
    }

    // Der alte Schalter bleibt gueltig. duell.html, die Werkstatt und
    // die Regeltests setzen ihn seit dem 17.08.2026; er darf durch die
    // neue Liste nicht stillschweigend wirkungslos werden.
    if (optionen.volltreffer === true) aus.volltreffer = true;

    return aus;
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

    // Welche App-Regeln gelten in diesem Duell? Vorgabe ist ALLES AUS –
    // sonst waeren die Regeltests nicht mehr wiederholbar und die
    // Simulation wuerde ungefragt ein anderes Spiel messen als das
    // gedruckte.
    this.appRegeln = appRegelnLesen(optionen);

    // Volltreffer: NUR in der App, und nur wenn ausdruecklich verlangt.
    // Bleibt als eigenes Feld stehen, weil angreifen() damit rechnet.
    this.volltreffer = (this.appRegeln.volltreffer && R.appZusatz)
      ? R.appZusatz.volltreffer : null;
    this.zuhoerer = {};
    // Zwei Zaehler, weil sie zwei verschiedene Fragen beantworten:
    //   zugZaehler    Aktionen – daran haengen Netz-Zugnummer und
    //                 Pruefsumme, und das Zuglimit gegen Endlosduelle.
    //   rundenZaehler echte Spielzuege – das, was am Tisch ein "Zug"
    //                 ist und was die Werkstatt als Dauer misst.
    // Seit Synthese UND Ausruestung frei sind, laufen beide deutlich
    // auseinander; eine Zahl fuer beides waere ab jetzt eine Luege.
    this.zugZaehler = 0;
    this.rundenZaehler = 0;
    this.syntheseGenutzt = false;

    // --- Wer muss ein Elemental von der Bank nachziehen? -------
    // Regelwerk Abschnitt 4: "Sein Besitzer WAEHLT sofort (ohne einen
    // Zug zu verbrauchen) ein neues aktives Elemental von der Bank."
    // Bis zum 24.08.2026 nahm die Engine stumm den ersten Bankplatz.
    //
    // Eine Liste, kein einzelner Index: Zwei Seiten koennen gleichzeitig
    // faellig werden – etwa wenn ein toedlicher Angriff die eine Arena
    // leert und der Selbstschaden derselben Attacke (Fluor) danach die
    // eigene. Gewaehlt wird in der Reihenfolge, in der es passiert ist.
    this.nachruecken = [];
    // Der Zug, der dabei unterbrochen wurde. Er wird nachgeholt, sobald
    // alle Wahlen getroffen sind – sonst bliebe der Angreifer ewig am Zug.
    this.schwebend = null;

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

    // Die Synergien gelten von der ersten Runde an – sie haengen an der
    // Aufstellung, nicht an einem gespielten Zug.
    this.synergienAktualisieren();

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

  // Wer ist JETZT an der Reihe? Nicht immer der, der am Zug ist: Steht
  // eine Nachrueck-Wahl aus, handelt zuerst der, dessen Arena leer ist –
  // auch wenn der Gegner am Zug bleibt.
  //
  // Diese Frage und "wer ist am Zug" sind seit dem 24.08.2026 zwei
  // verschiedene. amZug bleibt, was es war: Es traegt den Rundenwechsel
  // und die Pruefsumme (kanal.js). Alles, was fragt "wen bediene ich
  // gerade", fragt amHandeln().
  Duell.prototype.amHandeln = function () {
    return this.nachruecken.length ? this.nachruecken[0] : this.amZug;
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

    // Steht eine Nachrueck-Wahl aus, gibt es nur SIE – und nur fuer den,
    // dessen Arena leer ist. Der andere hat gar keinen Zug: Sein Angriff
    // haette kein Ziel, und ein zweiter Schlag in die leere Arena waere
    // ein Freischlag, den es am Tisch nicht gibt.
    if (this.nachruecken.length) {
      if (spieler.index !== this.nachruecken[0]) return zuege;
      for (let i = 0; i < spieler.bank.length; i++) {
        zuege.push({ art: "nachruecken", index: i });
      }
      return zuege;
    }

    // Angreifen – es sei denn, eine Duftphiole hat den Angriff
    // gesperrt ("Der Gegner kann in seinem naechsten Zug nicht
    // angreifen").
    if (!spieler.angriffGesperrt) {
      const attacken = this.attackenVon(spieler.arena.karte);
      for (let i = 0; i < attacken.length; i++) {
        zuege.push({ art: "angriff", index: i });
      }
    }

    // Wechseln
    for (let i = 0; i < spieler.bank.length; i++) {
      zuege.push({ art: "wechsel", index: i });
    }

    // Synthese – aber nie zweimal im selben Zug (Abschnitt 6: eine
    // Synthese pro Zug). Ausnahme sind Gasbrenner und
    // Platin-Katalysator: Sie erlauben genau eine zweite. Eine dritte
    // kann daraus nicht werden – die zweite verbraucht den Zaehler.
    if (!this.syntheseGenutzt || this.darfZweiteSynthese(spieler)) {
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
    // amHandeln, nicht amZug: Die Nachrueck-Wahl trifft der, dessen
    // Arena leer ist – auch mitten im Zug des Gegners.
    const spieler = this.spieler[this.amHandeln()];

    // Kein Zug moeglich – seit es die Duftphiole gibt, kann das
    // vorkommen: Angriff gesperrt, Bank leer, nichts auf der Hand.
    // Dann wird ausgesetzt, statt einen Zug zu erfinden.
    if (!zug) zug = { art: "aussetzen" };

    this.melde("zug-beginn", { spieler: spieler, zug: zug, nummer: this.zugZaehler + 1 });

    if (zug.art === "angriff") this.angreifen(spieler, zug.index);
    else if (zug.art === "wechsel") this.wechseln(spieler, zug.index);
    else if (zug.art === "synthese") this.synthetisieren(spieler, zug);
    else if (zug.art === "ausruestung") this.ausruestungSpielen(spieler, zug);
    else if (zug.art === "nachruecken") this.nachrueckenAusfuehren(spieler, zug.index);

    this.melde("zug-ende", { spieler: spieler, zug: zug });

    // zugZaehler zaehlt AKTIONEN, nicht Runden. Daran haengen die
    // Netz-Zugnummern und die Pruefsumme – er muss das bleiben. Die
    // Nachrueck-Wahl zaehlt mit: Sie geht als Zug uebers Netz, und beide
    // Geraete muessen dieselbe Nummer dafuer vergeben.
    this.zugZaehler++;

    if (this.vorbei) return true;

    if (this.zugZaehler >= window.REGELN.maxZuege) {
      this.beenden(null, "zuglimit");
      return true;
    }

    // Steht (noch) eine Wahl aus, endet hier gar nichts: Der Betroffene
    // waehlt zuerst. Der unterbrochene Zug wird gemerkt und danach
    // nachgeholt – sonst bliebe der Angreifer fuer immer am Zug.
    //
    // Die Wahl selbst darf sich nicht merken: Bei zwei gleichzeitigen
    // Wahlen wuerde sie den echten Zug ueberschreiben.
    if (this.nachruecken.length) {
      if (zug.art !== "nachruecken") this.schwebend = { spieler: spieler, zug: zug };
      return true;
    }

    // Alle Wahlen getroffen: Wenn diese Aktion eine Wahl war, gilt jetzt
    // wieder der unterbrochene Zug – mit SEINEM Spieler und SEINER Art.
    let endeZug = zug, endeSpieler = spieler;
    if (zug.art === "nachruecken") {
      // Ohne gemerkten Zug ist die Wahl in zugBeenden entstanden
      // (Gift, Kalium). Dann hat der Zugwechsel schon stattgefunden und
      // es ist nichts nachzuholen.
      if (!this.schwebend) return true;
      endeZug = this.schwebend.zug;
      endeSpieler = this.schwebend.spieler;
      this.schwebend = null;
    }

    if (this.istFreieAktion(endeZug, endeSpieler)) {
      // Derselbe Spieler bleibt am Zug. Das kann nicht ewig gehen:
      // Jede Ausruestung verlaesst dabei die Hand, die Synthese ist
      // auf eine je Zug begrenzt – und die App-Attacke ebenso, sonst
      // stuende das Duell still.
      if (endeZug.art === "synthese") this.syntheseGenutzt = true;
      if (endeZug.art === "angriff") this.appAttackeGenutzt = true;
      this.melde("zusatzaktion", { spieler: endeSpieler, zug: endeZug });
    } else {
      this.zugBeenden(endeSpieler);
    }
    return true;
  };

  // Die Wahl von der Bank. Anders als wechseln() ist die Arena hier
  // leer – es wird nicht getauscht, sondern besetzt.
  Duell.prototype.nachrueckenAusfuehren = function (spieler, bankIndex) {
    const pos = this.nachruecken.indexOf(spieler.index);
    if (pos !== -1) this.nachruecken.splice(pos, 1);

    const neu = spieler.bank.splice(bankIndex, 1)[0];
    if (!neu) return;
    spieler.arena = neu;
    this.synergienAktualisieren();
    this.melde("wechsel", { spieler: spieler, instanz: neu, erzwungen: true });
  };

  // Welche Aktionen kosten den Zug NICHT? Seit Fassung X sind das
  // zwei: die Synthese (hoechstens eine je Zug, der Gasbrenner
  // erlaubt eine zweite) und JEDE Ausruestung. Das ersetzt die alte
  // Sonderregel "die Synthese schenkt dir eine weitere Aktion" –
  // gedruckt steht jetzt nur noch: Dein Zug endet, wenn du angreifst,
  // wechselst oder passt.
  Duell.prototype.istFreieAktion = function (zug, spieler) {
    const R = window.REGELN;
    if (zug.art === "ausruestung") return R.ausruestungIstFreieAktion !== false;

    // Eine App-Attacke kann eine freie Aktion sein – hoechstens EINE je
    // Zug, wie bei der Synthese. Der Grund ist derselbe, aus dem die
    // Ausruestung in Fassung X frei wurde: Ein Zug ohne Schaden, der
    // rund 5 Schaden verhindert, ist ein Verlustgeschaeft, wenn ein Zug
    // rund 11 Schaden macht. Gemessen am 22.08.2026 hat der Bot 9 von
    // 11 App-Attacken deshalb NIE gespielt.
    if (zug.art === "angriff" && R.appZusatz && R.appZusatz.appAttackeIstFreieAktion &&
        this.appRegeln.appAttacken && !this.appAttackeGenutzt) {
      const karte = spieler.arena && spieler.arena.karte;
      if (karte && karte.appAttacke &&
          this.attackenVon(karte)[zug.index] === karte.appAttacke) {
        return true;
      }
    }

    if (zug.art !== "synthese") return false;
    // Ohne Arena steht niemand mehr, der handeln koennte.
    return R.syntheseIstFreieAktion === true && !!spieler.arena;
  };

  // Der Zugwechsel an EINER Stelle. Alles, was "einmal je Zug"
  // bedeutet, haengt hier – vorher stand es im else-Zweig einer
  // Verzweigung, und dauerwirkungen stand sogar davor: Wer mit
  // Kalium synthetisierte und dann angriff, zahlte den Selbstschaden
  // zweimal. Mit freier Ausruestung waeren es bis zu vier gewesen.
  Duell.prototype.zugBeenden = function (spieler) {
    this.dauerwirkungen(spieler);
    if (this.vorbei) return;

    this.syntheseGenutzt = false;
    this.appAttackeGenutzt = false;
    // Die Angriffssperre gilt fuer GENAU einen Zug: Wer sie hatte,
    // hat sie jetzt abgesessen.
    spieler.angriffGesperrt = false;
    this.rundenZaehler++;
    this.amZug = 1 - this.amZug;
    this.zustaendeAblaufen(this.spieler[this.amZug]);
    // Nach dem Abraeumen, nicht davor: zustaendeAblaufen wirft auch die
    // Synergie-Zustaende dieser Seite weg, und die sollen sofort wieder
    // gelten – sie haengen an der Lage, nicht an einem Zug.
    this.synergienAktualisieren();
    this.melde("rundenbeginn", { spieler: this.spieler[this.amZug] });
  };

  // Die Lage kann sich mitten im Zug aendern: Wechsel, Synthese und
  // jedes erschoepfte Elemental veraendern die Bank. Deshalb an EINER
  // Stelle und fuer BEIDE Seiten – eine Synergie des Gegners haengt
  // genauso an seiner Bank wie die eigene.
  Duell.prototype.synergienAktualisieren = function () {
    if (!this.appRegeln.synergien) return;
    this.synergienSetzen(this.spieler[0]);
    this.synergienSetzen(this.spieler[1]);
  };

  // ------------------------------------------------------------
  //  Bank-Synergien – NUR in der App (REGELN.appZusatz.synergien)
  //
  //  Die Bank tat bisher nichts, bis sie nachrueckte. Hier staerken
  //  Elementals, die fachlich zusammengehoeren, das aktive.
  //
  //  Die Hauptgruppe steht auf keiner Karte – sie folgt aber aus der
  //  Kartenklasse, wo die Chemie sie hergibt. Eine eigene Angabe in
  //  "appMerkmale" geht vor; so laesst sich jede Karte nachtragen,
  //  ohne dass am Druckbogen etwas passiert (der Generator liest
  //  "appMerkmale" nicht).
  // ------------------------------------------------------------
  const HAUPTGRUPPE_JE_KLASSE = {
    "Alkalimetall": 1, "Erdalkalimetall": 2, "Halogen": 7, "Edelgas": 8
  };

  function hauptgruppeVon(karte) {
    const m = karte.appMerkmale;
    if (m && m.hauptgruppe !== undefined) return m.hauptgruppe;
    const h = HAUPTGRUPPE_JE_KLASSE[karte.klasse];
    return h === undefined ? null : h;
  }

  // Traegt die Karte dieses Merkmal? Gesucht wird zuerst in
  // appMerkmale (app-seitig nachgetragen), dann in den gedruckten
  // Eigenschaften – "metallisch" und "brennbar" stehen ohnehin dort.
  function traegtMerkmal(karte, merkmal) {
    const m = karte.appMerkmale;
    if (m && m[merkmal] === true) return true;
    return (karte.eigenschaften || []).indexOf(merkmal) !== -1;
  }

  Duell.prototype.synergienVon = function (spieler) {
    const R = window.REGELN;
    const treffer = [];
    if (!this.appRegeln.synergien || !R.appZusatz || !R.appZusatz.synergien) return treffer;
    if (!spieler.arena) return treffer;

    const aktiv = spieler.arena.karte;
    const bank = spieler.bank.map(function (i) { return i.karte; });
    const team = [aktiv].concat(bank);

    // Tritt die Stoffklasse hinter der Hauptgruppe zurueck? Nur, wenn
    // es die Hauptgruppen-Zeile ueberhaupt noch gibt. Sonst fielen zwei
    // Alkalimetalle durch BEIDE Raster: die Hauptgruppe ist aus, und
    // die Stoffklasse haette ihnen den Vortritt gelassen.
    const hauptgruppeGilt = R.appZusatz.synergien.some(function (s) {
      return s.inKraft !== false && s.bedingung && s.bedingung.gleich === "hauptgruppe";
    });

    for (let i = 0; i < R.appZusatz.synergien.length; i++) {
      const s = R.appZusatz.synergien[i];
      // "inKraft: false" heisst gebaut, aber nicht im Spiel. Die Zeile
      // bleibt zum Gegenmessen stehen (varianten.js, "synergien-*").
      if (s.inKraft === false) continue;
      const b = s.bedingung || {};
      let passt = false;

      if (s.geltung === "team") {
        if (b.alle) passt = team.length > 0 && team.every(function (k) {
          return traegtMerkmal(k, b.alle);
        });
      } else if (s.geltung === "bank") {
        // Ein Elemental auf der Bank genuegt – das aktive zaehlt NICHT
        // mit. Argon nuetzt als Schutzgas nur, solange es daneben steht.
        const wieviele = bank.filter(function (k) { return traegtMerkmal(k, b.eines); }).length;
        passt = wieviele >= (s.mindestens || 1);
      } else if (s.geltung === "bank-zu-aktiv") {
        let wieviele = 0;
        for (let n = 0; n < bank.length; n++) {
          if (b.gleich === "hauptgruppe") {
            const ha = hauptgruppeVon(aktiv), hb = hauptgruppeVon(bank[n]);
            if (ha !== null && ha === hb) wieviele++;
          } else if (b.gleich === "klasse") {
            if (!aktiv.klasse || aktiv.klasse !== bank[n].klasse) continue;
            // "nurVerbindungen": Die Zeile zaehlt nur zwischen
            // VERBINDUNGEN – Oxid neben Oxid, Sulfid neben Sulfid –,
            // nicht zwischen zwei Metallen oder zwei Alkalimetallen.
            //
            // Der Grund ist das Gesetz des Kartensatzes: Eine Synergie,
            // die nur Elemente tragen koennen, besteuert die Synthese,
            // denn genau die verbraucht sie. Gemessen am 23.08.2026:
            // Erdhuegel bringt Aluminium, Zinn, Silber, Gold und Platin;
            // die Element-Paare gleicher Klasse springen von 47 auf 77,
            // und dort faellt syntheseLohnt unter NULL.
            //
            // Beide Karten teilen hier bereits die Klasse, ein Blick auf
            // die aktive genuegt. Ohne das Feld aendert sich nichts.
            if (b.nurVerbindungen &&
                R.elementKlassen.indexOf(aktiv.klasse) !== -1) continue;
            // Zwei Alkalimetalle teilen die Klasse UND die Hauptgruppe –
            // das ist chemisch dieselbe Aussage, und beide Zeilen zu
            // zaehlen waere doppelt gezaehlt. Wo die Hauptgruppe schon
            // greift, schweigt die Stoffklasse.
            if (hauptgruppeGilt) {
              const hA = hauptgruppeVon(aktiv), hB = hauptgruppeVon(bank[n]);
              if (hA !== null && hA === hB) continue;
            }
            wieviele++;
          }
        }
        passt = wieviele >= (s.mindestens || 1);
      }

      if (passt) treffer.push(s);
    }
    return treffer;
  };

  // Synergien gelten, solange die Lage besteht – sie werden deshalb
  // nicht "gespielt", sondern bei jedem Rundenbeginn neu gesetzt.
  // Alles Alte wird vorher weggeraeumt, sonst summierten sie sich auf.
  Duell.prototype.synergienSetzen = function (spieler) {
    // Erst abraeumen: Boni und Zustaende, die aus Synergien stammen.
    for (let i = spieler.boni.length - 1; i >= 0; i--) {
      if (spieler.boni[i].synergie) spieler.boni.splice(i, 1);
    }
    const alle = this.team(spieler);
    for (let t = 0; t < alle.length; t++) {
      const z = alle[t].zustaende;
      for (let i = z.length - 1; i >= 0; i--) if (z[i].synergie) z.splice(i, 1);
    }
    if (!spieler.arena) return [];

    let treffer = this.synergienVon(spieler);

    // Wie viele Synergien duerfen GLEICHZEITIG gelten? Ohne Grenze
    // stapeln sie sich: In Feuerlande griffen "Verwandte Stoffklasse"
    // (35 % der Runden) und "Brennstoff im Ruecken" (31 %) oft zusammen,
    // dazu noch der metallische Verbund – bei einem Grundschaden von
    // rund 11 sind +10 oder +15 kein Bonus mehr, sondern ein anderes
    // Spiel. Gemessen am 22.08.2026 fiel syntheseLohnt dabei unter NULL.
    const grenze = window.REGELN.appZusatz.synergienMax;
    if (grenze && treffer.length > grenze) treffer = treffer.slice(0, grenze);

    for (let i = 0; i < treffer.length; i++) {
      const w = treffer[i].wirkung || {};
      if (w.art === "schadensbonus") {
        spieler.boni.push({
          art: "schadensbonus", wert: w.wert || 0, typ: w.typ || null,
          rest: Infinity, quelle: treffer[i].name, synergie: true
        });
      } else if (w.art === "schutz") {
        spieler.arena.zustaende.push({
          art: "schutz", gegen: w.gegen || "alle",
          faktor: (w.faktor === undefined ? 1 : w.faktor), minus: w.minus || 0,
          quelle: treffer[i].name, seite: spieler.index, synergie: true
        });
      }
    }
    if (treffer.length) {
      this.melde("synergien", { spieler: spieler, treffer: treffer });
    }
    return treffer;
  };

  // ------------------------------------------------------------
  //  Welche Attacken hat diese Karte?
  //
  //  EINE Stelle, weil zug.index die Attacke ueber ihre POSITION
  //  adressiert und kanal.js genau diesen Index uebertraegt. Gaebe es
  //  zwei Listen, wuerde ein Zug auf dem anderen Geraet eine andere
  //  Attacke ausloesen.
  //
  //  Die App-Attacke steht IMMER hinten – so verschiebt sie die
  //  gedruckten Attacken nicht. Sie gilt nur, wenn appAttacken an ist,
  //  und beide Geraete fahren dieselben appRegeln (Raumhandschlag).
  //
  //  Der Generator liest ausschliesslich "attacken" – "appAttacke"
  //  wird deshalb nicht gedruckt. Genau dafuer ist es ein eigenes Feld.
  // ------------------------------------------------------------
  Duell.prototype.attackenVon = function (karte) {
    const liste = karte.attacken || [];
    if (!this.appRegeln.appAttacken || !karte.appAttacke) return liste;
    return liste.concat([karte.appAttacke]);
  };

  // Trefferquote einer Attacke – NUR in der App (REGELN.appZusatz.treffer).
  // Gibt null zurueck, wenn nicht gewuerfelt wird; dann sitzt der Treffer
  // wie am Tisch. Das ist der Normalfall und ausdruecklich kein Fehler.
  Duell.prototype.trefferQuote = function (attacke, angreifer) {
    const R = window.REGELN;
    if (!this.appRegeln.daneben || !R.appZusatz || !R.appZusatz.treffer) return null;
    // Wirkungsattacken (Zinkpanzer) gehen nicht daneben.
    if (!attacke.schaden || attacke.schaden <= 0) return null;

    // Nebel senkt die Quote dessen, der durch ihn hindurch zielt.
    // Der Zustand haengt am Angreifer – vernebelt ist, wer nichts sieht.
    let nebel = 0;
    if (angreifer && angreifer.arena) {
      const z = angreifer.arena.zustaende;
      for (let i = 0; i < z.length; i++) {
        if (z[i].art === "vernebelt") nebel += z[i].minus || 0;
      }
    }

    // Zwei Formen stehen zur Wahl, und sie schliessen einander aus:
    //
    //   jeTyp   Die Quote haengt am ANGRIFFSTYP. Ein Hieb geht eher
    //           daneben als ein Gas, das sich ausbreitet.
    //   leiter  Die Quote haengt am gedruckten Grundschaden.
    //
    // Gemessen am 22.08.2026 ist das keine Geschmacksfrage: Im
    // Kartensatz reicht der Schaden nur von 5 bis 18 (erlaubt waeren
    // 0 bis 40), und er trennt fast genau Elemente (Mittel 9,6) von
    // Verbindungen (11,4). Eine Schadensleiter ist deshalb in DIESEM
    // Kartensatz kaum etwas anderes als eine Steuer auf das
    // Synthetisieren – und die trifft den Grundsatz des Spiels.
    const t = R.appZusatz.treffer;
    let quote = 1;
    if (t.jeTyp && t.jeTyp[attacke.typ] !== undefined) {
      quote = t.jeTyp[attacke.typ];
    } else {
      const leiter = t.leiter || [];
      for (let i = 0; i < leiter.length; i++) {
        if (attacke.schaden <= leiter[i].bisSchaden) { quote = leiter[i].quote; break; }
      }
    }
    // Nach unten offen bis 0,05: Auch im dichtesten Nebel soll ein
    // Treffer moeglich bleiben, sonst waere die Karte kein Nebel,
    // sondern eine Angriffsperre.
    return Math.max(0.05, quote - nebel);
  };

  Duell.prototype.angreifen = function (spieler, index) {
    const gegner = this.gegner(spieler);
    const attacke = this.attackenVon(spieler.arena.karte)[index];
    if (!attacke) return;

    // Daneben zuerst: Ein Fehlschlag beendet die Rechnung sofort – es
    // gibt keinen Schaden, keine Typen-Matrix, keinen Bonus, keinen
    // Volltreffer und auch KEINE Wirkung. Wer nicht trifft, loest die
    // Reaktion nicht aus; das gilt selbst fuer den Selbstschaden, denn
    // auch Fluor reagiert nur, wenn es sein Ziel erreicht.
    //
    // Der Wurf wird NUR gezogen, wenn die Regel an ist. Ein unbedingt
    // gezogener und dann verworfener Wurf wuerde die ganze Zufallsfolge
    // verschieben – die Tischzahlen waeren ohne jede Regelaenderung
    // andere. Gezogen wird aus this.zufall, nie aus Math.random: Im
    // Netzspiel uebertraegt kanal.js nur die Zuege, beide Geraete
    // rechnen den Verlauf nach.
    const quote = this.trefferQuote(attacke, spieler);
    if (quote !== null && quote < 1 && this.zufall() >= quote) {
      this.melde("daneben", {
        spieler: spieler, ziel: gegner, attacke: attacke, quote: quote
      });
      return;
    }

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
  //
  // Seit dem 24.08.2026 traegt ein Zustand ein Feld "runden": So oft
  // ueberlebt er diesen Augenblick. Ohne das Feld gilt die 1, und dann
  // rechnet diese Stelle auf die Stelle genau wie vorher – Nebel und
  // Gift sind davon also unberuehrt.
  //
  // Synergie-Zustaende sind ausgenommen: Sie werden bei jedem
  // Rundenbeginn ohnehin abgeraeumt und neu gesetzt (synergienSetzen).
  // Ein Zaehler an ihnen waere wirkungslos und wuerde nur verwirren.
  //
  // --- Gesucht wird auf BEIDEN Seiten (Fehler, gefunden 24.08.2026) ---
  // Diese Stelle lief bis heute nur ueber das EIGENE Team. Fuer Schutz
  // ging das auf: Er liegt auf der eigenen Arena. "vernebeln" und
  // "gift" tragen aber ausdruecklich die Seite des ERZEUGERS und
  // liegen auf der Instanz des GEGNERS – sie standen damit in keinem
  // Team, das je durchsucht wurde, und liefen NIE ab.
  //
  // Gemessen: Ein Gift von 5, das einmal wirken soll, kostete ueber
  // acht Zuege 20 LP; der Nebel lag nach acht Zuegen noch da. Der
  // Kommentar an wirkungAnwenden ("haelt genau einen gegnerischen Zug")
  // beschrieb also eine Absicht, keine Wirkung.
  //
  // Das verschiebt die Messwerte vom 23.08.2026 fuer die 15 Gift- und
  // 13 Nebel-Attacken – sie waren dort staerker, als sie sein sollten.
  Duell.prototype.zustaendeAblaufen = function (spieler) {
    const alle = this.team(this.spieler[0]).concat(this.team(this.spieler[1]));
    for (let t = 0; t < alle.length; t++) {
      const instanz = alle[t];
      for (let i = instanz.zustaende.length - 1; i >= 0; i--) {
        const z = instanz.zustaende[i];
        if (z.seite !== spieler.index) continue;
        if (!z.synergie && z.runden > 1) {
          z.runden -= 1;
          this.melde("zustand-haelt", { spieler: spieler, instanz: instanz, zustand: z });
          continue;
        }
        instanz.zustaende.splice(i, 1);
        this.melde("zustand-abgelaufen", { spieler: spieler, instanz: instanz, zustand: z });
      }
    }
  };

  // Dauerwirkung der Karte selbst, ausgeloest am Ende des eigenen Zuges.
  // Kalium etwa reagiert schon mit der Luft und verliert stetig LP.
  // Gilt nur fuer das Elemental in der Arena – auf der Bank ruht es.
  Duell.prototype.dauerwirkungen = function (spieler) {
    if (this.vorbei || !spieler.arena) return;

    // Zuerst die Zustaende am Elemental selbst – Gift wirkt am Ende des
    // Zuges dessen, der vergiftet ist. VOR dem Ablaufen der Zustaende
    // (zustaendeAblaufen laeuft erst beim naechsten Rundenbeginn):
    // Ein Gift, das ablaeuft, bevor es wirkt, waere keines.
    //
    // Rueckwaerts, weil ein toedlicher Zustandsschaden das Elemental
    // erschoepfen und die Arena austauschen kann.
    const zustaende = spieler.arena.zustaende;
    for (let i = zustaende.length - 1; i >= 0; i--) {
      const z = zustaende[i];
      if (z.art !== "zustandsschaden") continue;
      this.melde("zustandsschaden", {
        spieler: spieler, wert: z.wert, quelle: z.quelle
      });
      this.schadenZufuegen(spieler, z.wert, { quelle: spieler, zustand: z });
      if (this.vorbei || !spieler.arena) return;
    }

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
      // Bleibt hier stehen und geht nicht ueber wirkungAnwenden: Es ist
      // die einzige Wirkung, die es schon am Tisch gibt, und sie traegt
      // ihr eigenes Ereignis, an dem der Bildschirm haengt.
      this.melde("wirkung", { spieler: spieler, attacke: attacke, wirkung: wirkung });
      this.schadenZufuegen(spieler, wirkung.wert, {
        quelle: spieler, attacke: attacke, selbstschaden: true
      });
      return;
    }

    // Alles Uebrige laeuft ueber denselben Weg wie die Ausruestung.
    // Das Ziel steht bei einer Attacke nicht im Zug – es ergibt sich
    // aus der Wirkung: Was hilft, hilft dem Angreifer; was schadet,
    // trifft den Getroffenen.
    const gegner = this.gegner(spieler);
    let zielInstanz;
    if (wirkung.ziel === "gegnerArena") zielInstanz = gegner.arena;
    else if (wirkung.ziel === "eigeneArena") zielInstanz = spieler.arena;
    else if (HILFT[wirkung.art]) zielInstanz = spieler.arena;
    else zielInstanz = gegner.arena;

    this.wirkungAnwenden(spieler, wirkung, attacke.name, zielInstanz, "attacke");
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
      // Erst der Faktor (halbieren, loeschen), dann der feste Abzug.
      // "5 Schaden weniger" ist etwas anderes als "halber Schaden", und
      // manche Karten sagen beides – deshalb beide Wege, in dieser
      // Reihenfolge. Vorgabe fuer faktor ist seit dem 22.08.2026 die 1
      // (keine Minderung) statt der 0: Ein Schutz, der nur "minus"
      // meint, soll nicht versehentlich ALLES abfangen. Alle sieben
      // gedruckten Schutzkarten setzen faktor ausdruecklich, an ihnen
      // aendert das nichts.
      schaden = Math.ceil(schaden * (z.faktor === undefined ? 1 : z.faktor));
      if (z.minus) schaden = Math.max(0, schaden - z.minus);
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
  //
  // Seit dem 24.08.2026 rueckt hier NIEMAND mehr nach. Das Regelwerk
  // sagt in Abschnitt 4 "sein Besitzer WAEHLT sofort"; die Engine nahm
  // stattdessen stumm den ersten Bankplatz (bank.shift()). Gewaehlt
  // werden kann hier aber nicht: erschoepfen laeuft mitten in
  // schadenZufuegen, also mitten in der Aufloesung eines fremden Zuges,
  // und die Engine ist anzeigefrei – sie kann niemanden fragen.
  //
  // Deshalb bleibt die Arena leer und der Spieler kommt auf die Liste
  // this.nachruecken. Die Wahl ist danach ein Zug wie jeder andere
  // ({art:"nachruecken", index}) und erbt damit zugPruefen, die
  // Zugnummer und die Pruefsumme – ohne das liefen zwei Netzgeraete
  // auseinander, denn die Bankreihenfolge steckt in KANAL.pruefsumme.
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

    // Die alte Automatik als Messvariante (REGELN.nachrueckenWaehlen).
    if (window.REGELN.nachrueckenWaehlen === false) {
      spieler.arena = spieler.bank.shift();
      this.synergienAktualisieren();
      this.melde("wechsel", { spieler: spieler, instanz: spieler.arena, erzwungen: true });
      return;
    }

    // Nur einmal in der Liste: Ohne Arena kann er kein zweites Mal fallen.
    if (this.nachruecken.indexOf(spieler.index) === -1) {
      this.nachruecken.push(spieler.index);
    }
    // Die Synergien haengen an der Lage, und die Lage hat sich geaendert –
    // ohne Arena setzt synergienSetzen sie ohnehin nur zurueck.
    this.synergienAktualisieren();

    // Hier gemeldet und nicht in fuehreAus: Eine Wahl kann auch mitten
    // in zugBeenden entstehen (Gift, Kalium), und dann kaeme fuehreAus
    // gar nicht mehr an die Stelle. An EINER Stelle heisst: in jedem
    // Fall, egal wer das Elemental umgeworfen hat.
    this.melde("nachruecken-noetig", { spieler: spieler });
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

    this.wirkungAnwenden(spieler, w, karte.name, zielInstanz, "ausruestung");
  };

  // ------------------------------------------------------------
  //  Eine Wirkung ausfuehren – EIN Weg fuer alle Quellen
  //
  //  Bis zum 22.08.2026 stand dieser Rumpf in ausruestungSpielen, und
  //  wirkungAusfuehren (der Weg fuer ATTACKEN) kannte einen einzigen
  //  Zweig. Neun Wirkungsarten waren gebaut und nur ueber die
  //  Ausruestung erreichbar.
  //
  //  Nicht kopiert, sondern herausgeloest: Zwei Fassungen derselben
  //  Regel laufen frueher oder spaeter auseinander – bei den
  //  Klassenfarben ist genau das schon einmal passiert (regeln.js und
  //  generator.html hielten je eine eigene Liste).
  //
  //  quelleName ist der Name der Karte oder Attacke, die wirkt; er
  //  landet in den Zustaenden und Boni, damit der Bildschirm sagen
  //  kann, WORAN es liegt.
  //
  //  herkunft ist "attacke", "ausruestung" oder "synergie". Sie
  //  entscheidet nur EINES: wie lange ein Schutz haelt. Eine
  //  Ausruestungskarte ist GEDRUCKT ("bis zu deinem naechsten Zug") und
  //  darf ohne Neudruck nichts anderes bedeuten; eine App-Attacke steht
  //  auf keinem Druckbogen und darf laenger halten.
  // ------------------------------------------------------------
  Duell.prototype.wirkungAnwenden = function (spieler, w, quelleName, zielInstanz, herkunft) {
    if (!w || !w.art) return;

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
        this.schadenZufuegen(gegner, w.wert || 0, { quelle: spieler, quelleName: quelleName });
      }

    } else if (w.art === "schutz" && zielInstanz) {
      // "faktor" halbiert oder loescht den Schaden, "minus" zieht einen
      // festen Betrag ab. Beides zusammen ist erlaubt; gerechnet wird
      // erst der Faktor, dann der Abzug (schutzAnwenden).
      //
      // Wie lange? Eine Ausruestung gilt bis zum naechsten eigenen Zug –
      // so steht es GEDRUCKT auf der Karte. Eine App-Attacke haelt
      // R.appZusatz.schutzRunden lang; sie steht auf keinem Druckbogen.
      // Ein "runden" an der Wirkung selbst geht in jedem Fall vor.
      // Die zweite Haelfte der Dauer kommt geschenkt: Der Zustand haengt
      // an der INSTANZ, und die geht beim Erschoepfen samt Zustaenden weg.
      const R = window.REGELN;
      const dauer = w.runden ||
        (herkunft === "attacke" && R.appZusatz && R.appZusatz.schutzRunden
          ? R.appZusatz.schutzRunden : 1);
      zielInstanz.zustaende.push({
        art: "schutz", gegen: w.gegen || "alle",
        faktor: (w.faktor === undefined ? 1 : w.faktor),
        minus: w.minus || 0, runden: dauer,
        nurEinmal: !!w.nurEinmal, quelle: quelleName, seite: spieler.index
      });

    } else if (w.art === "schadensbonus") {
      spieler.boni.push({
        art: "schadensbonus", wert: w.wert || 0, typ: w.typ || null,
        rest: w.anzahl || 1, quelle: quelleName
      });
      if (w.gegnerMalus) {
        this.gegner(spieler).boni.push({
          art: "schadensbonus", wert: -w.gegnerMalus, typ: null, rest: 1, quelle: quelleName
        });
      }

    } else if (w.art === "dauerbonus") {
      // "Bleibt liegen" – gilt bis zum Ende des Duells.
      spieler.boni.push({
        art: "schadensbonus", wert: w.wert || 0, typ: w.typ || null,
        rest: Infinity, quelle: quelleName
      });

    // --- Nur in der App: die Wirkungen der App-Attacken ---------
    } else if (w.art === "vernebeln") {
      // Senkt die Trefferquote des GEGNERS bis zu seinem naechsten Zug.
      // Haengt an Mechanik 1: Ohne Trefferquote gibt es nichts zu senken,
      // und dann laeuft die Wirkung folgenlos ins Leere. Das ist kein
      // Fehler – am Tisch gibt es beides nicht.
      const gegnerV = this.gegner(spieler);
      if (gegnerV.arena) {
        // seite ist die des ERZEUGERS, nicht die des Ziels.
        // zustaendeAblaufen raeumt zu Beginn eines Zuges die Zustaende
        // mit DIESER Seite weg – der Nebel haelt damit genau einen
        // gegnerischen Zug lang. Mit der Zielseite waere er schon
        // verfallen, bevor der Gegner ueberhaupt gezogen hat.
        gegnerV.arena.zustaende.push({
          art: "vernebelt", minus: w.minus || 0,
          quelle: quelleName, seite: spieler.index
        });
        this.melde("vernebelt", {
          spieler: spieler, ziel: gegnerV, minus: w.minus || 0, quelle: quelleName
        });
      }

    } else if (w.art === "gift") {
      // Schaden am Ende des naechsten gegnerischen Zuges. Der Zustand
      // haengt an der INSTANZ: Wer auf die Bank wechselt, nimmt ihn mit –
      // ein vergifteter Stoff wird nicht dadurch rein, dass er wartet.
      const gegnerG = this.gegner(spieler);
      if (gegnerG.arena) {
        // seite = Erzeuger, wie beim Nebel. Das Gift wirkt damit am
        // Ende des naechsten gegnerischen Zuges und verfaellt erst,
        // wenn der Vergifter wieder an der Reihe ist – also NACHDEM
        // es gewirkt hat.
        gegnerG.arena.zustaende.push({
          art: "zustandsschaden", wert: w.wert || 0,
          quelle: quelleName, seite: spieler.index
        });
        this.melde("vergiftet", {
          spieler: spieler, ziel: gegnerG, wert: w.wert || 0, quelle: quelleName
        });
      }

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
    this.synergienAktualisieren();
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

    // Lief in diesem Zug schon eine Synthese, ist DIES die zweite –
    // sie geht auf das Konto des Gasbrenners. Der Platin-Katalysator
    // (dauerhaft) zaehlt nicht herunter. Erst hier, damit eine
    // misslungene Synthese nichts kostet.
    if (this.syntheseGenutzt && !spieler.zweiteSyntheseDauerhaft) {
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

    // Die Synthese aendert die Bank staerker als alles andere: Zwei
    // Edukte verschwinden, ein Produkt kommt. Genau hier entscheidet
    // sich, ob Synergien das Synthetisieren bestrafen.
    this.synergienAktualisieren();

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
    zufallsQuelle: zufallsQuelle,
    // Die Namen der App-Regeln, damit Werkstatt und Duellbildschirm
    // ihre Kaestchen daraus bauen und keine zweite Liste pflegen.
    APP_REGELN: APP_REGELN,
    appRegelnLesen: appRegelnLesen
  };
})();
