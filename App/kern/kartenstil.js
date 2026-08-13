// ============================================================
//  KARTENSTIL – wie eine Karte aussieht und was sie ist
//
//  Die Klassenfarben standen bis zum 12.08.2026 an zwei Stellen:
//  in Karten\generator.html (massgeblich) und als Kopie in
//  kern\regeln.js (damit der Pruefer fehlende Farben melden kann).
//  Zwei Fassungen derselben Tabelle laufen frueher oder spaeter
//  auseinander – hier ist jetzt die einzige.
//
//  Bewusst NICHT in regeln.js: Eine Farbe ist keine Spielregel.
//  regeln.js beantwortet "was passiert", diese Datei "wie sieht es aus".
//
//  Benutzt von: Karten\generator.html (Druckbogen), App\sammlung.html
//  (Sammlung), App\stammbaum.html, App\kern\pruefer.js.
// ============================================================

(function () {
  "use strict";

  // --- Klassenfarben -------------------------------------------
  // 22 Klassen. Die Farbe darf nie die einzige Information sein –
  // mehrere Toene sind fuer rot-gruen-blinde Augen nicht zu trennen,
  // und das ist statistisch etwa ein Kind je Klasse. Ueberall, wo
  // diese Farbe erscheint, steht das Klassenwort daneben oder ist
  // (im Druckbogen) einen Schaltermausklick entfernt.
  var KLASSENFARBEN = {
    "Nichtmetall":     "#6d4c9f",
    "Metall":          "#566573",
    "Oxid":            "#c0562f",
    "Sulfid":          "#9c7c1e",
    "Ausrüstung":      "#7a5230",
    "Alkalimetall":    "#c23b5a",
    "Erdalkalimetall": "#4a7043",
    "Halogen":         "#17877b",
    "Edelgas":         "#b06fa8",
    "Salz":            "#4a7fb5",
    "Hydroxid":        "#3d8ba3",
    "Molekül":         "#2c9aa0",
    "Legierung":       "#9c6b30",
    "Säure":           "#a8322c",
    // Organica (3.9–3.12): Farbe = funktionelle Gruppe
    "Alkan":           "#6b7280",
    "Alken":           "#d2762b",
    "Alkin":           "#b35414",
    "Alkanol":         "#2f6fb5",
    "Aldehyd":         "#7d4f9e",
    "Carbonsäure":     "#b8342e",
    "Ester":           "#3f8f4f",
    "Legendär":        "#b8912c"
  };

  // --- Kartenart -----------------------------------------------
  // Die Klasse bestimmt die Art – nicht die Lebenspunkte. lp taugt
  // nicht als Marker: Ausruestung hat lp null, und Legendaeres liegt
  // bei 50. Legierungen sind chemisch Gemische; im Spiel entstehen
  // sie aber durch eine Synthese und werden wie Verbindungen
  // gehandhabt.
  //
  // Die Unterscheidung Element <-> Verbindung ist der fachliche Kern
  // von 3.1 und muss ueberall auf einen Blick sichtbar sein.
  var KARTENART = {
    "Nichtmetall":     "Element",    "Metall":          "Element",
    "Alkalimetall":    "Element",    "Erdalkalimetall": "Element",
    "Halogen":         "Element",    "Edelgas":         "Element",
    "Oxid":            "Verbindung", "Sulfid":          "Verbindung",
    "Salz":            "Verbindung", "Hydroxid":        "Verbindung",
    "Molekül":         "Verbindung", "Säure":           "Verbindung",
    "Legierung":       "Verbindung", "Legendär":        "Verbindung",
    "Alkan":           "Verbindung", "Alken":           "Verbindung",
    "Alkin":           "Verbindung", "Alkanol":         "Verbindung",
    "Aldehyd":         "Verbindung", "Carbonsäure":     "Verbindung",
    "Ester":           "Verbindung",
    "Ausrüstung":      "Ausrüstung"
  };

  // --- Attackentypen -------------------------------------------
  // Die vier Typen aus Abschnitt 5 des Regelwerks. Rot heiss, Grau
  // stumpf, Blau fluechtig, Gruen aetzend – die Zuordnung soll ohne
  // Legende verstaendlich sein. Auch hier gilt: Das Typwort steht
  // immer im Feld, die Farbe ist Zugabe.
  var TYPFARBEN = {
    "Feuer": "#c0392b",
    "Wucht": "#7f8c8d",
    "Gas":   "#2980b9",
    "Ätz":   "#27ae60"
  };

  window.KARTENSTIL = {
    klassenfarben: KLASSENFARBEN,
    kartenart: KARTENART,
    typfarben: TYPFARBEN,

    // Farbe einer Klasse. Unbekannte Klassen werden grau – der
    // Pruefer meldet sie als Fehler, gedruckt wird trotzdem.
    farbe: function (klasse) {
      return KLASSENFARBEN[klasse] || "#555";
    },

    // Art einer Karte. Fuer eine unbekannte Klasse ist "Element" die
    // harmlosere Annahme: eine Verbindung ohne Synthese-Kasten faellt
    // auf, ein Element mit doppeltem Bildrahmen nicht.
    art: function (karte) {
      return KARTENART[karte && karte.klasse] || "Element";
    },

    // Farbe eines Attackentyps.
    typfarbe: function (typ) {
      return TYPFARBEN[typ] || "#555";
    }
  };
})();
