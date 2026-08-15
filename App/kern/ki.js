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
    const passend = vorrat.verbindungen.filter(function (v) {
      return (v.synthese.edukte || []).every(function (e) { return teamNamen.indexOf(e) !== -1; });
    });

    const verbindungen = mischen(passend, zufall).slice(0, regelsatz.handVerbindungen);

    const ausruestung = [];
    const brauchtEnergie = verbindungen.some(function (v) { return v.synthese.aktivierung; });
    if (brauchtEnergie) {
      const energie = vorrat.ausruestung.filter(E.istEnergie);
      if (energie.length) ausruestung.push(mischen(energie, zufall)[0]);
    }
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

  function entscheide(duell, spieler, strategie) {
    const gegner = duell.gegner(spieler);
    const attacken = spieler.arena.karte.attacken || [];

    let besteAttacke = -1, besterSchaden = -1;
    for (let i = 0; i < attacken.length; i++) {
      const s = E.schadenBerechnen(attacken[i], gegner.arena.karte).schaden;
      if (s > besterSchaden) { besterSchaden = s; besteAttacke = i; }
    }

    // 1. Lässt sich das Duell jetzt entscheiden?
    if (besterSchaden > 0 && besterSchaden >= gegner.arena.lp) {
      return { art: "angriff", index: besteAttacke };
    }

    // 1b. Ausrüstung, die JETZT den Ausschlag gibt.
    //     Bewusst schlicht gehalten – wie der Rest dieser Spiellogik.
    //     Sie soll messen, was die Karten taugen, nicht wie klug sie
    //     ausgespielt werden. Drei Fälle, mehr nicht:
    //       a) Direktschaden, der das gegnerische Elemental erschöpft
    //       b) Heilung, wenn das eigene unter der Hälfte steht
    //       c) Schutz, wenn das eigene unter der Hälfte steht
    //     Eine Energiekarte wird NIE für den Schadensbonus verheizt,
    //     solange eine Synthese möglich ist: Die Reaktion ist der
    //     Kern des Spiels und ein Bonus von 5 wiegt sie nicht auf.
    const items = duell.moeglicheAusruestung ? duell.moeglicheAusruestung(spieler) : [];
    const syntheseMoeglich = duell.moeglicheSynthesen(spieler).length > 0;
    const braucht = spieler.arena.lp <= spieler.arena.maxLp / 2;

    for (let i = 0; i < items.length; i++) {
      const zug = items[i];
      const karte = spieler.hand.ausruestung[zug.index];
      const w = karte.wirkung || {};
      if (E.istEnergie(karte) && syntheseMoeglich) continue;

      let nehmen = false;
      if (w.art === "direktschaden" && (w.wert || 0) >= gegner.arena.lp) nehmen = true;
      else if ((w.art === "heilung" || w.art === "schutz") && braucht) nehmen = true;
      if (!nehmen) continue;

      // Ein Zug ohne Ziel wirft die Karte weg. Also wird hier eines
      // gewählt: das eigene Elemental, dem am meisten fehlt.
      return { art: "ausruestung", index: zug.index, ziele: zug.ziele,
               ziel: zug.ziel || bestesZiel(duell, zug.ziele) };
    }

    // 2. Synthese – aber nur, wenn sie sich lohnt. Sie kostet zwei
    //    Elementals und bringt eines zurück: das Team schrumpft.
    const synthesen = duell.moeglicheSynthesen(spieler);
    if (strategie === "freudig" && synthesen.length) return synthesen[0];
    for (let i = 0; i < synthesen.length; i++) {
      const s = synthesen[i];
      const verbindung = spieler.hand.verbindungen[s.index];
      const exotherm = verbindung.synthese.exotherm || 0;
      if (exotherm > 0 && exotherm >= gegner.arena.lp) return s;      // beendet den Gegner
      const lpEdukte = s.edukteImTeam.reduce(function (a, x) { return a + x.lp; }, 0);
      if (lpEdukte <= verbindung.lp) return s;                        // unterm Strich mehr LP
    }

    // 3. Angreifen, solange es überhaupt wirkt
    if (besterSchaden > 0 && !spieler.angriffGesperrt) {
      return { art: "angriff", index: besteAttacke };
    }

    // 4. Sonst wechseln – vielleicht trifft ein anderes Elemental besser
    let bestesBank = -1, bankSchaden = 0;
    for (let b = 0; b < spieler.bank.length; b++) {
      const bAttacken = spieler.bank[b].karte.attacken || [];
      for (let i = 0; i < bAttacken.length; i++) {
        const s = E.schadenBerechnen(bAttacken[i], gegner.arena.karte).schaden;
        if (s > bankSchaden) { bankSchaden = s; bestesBank = b; }
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
