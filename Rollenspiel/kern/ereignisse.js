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
//    { geben: { elemental: { art, stufe }, vorrat: { reagenzglas: 2 }, werkzeug: ["lupe"] } }
//    { benennen: true }   dem zuletzt dazugekommenen Elemental einen Namen geben
//    { welt: { zeit: "15:00", wetter: "nebel" } }
//    { einblenden: "reiter", text: "…" }   gemalte Einblendung (Platzhalter, bis das Bild da ist)
//    { wennElemental: "kohlenstoff", dann: [ … ], sonst: [ … ] }  in der Gruppe?
//    { karte: { ziel: "kolbenwald", punkt: "von_stoffingen" } }  immer als LETZTER Schritt
//    { wennGleich: ["letzter_kampf", "sieg"], dann: [ … ], sonst: [ … ] }
//    { ablauf: "reiter_szenen" }   einen anderen benannten Ablauf einschieben
//
//  Szenen, die gespielt statt erzählt werden (seit 25.10.2026):
//    { film: [ … ], kurz: "…" }   überspringbare Szene. Übersprungen sind
//                                 sag, einblenden, gehen, zeichen, warte und
//                                 verfolgen sofort fertig; Wahlen, Flags und
//                                 Gegenstände gelten trotzdem. "kurz" ist dann
//                                 die eine Zeile, die stattdessen erscheint.
//    { gehen: { wer: "mutter", nach: [[13, 9], [15, 13]], parallel: true } }
//                                 wer = Figur der Karte, "held" oder eine mit
//                                 erscheinen gesetzte; nach = Kachel [x, y]
//                                 oder eine Liste davon (Wegpunkte)
//    { erscheinen: { name: "reiter1", figur: 9, bei: [29, 13] } }  (oder bild: "wagen")
//    { verschwinden: "reiter1" }
//    { zeichen: { wer: "lumi", art: "!" } }    "!", "?", "…" oder "♥" über dem Kopf
//    { warte: 600 }                            Millisekunden
//    { verfolgen: { wer: "wagen", nach: [41, 13] } }
//                                 Steuerung frei, wer fährt davon – immer
//                                 etwas schneller als die Spielfigur
//
//  Alles, was den Spielstand ändert (geben, welt, karte, heilen), geht
//  über die Anzeige – so bleibt diese Datei ohne Spielstand-Wissen.
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

  function rufe(anzeige, name, wert) {
    return Promise.resolve(anzeige[name] ? anzeige[name](wert) : undefined);
  }

  function istKachel(k) {
    return Array.isArray(k) && k.length === 2 && typeof k[0] === "number" && typeof k[1] === "number";
  }

  function ausfuehren(schritte, flags, anzeige) {
    var i = 0;
    function weiter() {
      if (!schritte || i >= schritte.length) return Promise.resolve();
      var s = schritte[i++];

      if (s.sag !== undefined) return Promise.resolve(anzeige.sag(s.sag, s.text)).then(weiter);
      if (s.erzaehl !== undefined) return Promise.resolve(anzeige.sag(null, s.erzaehl)).then(weiter);

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
      if (s.geben !== undefined) return Promise.resolve(anzeige.geben(s.geben)).then(weiter);
      if (s.benennen) return Promise.resolve(anzeige.benennen()).then(weiter);
      if (s.welt !== undefined) return Promise.resolve(anzeige.welt(s.welt)).then(weiter);
      if (s.einblenden !== undefined) return Promise.resolve(anzeige.einblenden(s.einblenden, s.text)).then(weiter);
      if (s.karte !== undefined) return Promise.resolve(anzeige.karte(s.karte)).then(weiter);
      if (s.wennGleich !== undefined) {
        return ausfuehren(flags[s.wennGleich[0]] === s.wennGleich[1] ? s.dann : s.sonst, flags, anzeige).then(weiter);
      }
      if (s.ablauf !== undefined) return ausfuehren(anzeige.ablauf(s.ablauf), flags, anzeige).then(weiter);

      // Gespielte Szenen. Eine Anzeige ohne diese Fähigkeiten (der
      // Prüfstand) überspringt die Bewegungen einfach.
      if (s.film !== undefined) {
        return rufe(anzeige, "filmStart").then(function () {
          return ausfuehren(s.film, flags, anzeige);
        }).then(function () { return rufe(anzeige, "filmEnde", s.kurz); }).then(weiter);
      }
      var bewegung = ["gehen", "erscheinen", "verschwinden", "zeichen", "warte", "verfolgen"].filter(function (n) { return s[n] !== undefined; })[0];
      if (bewegung) return rufe(anzeige, bewegung, s[bewegung]).then(weiter);
      if (s.wennElemental !== undefined) {
        return ausfuehren(anzeige.hatElemental(s.wennElemental) ? s.dann : s.sonst, flags, anzeige).then(weiter);
      }

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
        } else if (s.ablauf !== undefined) {
          if (!ablaeufe[s.ablauf]) fehler.push(hier + ": Ablauf „" + s.ablauf + "“ fehlt");
        } else if (s.wenn !== undefined || s.wennNicht !== undefined || s.wennElemental !== undefined || s.wennGleich !== undefined) {
          if (s.wennElemental !== undefined && typeof ARTEN !== "undefined" && !ARTEN[s.wennElemental]) fehler.push(hier + ": unbekannte Art " + s.wennElemental);
          gehe(s.dann || [], hier + ".dann");
          if (s.sonst) gehe(s.sonst, hier + ".sonst");
        } else if (s.kampf !== undefined) {
          var arten = s.kampf.gegner ? s.kampf.gegner.map(function (g) { return g.art; }) : [s.kampf.art];
          arten.forEach(function (a) { if (!a || typeof ARTEN !== "undefined" && !ARTEN[a]) fehler.push(hier + ": Kampf gegen unbekannte Art " + a); });
        } else if (s.geben !== undefined) {
          if (s.geben.elemental && typeof ARTEN !== "undefined" && !ARTEN[s.geben.elemental.art]) fehler.push(hier + ": unbekannte Art " + s.geben.elemental.art);
        } else if (s.film !== undefined) {
          gehe(s.film, hier + ".film");
        } else if (s.gehen !== undefined || s.verfolgen !== undefined) {
          var g = s.gehen || s.verfolgen;
          var ziele = istKachel(g.nach) ? [g.nach] : g.nach;
          if (!g.wer) fehler.push(hier + ": wer fehlt");
          if (!Array.isArray(ziele) || !ziele.length || !ziele.every(istKachel)) fehler.push(hier + ": nach braucht [x, y] oder eine Liste davon");
        } else if (s.erscheinen !== undefined) {
          if (!s.erscheinen.name || !istKachel(s.erscheinen.bei)) fehler.push(hier + ": erscheinen braucht name und bei: [x, y]");
          if (typeof s.erscheinen.figur !== "number" && !s.erscheinen.bild) fehler.push(hier + ": erscheinen braucht figur oder bild");
        } else if (s.zeichen !== undefined) {
          if (["!", "?", "…", "♥"].indexOf(s.zeichen.art) < 0) fehler.push(hier + ": unbekanntes Zeichen " + s.zeichen.art);
        } else if (s.verschwinden === undefined && s.warte === undefined &&
                   s.setze === undefined && !s.heilen && !s.speichern && !s.benennen &&
                   s.welt === undefined && s.einblenden === undefined && s.karte === undefined) {
          fehler.push(hier + ": unbekannter Schritt");
        }
      });
    }
    Object.keys(ablaeufe).forEach(function (name) { gehe(ablaeufe[name], name); });
    return fehler;
  }

  return { ausfuehren: ausfuehren, pruefeDaten: pruefeDaten };
})();
