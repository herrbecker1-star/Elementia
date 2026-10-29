// ============================================================
//  HANDEL – Markt, Fundstellen, Gefäße herstellen (seit Fassung 17)
//
//  Reine Logik, kein Phaser. Läuft genauso im Prüfstand.
//
//  Vorgabe des Autors (29.10.2026): Geld ist keine knappe Ressource.
//  Man verdient es mit Fleiß – Siege gegen Stoffmeister und Verkauf
//  von Glasbruch. Darum sind die Preise niedrig, und die Fundstellen
//  füllen sich jeden Spieltag wieder.
//
//  Höhere Gefäße kauft man nicht, man stellt sie her: am Labortisch,
//  aus Glasbruch (oder Quarz), über dem Bunsenbrenner.
// ============================================================

var HANDEL = (function () {
  "use strict";

  var WAEHRUNG = "Taler";

  // Preise in Talern. Nur was hier steht, gibt es am Markt.
  var PREISE = {
    reagenzglas:    { kauf: 10 },
    kaeltemischung: { kauf: 15 },
    glasbruch:      { verkauf: 5 }
  };

  // Was jeder Marktstand führt
  var MAERKTE = {
    stoffingen: ["reagenzglas", "kaeltemischung", "glasbruch"],
    brenner:    ["reagenzglas", "kaeltemischung", "glasbruch"]
  };

  // Gefäße und Verbrauchsgüter liegen im Vorrat, Glasbruch und Quarz im Material.
  function fach(stand, id) {
    if (GEFAESSE[id] || (WAREN[id] && WAREN[id].vorrat)) return stand.vorrat;
    return stand.material;
  }
  function besitz(stand, id) { return fach(stand, id)[id] || 0; }
  function dazu(stand, id, n) { var f = fach(stand, id); f[id] = (f[id] || 0) + n; }

  function kaufen(stand, id) {
    var p = PREISE[id];
    if (!p || !p.kauf) return { ok: false, text: sachName(id) + " gibt es hier nicht zu kaufen." };
    if ((stand.geld || 0) < p.kauf) return { ok: false, text: "Dafür reicht dein Geld nicht. Glasbruch aus dem Kolbenwald kannst du verkaufen." };
    stand.geld -= p.kauf;
    dazu(stand, id, 1);
    return { ok: true, text: "1× " + sachName(id) + " für " + p.kauf + " " + WAEHRUNG + "." };
  }

  // Verkauft alles von einer Sorte
  function verkaufen(stand, id) {
    var p = PREISE[id], n = besitz(stand, id);
    if (!p || !p.verkauf) return { ok: false, text: sachName(id) + " kauft hier niemand." };
    if (!n) return { ok: false, text: "Du hast keinen " + sachName(id) + "." };
    fach(stand, id)[id] = 0;
    stand.geld = (stand.geld || 0) + n * p.verkauf;
    return { ok: true, text: n + "× " + sachName(id) + " verkauft: +" + n * p.verkauf + " " + WAEHRUNG + "." };
  }

  // Ein Gefäß am Labortisch herstellen
  function herstellen(stand, id) {
    var g = GEFAESSE[id];
    if (!g || !g.aus) return { ok: false, text: sachName(id) + " kann man nicht herstellen." };
    if (stand.werkzeuge.indexOf("gasbrenner") < 0) return { ok: false, text: "Glas schmilzt erst in einer heißen Flamme. Dafür brauchst du einen Bunsenbrenner." };
    var fehlt = Object.keys(g.aus).filter(function (m) { return besitz(stand, m) < g.aus[m]; });
    if (fehlt.length) return { ok: false, text: "Für einen " + g.name + " brauchst du " + bedarf(g) + "." };
    Object.keys(g.aus).forEach(function (m) { fach(stand, m)[m] -= g.aus[m]; });
    dazu(stand, id, 1);
    return { ok: true, text: "Über der rauschenden Flamme formst du einen " + g.name + "." };
  }

  function bedarf(g) {
    return Object.keys(g.aus).map(function (m) { return g.aus[m] + "× " + sachName(m); }).join(" und ");
  }

  // Der Spieltag (kern\welt.js: ein Tag = 1440 Spielminuten)
  function tag(stand) { return Math.floor((stand.zeit || 0) / 1440); }

  // Fundstelle: gibt einmal je Spieltag etwas her. Liefert die Menge (0 = heute schon leer).
  function fund(stand, f) {
    if (!stand.funde) stand.funde = {};
    if (stand.funde[f.id] === tag(stand)) return 0;
    stand.funde[f.id] = tag(stand);
    dazu(stand, f.ware, f.menge || 1);
    return f.menge || 1;
  }
  function fundLeer(stand, id) { return !!stand.funde && stand.funde[id] === tag(stand); }

  return {
    WAEHRUNG: WAEHRUNG, PREISE: PREISE, MAERKTE: MAERKTE,
    besitz: besitz, dazu: dazu, kaufen: kaufen, verkaufen: verkaufen,
    herstellen: herstellen, bedarf: bedarf, tag: tag, fund: fund, fundLeer: fundLeer
  };
})();
