// ============================================================
//  FANGEN – mit Laborgeräten, die zum Stoff passen müssen
//
//  Entscheidung des Autors (24.09.2026):
//   · Welches Gerät taugt, bestimmen die Stoffeigenschaften.
//   · Verbraucht wird ein Gerät NUR beim Erfolg – das Elemental
//     wohnt danach darin. Ein Fehlschlag kostet den Zug, nicht das
//     Gerät. So bleibt das Inventar klein.
//   · Wer das Wesen vorher richtig erkannt hat, fängt leichter.
//
//  Die Gründe stehen als Text an jeder Regel: Sie erscheinen im
//  Kampf, wenn ein Versuch am falschen Gerät scheitert. Die Regel
//  soll man am Ergebnis lernen, nicht aus einer Tafel.
// ============================================================

var FANGEN = (function () {
  "use strict";

  // Grundchance je Seltenheit – vorläufig, gemessen im Prüfstand.
  var GRUND = { haeufig: 0.35, selten: 0.25, sehr_selten: 0.15 };
  var ERKANNT_BONUS = 1.5;
  var HOECHSTENS = 0.9;
  var ERHOLUNG_BEI_FEHLSCHLAG = 0.05;   // Anteil des Zusammenhalts
  var FLUCHT_AB_VERSUCH = 3;
  var FLUCHT_CHANCE = 0.35;

  // Eignung: Faktor und der Satz, der sie begründet.
  function eignung(geraet, artId) {
    var art = ARTEN[artId];
    var metall = art.klasse === "Metall";
    var pulver = art.form === "pulver";
    switch (geraet) {
      case "reagenzglas":
        return { faktor: 1, grund: "Das Reagenzglas taugt für jeden festen Stoff – für keinen besonders gut." };
      case "tiegelzange":
        if (metall) return { faktor: 2, grund: "Ein Metallstück greift man sicher mit der Tiegelzange." };
        if (pulver) return { faktor: 0.3, grund: "Pulver rieselt zwischen den Backen der Zange hindurch." };
        return { faktor: 0.6, grund: "Der spröde Brocken zerbröselt in der Zange." };
      case "spatel":
        if (pulver) return { faktor: 2, grund: "Pulver portioniert man mit dem Spatellöffel." };
        if (!metall) return { faktor: 1.5, grund: "Spröde Brocken lassen sich mit dem Spatel gut aufnehmen." };
        return { faktor: 0.5, grund: "Ein zähes Metallstück lässt sich nicht löffeln." };
    }
    throw new Error("Unbekanntes Fanggerät: " + geraet);
  }

  function chance(k, geraet) {
    var g = k.seiten.gegner;
    var el = g.gruppe[g.aktiv];
    var anteil = el.zh / KAMPF.grundwerte(el.art, el.stufe).zhMax;
    var p = GRUND[ARTEN[el.art].seltenheit] * (1.5 - anteil) * eignung(geraet, el.art).faktor;
    if (k.erkannt) p *= ERKANNT_BONUS;
    return Math.max(0, Math.min(HOECHSTENS, p));
  }

  // Führt einen Versuch aus. Schreibt in k.log, setzt k.ende bei
  // Erfolg oder Flucht. Der Vorrat in k.vorrat wird nur beim Erfolg
  // verringert.
  function versuch(k, geraet) {
    var g = k.seiten.gegner;
    var el = g.gruppe[g.aktiv];
    var name = FANGGERAETE[geraet].name;
    if (!k.wild) { k.log.push({ text: "Ein Elemental mit Stoffmeister fängt man nicht." }); return; }
    if (!(k.vorrat[geraet] > 0)) { k.log.push({ text: "Kein " + name + " mehr im Gepäck." }); return; }

    var p = chance(k, geraet);
    k.log.push({ text: "Du bietest den Bund an – mit " + name + "." });
    if (k.zufall() < p) {
      k.vorrat[geraet]--;
      k.ende = "gefangen";
      k.gefangen = el;
      el.heim = geraet;
      k.log.push({ text: KAMPF.name(k, "gegner") + " nimmt den Bund an und zieht in " + (geraet === "tiegelzange" ? "den Tiegel" : "das Gefäß") + " ein." });
      return;
    }

    var e = eignung(geraet, el.art);
    k.log.push({ text: e.faktor < 1 ? "Es entwischt! " + e.grund : "Es entwischt!" });
    var max = KAMPF.grundwerte(el.art, el.stufe).zhMax;
    el.zh = Math.min(max, el.zh + Math.ceil(max * ERHOLUNG_BEI_FEHLSCHLAG));
    k.fehlversuche++;
    if (k.fehlversuche >= FLUCHT_AB_VERSUCH && k.zufall() < FLUCHT_CHANCE) {
      k.ende = "entkommen";
      k.log.push({ text: KAMPF.name(k, "gegner") + " hat genug und verschwindet im Gebüsch." });
    }
  }

  return { eignung: eignung, chance: chance, versuch: versuch, GRUND: GRUND };
})();
