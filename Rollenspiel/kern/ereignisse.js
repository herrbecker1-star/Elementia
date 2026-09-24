// ============================================================
//  EREIGNISSE – Dialoge und Quests als Datenlisten
//
//  Ein Ablauf ist eine Liste von Schritten. Das Spiel weiß nicht,
//  was Lumi sagt oder wann Mara den Spatel herausgibt; es liest die
//  Liste und führt sie aus. Neue Szenen, Nebenquests und später
//  ganze Regionen entstehen dadurch in daten\, ohne dass die Engine
//  angefasst wird.
//
//  Schritte:
//    { sag: "Lumi", text: "…" }                  Sprechblase
//    { erzaehl: "…" }                            Erzähltext ohne Sprecher
//    { wahl: "Frage?", optionen: [ { text: "…", dann: [ … ] }, … ] }
//    { setze: "flag" }  { setze: "flag", wert: 3 }
//    { wenn: "flag", dann: [ … ], sonst: [ … ] }  prüft Wahrheit
//    { wennNicht: "flag", dann: [ … ] }
//    { kampf: { art: "zink", stufe: 3, wild: true, feld: { … } } }
//                                                 Kampf; die Anzeige
//                                                 braucht dafür kampf()
//    { heilen: true }     alle Elementals erholen sich (nur in Laboren!)
//    { speichern: true }  Spielstand sichern
//
//  Die Anzeige ist ein Objekt mit zwei Funktionen, die Promises
//  liefern: sag(sprecher, text) und wahl(frage, texte) → Index.
//  Im Spiel ist das die Dialogbox, im Prüfstand ein Skript, das
//  Antworten vorgibt. Kein Phaser in dieser Datei.
// ============================================================

var EREIGNISSE = (function () {
  "use strict";

  function wahr(flags, name) {
    return !!(flags && flags[name]);
  }

  function ausfuehren(schritte, flags, anzeige) {
    var i = 0;
    function weiter() {
      if (!schritte || i >= schritte.length) return Promise.resolve();
      var s = schritte[i++];

      if (s.sag !== undefined) return anzeige.sag(s.sag, s.text).then(weiter);
      if (s.erzaehl !== undefined) return anzeige.sag(null, s.erzaehl).then(weiter);

      if (s.wahl !== undefined) {
        var texte = s.optionen.map(function (o) { return o.text; });
        return anzeige.wahl(s.wahl, texte).then(function (nr) {
          var gewaehlt = s.optionen[nr];
          if (!gewaehlt) throw new Error("Ungültige Wahl " + nr + " bei „" + s.wahl + "“");
          return ausfuehren(gewaehlt.dann || [], flags, anzeige);
        }).then(weiter);
      }

      if (s.kampf !== undefined) {
        // Das Ergebnis ("sieg", "gefangen", …) landet im Flag
        // "letzter_kampf", damit der Ablauf darauf verzweigen kann.
        return anzeige.kampf(s.kampf).then(function (ende) {
          flags.letzter_kampf = ende;
        }).then(weiter);
      }

      if (s.heilen) return Promise.resolve(anzeige.heilen()).then(weiter);
      if (s.speichern) return Promise.resolve(anzeige.speichern()).then(weiter);

      if (s.setze !== undefined) {
        flags[s.setze] = s.wert === undefined ? true : s.wert;
        return weiter();
      }

      if (s.wenn !== undefined) {
        return ausfuehren(wahr(flags, s.wenn) ? s.dann : s.sonst, flags, anzeige).then(weiter);
      }
      if (s.wennNicht !== undefined) {
        return ausfuehren(!wahr(flags, s.wennNicht) ? s.dann : s.sonst, flags, anzeige).then(weiter);
      }

      throw new Error("Unbekannter Schritt: " + JSON.stringify(s));
    }
    return weiter();
  }

  // Für den Prüfstand: jeden Ablauf in den Daten einmal durchgehen und
  // unbekannte Schritte, leere Texte und Wahlen ohne Optionen melden –
  // bevor ein Spieler an genau diese Stelle läuft.
  function pruefeDaten(ablaeufe) {
    var fehler = [];
    function gehe(schritte, ort) {
      if (!Array.isArray(schritte)) { fehler.push(ort + ": keine Liste"); return; }
      schritte.forEach(function (s, n) {
        var hier = ort + "[" + n + "]";
        if (s.sag !== undefined || s.erzaehl !== undefined) {
          var t = s.sag !== undefined ? s.text : s.erzaehl;
          if (typeof t !== "string" || !t.trim()) fehler.push(hier + ": leerer Text");
        } else if (s.wahl !== undefined) {
          if (!Array.isArray(s.optionen) || s.optionen.length < 2) fehler.push(hier + ": Wahl braucht mindestens zwei Optionen");
          else s.optionen.forEach(function (o, k) { gehe(o.dann || [], hier + ".optionen[" + k + "]"); });
        } else if (s.wenn !== undefined || s.wennNicht !== undefined) {
          gehe(s.dann || [], hier + ".dann");
          if (s.sonst) gehe(s.sonst, hier + ".sonst");
        } else if (s.kampf !== undefined) {
          if (!s.kampf.art || typeof ARTEN !== "undefined" && !ARTEN[s.kampf.art]) fehler.push(hier + ": Kampf gegen unbekannte Art " + s.kampf.art);
        } else if (s.setze === undefined && !s.heilen && !s.speichern) {
          fehler.push(hier + ": unbekannter Schritt");
        }
      });
    }
    Object.keys(ablaeufe).forEach(function (name) { gehe(ablaeufe[name], name); });
    return fehler;
  }

  return { ausfuehren: ausfuehren, pruefeDaten: pruefeDaten };
})();
