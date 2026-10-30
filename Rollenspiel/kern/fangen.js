// ============================================================
//  FANGEN – mit Laborgefäßen in vier Stufen
//
//  Seit Fassung 17 (29.10.2026, Vorgabe des Autors): Gefangen wird
//  mit Gefäßen der Grundstufe. Jedes taugt für jeden Stoff, die
//  besseren fangen leichter (siehe GEFAESSE in daten\elementals.js):
//    Reagenzglas ×1 · Erlenmeyerkolben ×1,5 · Rundkolben ×2 ·
//    Quarzampulle fängt immer.
//  Bis Fassung 16 entschied die Stoffform über das Gerät (Tiegelzange
//  für Metalle, Spatel für Pulver). Tiegelzange und Co. sind jetzt
//  Laborgeräte für den Abzug.
//
//  Weiter gilt:
//   · Verbraucht wird ein Gefäß nur beim Erfolg – das Elemental wohnt
//     danach darin. Ausnahme: Ein heftig reagierender Stoff (Feld
//     „heftig“ an der Art) sprengt Reagenzglas und Erlenmeyerkolben
//     beim Fehlschlag. Die Scherben gibt es als Glasbruch zurück.
//   · Wer das Wesen vorher richtig erkannt hat, fängt leichter.
//   · Zustände des Gegners helfen: abgekühlt, gefroren, inert ×2,
//     andere Statusprobleme ×1,5 (seit Fassung 20).
// ============================================================

var FANGEN = (function () {
  "use strict";

  // Grundchance je Seltenheit. Am 25.10.2026 angehoben (vorher 0,35 /
  // 0,25 / 0,15), weil Fangen beim Spielen zu schwer war: Ein häufiges
  // Elemental mit halben LP im Reagenzglas gelingt zu 55 %.
  var GRUND = { haeufig: 0.55, selten: 0.4, sehr_selten: 0.25 };
  var ERKANNT_BONUS = 1.5;
  var HOECHSTENS = 0.9;
  var ERHOLUNG_BEI_FEHLSCHLAG = 0.05;   // Anteil der LP
  var FLUCHT_AB_VERSUCH = 4;
  var FLUCHT_CHANCE = 0.25;

  // Zustände, die das Fangen erleichtern (k.seiten.gegner.status).
  // Seit Fassung 20 wie in Gen 2: Statusprobleme helfen – gefroren und
  // inert ×2, alle anderen ×1,5. Die Kältemischung kühlt ab (×2).
  var ZUSTAND = {
    abgekuehlt: { faktor: 2,   name: "abgekühlt" },
    gefroren:   { faktor: 2,   name: "gefroren" },
    inert:      { faktor: 2,   name: "inert" },
    sonst:      { faktor: 1.5, name: "verbrannt, geladen, korrodiert" }
  };

  // Der stärkste Zustand zählt, sie multiplizieren sich nicht.
  function zustandFaktor(status) {
    var f = 1;
    if (!status) return f;
    if (status.abgekuehlt) f = ZUSTAND.abgekuehlt.faktor;
    if (status.haupt) f = Math.max(f, (ZUSTAND[status.haupt] || ZUSTAND.sonst).faktor);
    return f;
  }

  function chance(k, gefaess) {
    var g = k.seiten.gegner;
    var el = g.gruppe[g.aktiv];
    var art = GEFAESSE[gefaess];
    if (!art) throw new Error("Unbekanntes Gefäß: " + gefaess);
    if (art.immer) return 1;
    var anteil = el.zh / KAMPF.werte(el).zhMax;
    var p = GRUND[ARTEN[el.art].seltenheit] * (1.5 - anteil) * art.faktor * zustandFaktor(g.status);
    if (k.erkannt) p *= ERKANNT_BONUS;
    return Math.max(0, Math.min(HOECHSTENS, p));
  }

  // Führt einen Versuch aus. Schreibt in k.log, setzt k.ende bei
  // Erfolg oder Flucht. Der Vorrat in k.vorrat wird nur beim Erfolg
  // verringert – oder wenn das Gefäß zerspringt.
  function versuch(k, gefaess) {
    var g = k.seiten.gegner;
    var el = g.gruppe[g.aktiv];
    var art = GEFAESSE[gefaess];
    if (!k.wild) { KAMPF.melde(k, { text: "Ein Elemental mit Stoffmeister fängt man nicht." }); return; }
    if (!(k.vorrat[gefaess] > 0)) { KAMPF.melde(k, { text: "Kein " + art.name + " mehr im Gepäck." }); return; }

    var p = chance(k, gefaess);
    KAMPF.melde(k, { text: "Du bietest den Bund an – mit dem " + art.name + "." });
    if (k.zufall() < p) {
      k.vorrat[gefaess]--;
      k.ende = "gefangen";
      k.gefangen = el;
      el.heim = gefaess;
      KAMPF.melde(k, { text: KAMPF.name(k, "gegner") + " nimmt den Bund an und zieht in das Gefäß ein." });
      return;
    }

    var heftig = ARTEN[el.art].heftig;
    if (heftig && !art.haelt) {
      k.vorrat[gefaess]--;
      k.material.glasbruch = (k.material.glasbruch || 0) + 1;
      k.zersprungen = (k.zersprungen || 0) + 1;
      KAMPF.melde(k, { text: "Das " + art.name + " zerspringt! " + heftig + " (+1 Glasbruch)" });
    } else {
      KAMPF.melde(k, { text: "Es entwischt!" });
    }
    var max = KAMPF.werte(el).zhMax;
    el.zh = Math.min(max, el.zh + Math.ceil(max * ERHOLUNG_BEI_FEHLSCHLAG));
    k.fehlversuche++;
    if (k.fehlversuche >= FLUCHT_AB_VERSUCH && k.zufall() < FLUCHT_CHANCE) {
      k.ende = "entkommen";
      KAMPF.melde(k, { text: KAMPF.name(k, "gegner") + " hat genug und verschwindet im Gebüsch." });
    }
  }

  // Kältemischung (Eis und Kochsalz, bis −20 °C): kühlt das wilde
  // Elemental ab, das Fangen gelingt doppelt so leicht. Kostet den Zug.
  function kuehlen(k) {
    var g = k.seiten.gegner;
    if (!k.wild) { KAMPF.melde(k, { text: "Ein Elemental mit Stoffmeister kühlt man nicht ab." }); return; }
    if (!(k.vorrat.kaeltemischung > 0)) { KAMPF.melde(k, { text: "Keine Kältemischung mehr im Gepäck." }); return; }
    if (g.status.abgekuehlt) { KAMPF.melde(k, { text: KAMPF.name(k, "gegner") + " ist schon abgekühlt." }); return; }
    k.vorrat.kaeltemischung--;
    g.status.abgekuehlt = true;
    KAMPF.melde(k, { text: "Die Kältemischung aus Eis und Salz kühlt " + KAMPF.name(k, "gegner").replace(/^Das /, "das ") + " ab. Fangen gelingt jetzt doppelt so leicht." });
  }

  return { chance: chance, versuch: versuch, kuehlen: kuehlen, zustandFaktor: zustandFaktor, GRUND: GRUND, ZUSTAND: ZUSTAND };
})();
