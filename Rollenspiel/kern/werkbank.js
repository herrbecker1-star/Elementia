// ============================================================
//  WERKBANK – Stoffe mit Werkzeugen prüfen und bestimmen (Minispiel)
//
//  Reine Logik ohne Phaser, im Prüfstand testbar. Die Szene
//  spiel\werkbank.js zeigt nur an, was hier entschieden wird.
//
//  Ersetzt seit 25.10.2026 Maras Kisten als Auswahlliste: Man prüft
//  eine Probe mit Lupe, Magnet, Lämpchen und Hammer und legt sie dann
//  zum passenden Stoff. Die Befundtexte stammen aus derselben Quelle
//  wie „Untersuchen“ im Kampf (KAMPF.befundText).
//
//  Beim ersten Fehlgriff nennt Mara den Widerspruch zu dem, was man
//  schon geprüft hat – oder sagt, welches Werkzeug weiterhilft. Beim
//  zweiten nennt sie die Lösung. Eine Sackgasse gibt es nicht.
// ============================================================

var WERKBANK = (function () {
  "use strict";

  // Welches Werkzeug welche Eigenschaft zeigt – wie WERKZEUGE in daten\elementals.js
  var WERKZEUG_EIG = { lupe: ["farbe", "glanz"], magnet: ["magnetisch"], stromkreis: ["leitfaehig"], hammer: ["verformbar"] };
  var WERKZEUG_FUER = { farbe: "lupe", glanz: "lupe", magnetisch: "magnet", leitfaehig: "stromkreis", verformbar: "hammer" };

  function neu(proben) {
    return { proben: proben, nr: 0, befunde: {}, fehler: 0, fertig: false };
  }

  function probe(w) { return w.proben[w.nr]; }

  // Ein Werkzeug anwenden: liefert die Befunde [{ eig, wert, text }]
  function pruefe(w, werkzeug) {
    var stoff = ARTEN[probe(w).stoff];
    return (WERKZEUG_EIG[werkzeug] || []).map(function (eig) {
      var wert = stoff.steckbrief[eig];
      w.befunde[eig] = wert;
      return { eig: eig, wert: wert, text: KAMPF.befundText(eig, wert) };
    });
  }

  // Eine Vermutung abgeben. Liefert { richtig, text, weiter }.
  // weiter = true heißt: diese Probe ist erledigt (richtig oder aufgelöst).
  function bestimme(w, vermutung) {
    var p = probe(w), wahr = ARTEN[p.stoff], vermutet = ARTEN[vermutung];
    if (vermutung === p.stoff) {
      naechste(w);
      return { richtig: true, weiter: true, text: p.lob || "Richtig – " + wahr.name + "." };
    }
    w.fehler++;
    if (w.fehler >= 2) {
      naechste(w);
      return { richtig: false, weiter: true, text: "Wieder nicht. Es ist " + wahr.name + "." };
    }
    // Widerspruch zu einem schon gefundenen Befund?
    // Das deutlichste Zeichen zuerst: Magnet, Strom, Hammer – die Farbe zuletzt
    var widerspruch = ["magnetisch", "leitfaehig", "verformbar", "glanz", "farbe"].filter(function (eig) {
      return w.befunde[eig] !== undefined && vermutet.steckbrief[eig] !== w.befunde[eig];
    })[0];
    if (widerspruch) {
      return { richtig: false, weiter: false, text: "Nein. " + vermutet.name + " wäre anders: " + KAMPF.befundText(widerspruch, vermutet.steckbrief[widerspruch]) };
    }
    // Noch nichts geprüft, was die beiden unterscheidet – dann einen Tipp geben
    var unterschied = ["magnetisch", "leitfaehig", "verformbar", "glanz", "farbe"].filter(function (eig) { return vermutet.steckbrief[eig] !== wahr.steckbrief[eig]; })[0];
    var werkzeug = WERKZEUGE[WERKZEUG_FUER[unterschied]].name;
    return { richtig: false, weiter: false, text: "Nein. Prüf es mit " + werkzeug + " – dann siehst du den Unterschied." };
  }

  function naechste(w) {
    w.nr++; w.befunde = {}; w.fehler = 0;
    if (w.nr >= w.proben.length) w.fertig = true;
  }

  return { neu: neu, probe: probe, pruefe: pruefe, bestimme: bestimme, WERKZEUG_EIG: WERKZEUG_EIG };
})();
