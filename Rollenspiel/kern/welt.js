// ============================================================
//  WELT – Tageszeit, Wetter und der Ort eines Kampfes
//
//  Reine Logik. Die Spielzeit läuft schneller als die echte: Eine
//  Sekunde sind drei Spielminuten, ein Tag dauert 8 Minuten (seit
//  Fassung 21; vorher 24 – Handytest: „die Tageszeit muss schneller
//  vergehen“). Die Uhr läuft nur in der Oberwelt, nicht in Dialog,
//  Menü oder Kampf. Nach gut vier Minuten kommt die erste Nacht – und
//  damit die Elementals, die nur nachts erscheinen.
// ============================================================

var WELT = (function () {
  "use strict";

  var MINUTEN_JE_SEKUNDE = 3;
  var START_MINUTE = 7 * 60;                   // 7:00 Uhr, der Geburtstagsmorgen

  var PHASEN = ["morgen", "tag", "abend", "nacht"];
  var PHASE_NAME = { morgen: "Morgen", tag: "Tag", abend: "Abend", nacht: "Nacht" };
  var WETTER_NAME = { klar: "klar", hitze: "Hitze", nebel: "Nebel", regen: "Regen", gewitter: "Gewitter" };

  // Wetter je Region: Gewichte. Die Feuerlande sind trocken und heiß.
  // Seit Fassung 21 Nebel 2 → 1 (Handytest: „sehr viel Nebel“).
  var KLIMA = {
    feuerlande: { klar: 5, hitze: 3, regen: 2, nebel: 1, gewitter: 1 }
  };
  var WETTER_DAUER = [120, 300];               // Spielminuten: 40–100 s Oberwelt

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

  // Seit Fassung 21 nie zweimal dasselbe Wetter hintereinander (bisher:
  // „Wetter variabler“). Ohne „bisher“ wie zuvor.
  function neuesWetter(klima, zufall, bisher) {
    var gewichte = KLIMA[klima], summe = 0, art;
    for (art in gewichte) if (art !== bisher) summe += gewichte[art];
    var r = zufall() * summe, letzte = "klar";
    for (art in gewichte) {
      if (art === bisher) continue;
      letzte = art;
      r -= gewichte[art]; if (r <= 0) return art;
    }
    return letzte;
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
      // Ein Wetter hält zwei bis fünf Spielstunden (40 bis 100 s).
      stand.wetter = {
        art: neuesWetter(stand.klima || "feuerlande", zufall, stand.wetter.art),
        bis: stand.zeit + WETTER_DAUER[0] + zufall() * (WETTER_DAUER[1] - WETTER_DAUER[0])
      };
    }
    return { phase: phase(stand.zeit) !== altPhase, wetter: stand.wetter.art !== altWetter };
  }

  // ----------------------------------------------------------
  //  Der Ort eines Kampfes
  // ----------------------------------------------------------
  // Seit Fassung 20 ohne Kampffeld (Sauerstoff, Wärme, Feuchte; Nutzer
  // 30.10.2026). Der Ort bestimmt nur noch das Kampfbild; das Wetter
  // ist Kulisse.
  // Seit Fassung 25: strand, steppe, fels (Teilchin, Steppenpfad); seit Fassung 26 die Küste
  // als eigener Hintergrund (strand, brunnen) und die Erzhalde der Meerstraße (Cobalt).
  var BIOM_ORT = { wiese: "steppe", dorf: "dorf", garten: "dorf", schmiede: "dorf", meiler: "steppe", quelle: "wald", hain: "wald", wald: "wald",
    strand: "kueste", steppe: "steppe", fels: "steppe", erzhalde: "steppe", brunnen: "kueste" };

  return {
    PHASEN: PHASEN, PHASE_NAME: PHASE_NAME, WETTER_NAME: WETTER_NAME, KLIMA: KLIMA,
    MINUTEN_JE_SEKUNDE: MINUTEN_JE_SEKUNDE,
    phase: phase, uhr: uhr, neuesWetter: neuesWetter,
    einrichten: einrichten, vorruecken: vorruecken,
    ort: function (biom) { return BIOM_ORT[biom] || "steppe"; }
  };
})();
