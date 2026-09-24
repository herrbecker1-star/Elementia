// ============================================================
//  WELT – Tageszeit, Wetter und das Kampffeld, das daraus folgt
//
//  Reine Logik. Die Spielzeit läuft schneller als die echte: Eine
//  Sekunde ist eine Spielminute, ein Tag dauert 24 Minuten. So erlebt
//  auch, wer nur am Nachmittag spielt, eine Nacht – und damit die
//  Elementals, die nur nachts erscheinen.
// ============================================================

var WELT = (function () {
  "use strict";

  var MINUTEN_JE_SEKUNDE = 1;
  var START_MINUTE = 7 * 60;                   // 7:00 Uhr, der Geburtstagsmorgen

  var PHASEN = ["morgen", "tag", "abend", "nacht"];
  var PHASE_NAME = { morgen: "Morgen", tag: "Tag", abend: "Abend", nacht: "Nacht" };
  var WETTER_NAME = { klar: "klar", hitze: "Hitze", nebel: "Nebel", regen: "Regen", gewitter: "Gewitter" };

  // Wetter je Region: Gewichte. Die Feuerlande sind trocken und heiß.
  var KLIMA = {
    feuerlande: { klar: 5, hitze: 3, nebel: 2, regen: 1.5, gewitter: 0.5 }
  };

  function phase(minute) {
    var h = (minute / 60) % 24;
    if (h >= 5 && h < 9) return "morgen";
    if (h >= 9 && h < 18) return "tag";
    if (h >= 18 && h < 21) return "abend";
    return "nacht";
  }

  function uhr(minute) {
    var m = Math.floor(minute) % (24 * 60);
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function neuesWetter(klima, zufall) {
    var gewichte = KLIMA[klima], summe = 0, art;
    for (art in gewichte) summe += gewichte[art];
    var r = zufall() * summe;
    for (art in gewichte) { r -= gewichte[art]; if (r <= 0) return art; }
    return "klar";
  }

  // Legt Zeit und Wetter im Spielstand an, falls sie fehlen.
  function einrichten(stand, klima, zufall) {
    if (typeof stand.zeit !== "number") stand.zeit = START_MINUTE;
    if (!stand.wetter || !stand.wetter.art) stand.wetter = { art: "klar", bis: stand.zeit + 240 };
    stand.klima = klima;
    return stand;
  }

  // Lässt die Zeit laufen. Liefert, was sich geändert hat, damit die
  // Oberfläche nur dann neu zeichnet: { phase: true, wetter: true }.
  function vorruecken(stand, sekunden, zufall) {
    var altPhase = phase(stand.zeit), altWetter = stand.wetter.art;
    stand.zeit += sekunden * MINUTEN_JE_SEKUNDE;
    if (stand.zeit >= stand.wetter.bis) {
      // Ein Wetter hält drei bis acht Spielstunden (3 bis 8 Minuten).
      stand.wetter = { art: neuesWetter(stand.klima || "feuerlande", zufall), bis: stand.zeit + 180 + zufall() * 300 };
    }
    return { phase: phase(stand.zeit) !== altPhase, wetter: stand.wetter.art !== altWetter };
  }

  // ----------------------------------------------------------
  //  Das Kampffeld folgt dem Ort, dem Wetter und der Tageszeit
  // ----------------------------------------------------------
  var BIOM_FELD = {
    wiese:    { sauerstoff: 100, waerme: 20, feuchte: 30 },
    dorf:     { sauerstoff: 100, waerme: 22, feuchte: 30 },
    garten:   { sauerstoff: 100, waerme: 20, feuchte: 45 },
    schmiede: { sauerstoff: 95,  waerme: 45, feuchte: 20 },   // die Esse glüht
    meiler:   { sauerstoff: 80,  waerme: 45, feuchte: 20 },   // Holz verkohlt unter Luftabschluss
    quelle:   { sauerstoff: 100, waerme: 35, feuchte: 75 },   // warme Schwefelquelle
    hain:     { sauerstoff: 100, waerme: 18, feuchte: 55 },
    wald:     { sauerstoff: 100, waerme: 16, feuchte: 60 }
  };
  var BIOM_ORT = { wiese: "steppe", dorf: "dorf", garten: "dorf", schmiede: "dorf", meiler: "steppe", quelle: "wald", hain: "wald", wald: "wald" };

  function feld(biom, wetter, ph) {
    var f = Object.assign({ offen: true }, BIOM_FELD[biom] || BIOM_FELD.wiese);
    if (wetter === "regen") f.feuchte += 40;
    if (wetter === "gewitter") f.feuchte += 35;
    if (wetter === "nebel") f.feuchte += 25;
    if (wetter === "hitze") f.waerme += 20;
    if (ph === "nacht") f.waerme -= 8;
    f.feuchte = Math.max(0, Math.min(100, f.feuchte));
    f.waerme = Math.max(0, Math.min(100, f.waerme));
    return f;
  }

  return {
    PHASEN: PHASEN, PHASE_NAME: PHASE_NAME, WETTER_NAME: WETTER_NAME, KLIMA: KLIMA,
    MINUTEN_JE_SEKUNDE: MINUTEN_JE_SEKUNDE,
    phase: phase, uhr: uhr, neuesWetter: neuesWetter,
    einrichten: einrichten, vorruecken: vorruecken,
    feld: feld, ort: function (biom) { return BIOM_ORT[biom] || "steppe"; }
  };
})();
