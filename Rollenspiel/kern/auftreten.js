// ============================================================
//  AUFTRETEN – welches Elemental hinter einem Schemen steckt
//
//  Entscheidung des Autors (24.09.2026): Freie Elementals sind
//  sichtbar, aber nur als Schemen; wer es ist, zeigt erst der Kampf.
//  Manche erscheinen nur in bestimmten Gegenden, bei bestimmtem
//  Wetter oder zu bestimmter Tageszeit. Wer abseits der Wege läuft,
//  findet eher Seltenes. Zufall ist hier gewollt – er macht neugierig.
//
//  Eintrag einer Auftrittstabelle (daten\auftreten.js):
//    { art, stufe: [min, max], gewicht,
//      biome: [...], wetter: [...], zeit: [...],   – fehlt = überall/immer
//      nurAbseits: true }
// ============================================================

var AUFTRETEN = (function () {
  "use strict";

  var ABSEITS_BONUS = 3;      // seltene Einträge abseits der Wege ×3
  var ABSEITS_AB = 4;         // Kacheln Abstand zum nächsten Weg

  function passt(e, lage) {
    if (e.biome && e.biome.indexOf(lage.biom) < 0) return false;
    if (e.wetter && e.wetter.indexOf(lage.wetter) < 0) return false;
    if (e.zeit && e.zeit.indexOf(lage.phase) < 0) return false;
    if (e.nurAbseits && !lage.abseits) return false;
    return true;
  }

  function gewicht(e, lage) {
    var selten = ARTEN[e.art].seltenheit !== "haeufig";
    return e.gewicht * (lage.abseits && selten ? ABSEITS_BONUS : 1);
  }

  // Alle Einträge, die hier und jetzt möglich sind, mit ihrem Anteil.
  function moeglich(tabelle, lage) {
    var liste = tabelle.filter(function (e) { return passt(e, lage); });
    var summe = liste.reduce(function (a, e) { return a + gewicht(e, lage); }, 0);
    return liste.map(function (e) { return { eintrag: e, anteil: summe ? gewicht(e, lage) / summe : 0 }; });
  }

  // Wählt ein Elemental für einen neuen Schemen; null, wenn hier und
  // jetzt nichts erscheinen kann.
  function waehle(tabelle, lage, zufall) {
    var m = moeglich(tabelle, lage);
    if (!m.length) return null;
    var r = zufall();
    for (var i = 0; i < m.length; i++) {
      r -= m[i].anteil;
      if (r <= 0 || i === m.length - 1) {
        var e = m[i].eintrag;
        return { art: e.art, stufe: e.stufe[0] + Math.floor(zufall() * (e.stufe[1] - e.stufe[0] + 1)) };
      }
    }
    return null;
  }

  // ----------------------------------------------------------
  //  Die Karte lesen: Gegend und Abseits je Kachel
  // ----------------------------------------------------------
  // karte: Tiled-JSON. Liefert { breite, hoehe, lage(x, y) → { biom,
  // abseits, begehbar } } in Kachelkoordinaten.
  function kartenLagen(karte) {
    var b = karte.width, h = karte.height;
    var ebene = function (name) { return karte.layers.filter(function (l) { return l.name === name; })[0]; };
    var boden = ebene("boden").data, hindernis = ebene("hindernisse").data;
    var gebiete = (ebene("gebiete") || { objects: [] }).objects;
    var kw = karte.tilewidth, kh = karte.tileheight;
    var WEG = 3;   // Kachelnummer des Weges (siehe werkzeug\platzhalter-bauen.ps1)

    // Abstand zum nächsten Weg per Breitensuche
    var abstand = new Array(b * h).fill(Infinity), schlange = [];
    for (var i = 0; i < b * h; i++) if (boden[i] === WEG) { abstand[i] = 0; schlange.push(i); }
    for (var q = 0; q < schlange.length; q++) {
      var p = schlange[q], x = p % b, y = Math.floor(p / b);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = x + d[0], ny = y + d[1];
        if (nx < 0 || ny < 0 || nx >= b || ny >= h) return;
        var n = ny * b + nx;
        if (abstand[n] > abstand[p] + 1) { abstand[n] = abstand[p] + 1; schlange.push(n); }
      });
    }

    function biomAn(x, y) {
      var px = (x + 0.5) * kw, py = (y + 0.5) * kh;
      for (var i = gebiete.length - 1; i >= 0; i--) {
        var g = gebiete[i];
        if (px >= g.x && px < g.x + g.width && py >= g.y && py < g.y + g.height) {
          var eig = (g.properties || []).filter(function (p) { return p.name === "biom"; })[0];
          if (eig) return eig.value;
        }
      }
      return "wiese";
    }

    return {
      breite: b, hoehe: h,
      lage: function (x, y) {
        var i = y * b + x;
        return { biom: biomAn(x, y), abseits: abstand[i] >= ABSEITS_AB, begehbar: !hindernis[i] };
      }
    };
  }

  return { passt: passt, moeglich: moeglich, waehle: waehle, kartenLagen: kartenLagen, ABSEITS_BONUS: ABSEITS_BONUS, ABSEITS_AB: ABSEITS_AB };
})();
