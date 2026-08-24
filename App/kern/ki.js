// ============================================================
//  KI – Kartenpool, Deckbau und die Spiellogik des Computers
//
//  Diese Datei stand bis zum 14.08.2026 in simulation.js. Sie ist
//  dort herausgeloest worden, weil der Duell-Bildschirm genau
//  dieselben vier Dinge braucht:
//
//    poolBis        welche Karten in dieser Region ueberhaupt dabei sind
//    vorratAufteilen  Elementals / Verbindungen / Ausruestung trennen
//    deckBauen      ein Deck, das ein Schueler auch gepackt haette
//    entscheide     was der Computergegner tut
//
//  Zwei Fassungen davon waeren die schlechteste Loesung: Der
//  Uebungsgegner in der App und der Gegner in der Balancing-Rechnung
//  muessen derselbe sein, sonst misst die Werkstatt ein Spiel, das
//  niemand spielt. Deshalb liegt es hier – einmal.
//
//  Kennt wie engine.js KEINE Anzeige. Braucht: engine.js, regeln.js
//  und window.KARTEN_DATEN.
// ============================================================

(function () {
  "use strict";

  const E = window.ENGINE;

  function mischen(liste, zufall) {
    const kopie = liste.slice();
    for (let i = kopie.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      const t = kopie[i]; kopie[i] = kopie[j]; kopie[j] = t;
    }
    return kopie;
  }

  // --- Kumulative Regions-Pools --------------------------------
  // Niemand spielt mit allen 124 Karten. Der Unterricht beginnt mit
  // Feuerlande allein (11 teamfaehige Karten), dann kommt Periodika
  // dazu und so fort. Jede dieser Stufen ist ein eigenes Spiel.
  // "bis" nennt die zuletzt freigeschaltete Region; der Pool ist alles
  // bis einschliesslich dieser Region.
  function regionVon(karte) {
    return karte.region || "Feuerlande";
  }

  function poolBis(karten, bis) {
    if (!bis) return karten;
    const reihenfolge = window.KARTEN_DATEN.meta.regionen;
    const grenze = reihenfolge.indexOf(bis);
    if (grenze === -1) return karten;
    return karten.filter(function (k) {
      return reihenfolge.indexOf(regionVon(k)) <= grenze;
    });
  }

  function stufeZu(bis) {
    return (bis && window.REGELN.regionStufe[bis]) || "I";
  }

  // --- Kartenvorrat sortieren ---------------------------------
  function vorratAufteilen(karten) {
    const ausruestung = [], verbindungen = [], elementals = [];
    for (let i = 0; i < karten.length; i++) {
      const k = karten[i];
      if (E.istAusruestung(k)) { ausruestung.push(k); continue; }
      // Karten mit Synthese kommen nur ueber eine Reaktion ins Spiel –
      // sie stehen zu Beginn auf der Hand, nicht im Team.
      if (k.synthese) { verbindungen.push(k); continue; }
      if ((k.attacken || []).length) elementals.push(k);
    }
    return { ausruestung: ausruestung, verbindungen: verbindungen, elementals: elementals };
  }

  // --- Deck bauen ---------------------------------------------
  // Bildet nach, was ein Schueler packen wuerde: ein Team, dazu
  // Verbindungen, deren Edukte man tatsaechlich dabeihat, und einen
  // Brenner, wenn eine davon Aktivierungsenergie braucht.
  function deckBauen(vorrat, regelsatz, zufall, pflichtkarte) {
    const team = [];
    if (pflichtkarte) team.push(pflichtkarte);
    const uebrige = mischen(vorrat.elementals, zufall);
    for (let i = 0; i < uebrige.length && team.length < regelsatz.team; i++) {
      if (uebrige[i] !== pflichtkarte) team.push(uebrige[i]);
    }

    const teamNamen = team.map(function (k) { return k.name; });

    // Welche Verbindungen sind mit diesem Team ueberhaupt erreichbar?
    //
    // Bis zum 15.08.2026 galt: alle Edukte muessen im START-Team stehen.
    // Das schliesst jede KETTE aus – bei ihr ist ein Edukt selbst eine
    // Verbindung, und die steht zu Beginn nie im Team. Gemessen wurde
    // dadurch ein Spiel ohne Ketten: 26 der 38 Verbindungen tauchten in
    // "nieGebaut" auf, darunter Salzsaeure, Natronlauge, Ethanol und die
    // beiden Finale-Karten. Ab Meisterstufe II erlaubt das Regelwerk
    // Ketten aber ausdruecklich, und ein Schueler baut sein Deck genau so:
    // Er packt das Zwischenprodukt mit ein.
    //
    // Deshalb waechst die Menge der erreichbaren Stoffe hier so lange,
    // wie noch etwas dazukommt – erst die Verbindungen aus reinen
    // Teamkarten, dann die aus jenen und so fort.
    const erreichbar = teamNamen.slice();
    const stufen = [];          // in der Reihenfolge, in der sie baubar werden
    if (regelsatz.syntheseKetten) {
      let gewachsen = true;
      while (gewachsen) {
        gewachsen = false;
        for (let i = 0; i < vorrat.verbindungen.length; i++) {
          const v = vorrat.verbindungen[i];
          if (erreichbar.indexOf(v.name) !== -1) continue;
          const baubar = (v.synthese.edukte || []).every(function (e) {
            return erreichbar.indexOf(e) !== -1;
          });
          if (!baubar) continue;
          erreichbar.push(v.name);
          stufen.push(v);
          gewachsen = true;
        }
      }
    } else {
      // Meisterstufe I: keine Ketten, also nur was direkt aus dem Team geht.
      for (let i = 0; i < vorrat.verbindungen.length; i++) {
        const v = vorrat.verbindungen[i];
        const baubar = (v.synthese.edukte || []).every(function (e) {
          return teamNamen.indexOf(e) !== -1;
        });
        if (baubar) stufen.push(v);
      }
    }

    // Eine Verbindung ohne ihre Vorstufen auf der Hand ist ein toter
    // Kartenplatz. Deshalb wird nicht einzeln gezogen, sondern immer
    // samt allem, was vorher gebaut werden muss.
    const verbindungen = [];
    const inHand = {};
    function mitVorstufen(v) {
      if (inHand[v.name]) return true;
      const noetig = [];
      const edukte = v.synthese.edukte || [];
      for (let e = 0; e < edukte.length; e++) {
        if (teamNamen.indexOf(edukte[e]) !== -1) continue;
        const vor = vorrat.verbindungen.find(function (x) { return x.name === edukte[e]; });
        if (!vor) return false;
        noetig.push(vor);
      }
      for (let n = 0; n < noetig.length; n++) if (!mitVorstufen(noetig[n])) return false;
      if (verbindungen.length >= regelsatz.handVerbindungen) return false;
      inHand[v.name] = true;
      verbindungen.push(v);
      return true;
    }
    const gemischt = mischen(stufen, zufall);
    for (let i = 0; i < gemischt.length &&
                    verbindungen.length < regelsatz.handVerbindungen; i++) {
      const vorher = verbindungen.length;
      if (!mitVorstufen(gemischt[i])) {
        // Zurueckrollen: Eine halbe Kette nuetzt nichts.
        while (verbindungen.length > vorher) delete inHand[verbindungen.pop().name];
      }
    }

    // --- Zweite Exemplare nachlegen (Fassung X) ---------------
    // Das Team oben wurde OHNE Zuruecklegen gezogen und die
    // Verbindungen danach ueber eine Namensmenge geprueft. Beides
    // zusammen uebersieht genau den Fall, um den es geht: Zwei Oxide
    // brauchen ZWEI Sauerstoff, nicht einen. Ohne diesen Schritt
    // baute die KI weiter nur Decks nach der alten Regel – und die
    // Werkstatt haette die neue Moeglichkeit gar nicht gemessen.
    const hoechstensGleiche = window.REGELN.maxGleicheKarten || 1;
    const hoechstensZwillinge = window.REGELN.maxZwillinge === undefined
      ? 99 : window.REGELN.maxZwillinge;
    (function zweiteExemplare() {
      // Was im Duell selbst entsteht, muss nicht im Team liegen.
      const ausReaktion = verbindungen.map(function (v) { return v.name; });
      const offen = team.map(function (k) { return k.name; });
      const fehlen = [];
      for (let i = 0; i < verbindungen.length; i++) {
        const edukte = verbindungen[i].synthese.edukte || [];
        for (let e = 0; e < edukte.length; e++) {
          if (ausReaktion.indexOf(edukte[e]) !== -1) continue;
          const pos = offen.indexOf(edukte[e]);
          if (pos !== -1) offen.splice(pos, 1);
          else fehlen.push(edukte[e]);
        }
      }
      if (!fehlen.length) return;

      // Welche Teamkarten braucht keine der Verbindungen? Die duerfen
      // weichen, wenn kein Platz mehr frei ist.
      function gebraucht(name) {
        return verbindungen.some(function (v) {
          return (v.synthese.edukte || []).indexOf(name) !== -1;
        });
      }

      // Platz 0 ist unantastbar – und zwar auf BEIDEN Seiten.
      //
      // Die Simulation zwingt Seite A eine Pruefkarte ins Team
      // (deckBauen mit pflichtkarte), Seite B baut frei. Wuerde hier
      // nur die Pflichtkarte geschuetzt, haette B beim Tausch eine
      // Freiheit mehr: Steht auf A ausgerechnet die Pruefkarte als
      // einzige entbehrliche Karte da, bekaeme B seinen Zwilling und
      // A nicht – B baut zwei Verbindungen, A eine. Gemessen wurde
      // genau das: Die Kontrollzahl fiel auf 39,8 %, und damit sind
      // laut Werkstatt alle Zahlen darunter wertlos.
      //
      // Weil die Pflichtkarte immer zuerst ins Team geht, ist Platz 0
      // auf A die Pruefkarte und auf B eine beliebige – beide Seiten
      // haben damit genau eine unantastbare Karte.
      // Wie viele Zwillinge liegen schon im Team?
      function zwillingeImTeam() {
        const gezaehlt = {};
        let n = 0;
        for (let i = 0; i < team.length; i++) {
          gezaehlt[team[i].name] = (gezaehlt[team[i].name] || 0) + 1;
          if (gezaehlt[team[i].name] === 2) n++;
        }
        return n;
      }

      for (let f = 0; f < fehlen.length; f++) {
        const name = fehlen[f];
        const karte = vorrat.elementals.find(function (x) { return x.name === name; });
        if (!karte) continue;
        const schon = team.filter(function (k) { return k.name === name; }).length;
        if (schon >= hoechstensGleiche) continue;
        if (schon >= 1 && zwillingeImTeam() >= hoechstensZwillinge) continue;
        if (team.length < regelsatz.team) { team.push(karte); continue; }
        const weg = team.findIndex(function (k, i) {
          return i !== 0 && !gebraucht(k.name);
        });
        if (weg !== -1) team.splice(weg, 1, karte);
      }
    })();

    // Bis Fassung VIII musste hier eine Energiekarte reserviert werden,
    // sonst war die ⚡-Synthese nicht zu zuenden. Seit die Zuendung frei
    // ist, gehoert der Platz den Geraeten – es wird einfach aufgefuellt.
    const ausruestung = [];
    const rest = mischen(vorrat.ausruestung, zufall);
    for (let i = 0; i < rest.length && ausruestung.length < regelsatz.handAusruestung; i++) {
      if (ausruestung.indexOf(rest[i]) === -1) ausruestung.push(rest[i]);
    }

    // Wichtig: Das Team wird gemischt, BEVOR es zurueckgegeben wird.
    // Sonst stuende die gerade geprüfte Karte immer in der Arena und
    // haette dadurch systematisch die Initiative – die Siegquoten
    // wuerden messen, wo eine Karte steht, statt was sie taugt.
    return {
      name: (pflichtkarte ? pflichtkarte.name : teamNamen[0]),
      elementals: mischen(team, zufall),
      ausruestung: ausruestung,
      verbindungen: verbindungen
    };
  }

  // --- Die Spiellogik des Computergegners ---------------------
  // Bewusst schlicht gehalten. Eine schlaue KI wuerde messen, wie gut
  // sie selbst ist; eine schlichte misst, wie gut die KARTEN sind.
  //  strategie: "vorsichtig" – synthetisiert nur, wenn es sich rechnet
  //             "freudig"    – synthetisiert, sobald es möglich ist
  //  Der Vergleich beider beantwortet, ob die Synthese als Handlung gut
  //  ist oder ob nur der Zeitpunkt schlecht gewählt war.
  // Welches der moeglichen Ziele lohnt am meisten? Das mit den
  // wenigsten verbliebenen Lebenspunkten – bei Heilung wie bei
  // Schutz ist das dasselbe Elemental.
  function bestesZiel(duell, ziele) {
    if (!ziele || !ziele.length) return null;
    let bestes = ziele[0], wenigste = Infinity;
    for (let i = 0; i < ziele.length; i++) {
      const instanz = duell.instanzAn(ziele[i]);
      if (instanz && instanz.lp < wenigste) { wenigste = instanz.lp; bestes = ziele[i]; }
    }
    return bestes;
  }

  // Was ist eine Wirkung ungefähr wert, in Schaden gerechnet?
  // Bewusst grob — wie der Rest dieser Spiellogik. Ohne eine solche
  // Schätzung würde eine App-Attacke mit `schaden: 0` NIE gewählt, und
  // die Werkstatt würde ein Spiel messen, in dem es sie gar nicht gibt.
  // Das ist derselbe blinde Fleck wie beim Volltreffer, eine Ebene höher.
  // Liegt an dieser Instanz schon ein Zustand dieser Art?
  function hatZustand(instanz, art, gegen) {
    if (!instanz) return false;
    return (instanz.zustaende || []).some(function (z) {
      return z.art === art && (gegen === undefined || z.gegen === gegen);
    });
  }

  // Wer rückt nach? Seit dem 24.08.2026 wählt der Besitzer (Regelwerk
  // Abschnitt 4), also muss auch der Bot wählen können.
  //
  // Bewusst NICHT über `erwartung` aus entscheide(): Die Arena ist hier
  // leer, und erwartung() steht in entscheide erst hinter dem Zugriff
  // auf `spieler.arena.karte`. Diese Rechnung ist die schlichtere — reiner
  // Erwartungsschaden gegen das, was drüben steht, ohne Wirkungswerte.
  // Sie ist damit auch die einzige, die Schritt 4 in entscheide NICHT
  // verändert; dessen Zahlen bleiben, was sie gemessen waren.
  function besterBankplatz(duell, spieler, gegner) {
    let bestes = 0, besterWert = -1;
    for (let b = 0; b < spieler.bank.length; b++) {
      const instanz = spieler.bank[b];
      let wert = 0;
      if (gegner.arena) {
        const attacken = duell.attackenVon
          ? duell.attackenVon(instanz.karte)
          : (instanz.karte.attacken || []);
        for (let i = 0; i < attacken.length; i++) {
          const s = E.schadenBerechnen(attacken[i], gegner.arena.karte).schaden;
          const q = duell.trefferQuote ? duell.trefferQuote(attacken[i], spieler) : null;
          const roh = q === null ? s : s * q;
          if (roh > wert) wert = roh;
        }
      }
      // Die Lebenspunkte entscheiden bei Gleichstand – und allein dann,
      // wenn drüben auch niemand steht. Klein genug, um den Schaden
      // nicht zu überstimmen: 40 LP wiegen 4.
      wert += instanz.lp / 10;
      if (wert > besterWert) { besterWert = wert; bestes = b; }
    }
    return bestes;
  }

  function wirkungWert(w, spieler, gegner) {
    if (!w) return 0;
    // Grobes Maß für „ein Schlag" in diesem Spiel: zehn Schaden.
    const SCHLAG = 10;
    if (w.art === "heilung") {
      // Heilung über die volle LP-Zahl hinaus ist verschenkt.
      const fehlt = spieler.arena ? spieler.arena.maxLp - spieler.arena.lp : 0;
      return Math.min(w.wert || 0, fehlt);
    }
    if (w.art === "schutz") {
      // Einen Schutz erneuern, der noch liegt, bringt nichts.
      if (hatZustand(spieler.arena, "schutz", w.gegen || "alle")) return 0;

      // Verhinderter Schaden ist gewonnener Schaden – aber nur, WENN
      // der Gegner im nächsten Zug wirklich mit diesem Typ angreift.
      // Führt er zwei Attacken und nur eine davon ist Feuer, ist ein
      // Feuerschutz ungefähr die Hälfte wert.
      //
      // Ohne diese Gewichtung überschätzt der Bot jeden Schutz und
      // spielt ihn statt anzugreifen. Gemessen am 22.08.2026 endeten so
      // 18 von 400 Feuerlande-Duellen im Zuglimit: Beide Seiten deckten
      // ab, keine machte Schaden.
      let anteil = 1;
      if (w.gegen && w.gegen !== "alle" && gegner.arena) {
        const alle = gegner.arena.karte.attacken || [];
        const passend = alle.filter(function (a) { return a.typ === w.gegen; });
        if (!alle.length || !passend.length) return 0;
        anteil = passend.length / alle.length;
      }
      const wert = (w.minus || 0) +
        (w.faktor !== undefined && w.faktor < 1 ? SCHLAG * (1 - w.faktor) : 0);

      // Wie oft greift der Schutz? Seit dem 24.08.2026 hält der einer
      // App-Attacke mehrere Runden (REGELN.appZusatz.schutzRunden), und
      // ohne diese Zeile bliebe die Bewertung bei einer einzigen —
      // dann spielte der Bot die Karte weiter nie und die Werkstatt
      // maße ein Spiel, das niemand spielt. Genau der blinde Fleck, der
      // beim Volltreffer ein halbes Balancing gekostet hat.
      //
      // GEDECKELT auf drei, und das ist kein runder Wert, sondern die
      // Lehre vom 22.08.2026: Ein überschätzter Schutz führt dazu, dass
      // beide Seiten nur noch abdecken — damals endeten so 18 von 400
      // Feuerlande-Duellen im Zuglimit. Die Zahl „Duelle im Zuglimit"
      // ist die Kontrollzahl für diese Zeile.
      //
      // Bei der geltenden Regel (schutzRunden: 2) greift der Deckel
      // nicht. Er steht trotzdem: Wer den Wert hochdreht, um etwas
      // auszuprobieren, soll den Bot nicht zugleich in die Deckungsfalle
      // schicken und dann die Zahlen falsch lesen.
      const R = window.REGELN;
      let runden = w.runden ||
        ((R.appZusatz && R.appZusatz.schutzRunden) ? R.appZusatz.schutzRunden : 1);
      if (runden > 3) runden = 3;

      return wert * anteil * runden;
    }
    if (w.art === "vernebeln") {
      if (hatZustand(gegner.arena, "vernebelt")) return 0;
      return (w.minus || 0) * SCHLAG;
    }
    if (w.art === "gift") {
      if (hatZustand(gegner.arena, "zustandsschaden")) return 0;
      return w.wert || 0;
    }
    // selbstschaden bleibt bei 0 – ausdrücklich, nicht aus Versehen.
    // Es ist die EINZIGE Wirkung, die es schon am Tisch gibt (Phosphor,
    // Fluor, Salzsäure). Würde der Bot sie hier mit −5 bewerten, spielte
    // er das gedruckte Spiel anders als bisher, und sämtliche
    // Vergleichszahlen dieses Projekts verschöben sich still — gemessen
    // am 22.08.2026 in Periodika (Angriffe 112 938 → 112 952,
    // vorsprung 9,76 → 9,79 %).
    //
    // Dass der Bot Selbstschaden ignoriert, ist eine alte Vereinfachung.
    // Sie zu beheben wäre eine eigene Änderung mit eigener Messung — und
    // nicht eine, die sich nebenbei in eine App-Regel einschleicht.
    if (w.art === "selbstschaden") return 0;
    return 0;
  }

  function entscheide(duell, spieler, strategie) {
    const gegner = duell.gegner(spieler);

    // Ganz oben, VOR jedem Zugriff auf spieler.arena: Steht eine
    // Nachrück-Wahl aus, ist die Arena leer und es gibt genau einen
    // erlaubten Zug — die Wahl von der Bank.
    if (duell.nachruecken && duell.nachruecken.length &&
        duell.nachruecken[0] === spieler.index) {
      return { art: "nachruecken", index: besterBankplatz(duell, spieler, gegner) };
    }

    // Über attackenVon, nicht über karte.attacken: In der App hängt an
    // manchen Verbindungen eine zusätzliche Attacke, und zug.index
    // adressiert die Attacke über ihre Position.
    const attacken = duell.attackenVon
      ? duell.attackenVon(spieler.arena.karte)
      : (spieler.arena.karte.attacken || []);

    // Gewählt wird nach dem ERWARTUNGSWERT, nicht nach dem Rohschaden:
    // Schaden × Trefferquote. Ohne das würde der Bot in der App stets
    // die große ungenaue Attacke nehmen, und die Werkstatt würde ein
    // Spiel messen, das so niemand spielt — derselbe blinde Fleck wie
    // beim Volltreffer, nur eine Ebene höher.
    //
    // Am Tisch liefert trefferQuote null, dann ist der Erwartungswert
    // der Schaden selbst und diese Zeile ändert nichts.
    function erwartung(attacke) {
      const s = E.schadenBerechnen(attacke, gegner.arena.karte).schaden;
      const q = duell.trefferQuote ? duell.trefferQuote(attacke, spieler) : null;
      const roh = q === null ? s : s * q;
      // Die Wirkung zählt mit. Sie geht NICHT mit der Trefferquote
      // herunter: Eine Attacke ohne Schaden würfelt gar nicht erst,
      // und wo doch gewürfelt wird, fällt bei einem Fehlschlag ohnehin
      // beides aus.
      return { schaden: s, wert: roh + wirkungWert(attacke.wirkung, spieler, gegner) };
    }

    // Zwei verschiedene Fragen, also zwei Sieger:
    //   besteAttacke   höchster Erwartungswert – der Zug für den Alltag
    //   toedlichste    höchster ROHSCHADEN – die Frage "kann ich den
    //                  Gegner jetzt erschöpfen?"
    // Beides zu vermengen kostet Abschlüsse: Eine 11er-Attacke mit 90 %
    // hat den kleineren Erwartungswert als eine 10er mit 100 %, ist aber
    // die einzige, die einen Gegner mit 11 LP noch umwirft.
    let besteAttacke = -1, besterWert = -1;
    let toedlichste = -1, hoechsterSchaden = -1;
    for (let i = 0; i < attacken.length; i++) {
      const e = erwartung(attacken[i]);
      if (e.wert > besterWert) { besterWert = e.wert; besteAttacke = i; }
      if (e.schaden > hoechsterSchaden) { hoechsterSchaden = e.schaden; toedlichste = i; }
    }
    const besterSchaden = hoechsterSchaden;

    // 1. Lässt sich das Duell jetzt entscheiden?
    //    Hier zählt der volle Schaden, nicht der Erwartungswert: Eine
    //    Attacke, die den Gegner erschöpfen KANN, ist den Versuch wert,
    //    auch wenn sie nur zu 80 % trifft — sie kann höchstens danebengehen.
    if (besterSchaden > 0 && besterSchaden >= gegner.arena.lp) {
      return { art: "angriff", index: toedlichste };
    }

    // 1b. Ausrüstung, die JETZT den Ausschlag gibt.
    //     Bewusst schlicht gehalten – wie der Rest dieser Spiellogik.
    //     Sie soll messen, was die Karten taugen, nicht wie klug sie
    //     ausgespielt werden. Drei Fälle, mehr nicht:
    //       a) Direktschaden, der das gegnerische Elemental erschöpft
    //       b) Heilung, wenn das eigene unter der Hälfte steht
    //       c) Schutz, wenn das eigene unter der Hälfte steht
    //       d) Gasbrenner, aber nur wenn die erste Synthese schon
    //          gelaufen ist und noch eine zweite offen steht – sonst
    //          wirft er die Karte für nichts weg.
    const items = duell.moeglicheAusruestung ? duell.moeglicheAusruestung(spieler) : [];
    const syntheseMoeglich = duell.moeglicheSynthesen(spieler).length > 0;
    const braucht = spieler.arena.lp <= spieler.arena.maxLp / 2;

    for (let i = 0; i < items.length; i++) {
      const zug = items[i];
      const karte = spieler.hand.ausruestung[zug.index];
      const w = karte.wirkung || {};

      let nehmen = false;
      if (w.art === "direktschaden" && (w.wert || 0) >= gegner.arena.lp) nehmen = true;
      else if ((w.art === "heilung" || w.art === "schutz") && braucht) nehmen = true;
      else if (w.art === "zweiteSynthese") {
        nehmen = duell.syntheseGenutzt && syntheseMoeglich &&
                 !duell.darfZweiteSynthese(spieler);
      }
      if (!nehmen) continue;

      // Ein Zug ohne Ziel wirft die Karte weg. Also wird hier eines
      // gewählt: das eigene Elemental, dem am meisten fehlt.
      return { art: "ausruestung", index: zug.index, ziele: zug.ziele,
               ziel: zug.ziel || bestesZiel(duell, zug.ziele) };
    }

    // 2. Synthese – aber nur, wenn sie sich lohnt. Sie kostet zwei
    //    Elementals und bringt eines zurück: das Team schrumpft.
    //
    //    Mit Bank-Synergien kostet sie unter Umständen MEHR als das:
    //    Wer zwei Elemente derselben Hauptgruppe verschmilzt, verliert
    //    womöglich die Synergie, die genau daraus entstand. Der
    //    vorsichtige Bot rechnet das mit — der freudige nicht, denn er
    //    soll spielen wie ein Kind, das synthetisiert, sobald es geht.
    const synthesen = duell.moeglicheSynthesen(spieler);
    if (strategie === "freudig" && synthesen.length) return synthesen[0];
    const synergienJetzt = duell.synergienVon ? duell.synergienVon(spieler).length : 0;
    for (let i = 0; i < synthesen.length; i++) {
      const s = synthesen[i];
      const verbindung = spieler.hand.verbindungen[s.index];
      const exotherm = verbindung.synthese.exotherm || 0;
      if (exotherm > 0 && exotherm >= gegner.arena.lp) return s;      // beendet den Gegner
      const lpEdukte = s.edukteImTeam.reduce(function (a, x) { return a + x.lp; }, 0);
      // Eine verlorene Synergie wiegt ungefähr wie 5 LP je Runde. Grob
      // gerechnet mit zehn verbleibenden Runden: fünfzig LP wären zu
      // viel, ein einzelner Wert von 10 LP trifft es besser.
      const synergieVerlust = synergienJetzt * 10;
      if (lpEdukte + synergieVerlust <= verbindung.lp) return s;      // unterm Strich mehr LP
    }

    // 3. Angreifen, solange es überhaupt wirkt
    if (besterSchaden > 0 && !spieler.angriffGesperrt) {
      return { art: "angriff", index: besteAttacke };
    }

    // 4. Sonst wechseln – vielleicht trifft ein anderes Elemental besser.
    //    Auch hier der Erwartungswert: Ein Wechsel auf eine Karte, die
    //    hart, aber selten trifft, ist keine Verbesserung.
    let bestesBank = -1, bankWert = 0;
    for (let b = 0; b < spieler.bank.length; b++) {
      const bAttacken = duell.attackenVon
        ? duell.attackenVon(spieler.bank[b].karte)
        : (spieler.bank[b].karte.attacken || []);
      for (let i = 0; i < bAttacken.length; i++) {
        const w = erwartung(bAttacken[i]).wert;
        if (w > bankWert) { bankWert = w; bestesBank = b; }
      }
    }
    if (bestesBank !== -1) return { art: "wechsel", index: bestesBank };

    // 5. Notausgang. Wichtig, seit es die Duftphiole gibt: Wer nicht
    //    angreifen DARF, dessen Angriffszug wird vom Bildschirm
    //    verworfen – und dann stünde das Duell für immer still.
    //    Also nie einen Zug zurückgeben, den es nicht gibt.
    const alle = duell.moeglicheZuege(spieler);
    if (!alle.length) return null;
    for (let i = 0; i < alle.length; i++) {
      if (alle[i].art === "angriff") return alle[i];
    }
    return alle[0];
  }

  window.KI = {
    mischen: mischen,
    regionVon: regionVon,
    poolBis: poolBis,
    stufeZu: stufeZu,
    vorratAufteilen: vorratAufteilen,
    deckBauen: deckBauen,
    entscheide: entscheide
  };
})();
