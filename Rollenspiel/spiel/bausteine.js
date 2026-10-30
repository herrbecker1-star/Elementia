// ============================================================
//  BAUSTEINE – Bildschirmmaße und Knöpfe, von allen Szenen genutzt
//
//  Warum der Aufwand mit dem Pixelverhältnis: Ein Handy hat drei
//  Bildpunkte je CSS-Pixel. Zeichnet das Spiel nur in CSS-Pixeln,
//  vergrößert der Browser das Bild dreifach – die Pixelwelt bleibt
//  dabei scharf, aber jede Schrift wird treppig. Deshalb ist die
//  Leinwand so groß wie das Display in echten Bildpunkten, und die
//  Welt wird über den Kamerazoom ganzzahlig vergrößert. So ist die
//  Pixelkunst gestochen scharf UND die Schrift glatt.
// ============================================================

var MASS = (function () {
  "use strict";

  // Über 3 bringt es nichts Sichtbares, kostet aber Füllrate.
  var dpr = Math.min(window.devicePixelRatio || 1, 3);

  function leinwand() {
    return {
      b: Math.round(window.innerWidth * dpr),
      h: Math.round(window.innerHeight * dpr)
    };
  }

  // Grundauflösung der Welt 640×360. Der Zoom ist die größte ganze
  // Zahl, bei der noch mindestens so viel Welt zu sehen ist – auf
  // einem Handy quer (844×390 CSS, ×3) ergibt das Zoom 3 und rund
  // 26×12 Kacheln.
  function weltZoom(b, h) {
    return Math.max(1, Math.floor(Math.min(b / 640, h / 360)));
  }

  return {
    dpr: dpr,
    leinwand: leinwand,
    weltZoom: weltZoom,
    // CSS-Pixel → Leinwandpixel. Alle Oberflächenmaße werden in CSS
    // gedacht (ein Knopf ist 56 px groß wie auf einer Webseite).
    px: function (css) { return Math.round(css * dpr); },
    probe: /[?&]probe=1\b/.test(location.search)
  };
})();

var SCHRIFT = {
  familie: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  titel: 'Georgia, "Times New Roman", serif'
};

var FARBE = {
  papier: 0xf4ead5,
  papierRand: 0x6b4a2b,
  tinte: "#2b1d10",
  knopf: 0x3a2a1c,
  knopfAktiv: 0x5a3f28,
  knopfText: "#f4ead5",
  nacht: 0x101418
};

// Farbe je Typ (seit Fassung 20) – Punkt auf dem Attackenknopf, Raster
// der Typentabelle in der Stoffkunde. Eigene Typsymbole folgen später.
var TYPFARBE = {
  knall: 0xf2a33a, erde: 0xb08a5a, leichtmetall: 0xd5dde6, kristall: 0x7fd1e8, frost: 0xa8dcff,
  feuer: 0xe8573a, aetz: 0x9bd14a, geist: 0xa98ad8, stahl: 0x8c98a4, hartmetall: 0x4f5b68,
  edelmetall: 0xe6c34a, magnet: 0xd84a6a, strahlung: 0x5fe35f, normal: 0xe8e0d0
};

// Kleine Symbole für Knöpfe (seit Fassung 19): Schwert = macht Schaden,
// Schild = schützt, Blitz = stört, Flagge = Flucht, Reagenzglas = Fangen.
// Gezeichnet statt Emoji – die sehen auf jedem Handy anders aus.
// Liefert den Texturschlüssel; die Textur entsteht beim ersten Gebrauch.
function symbolTextur(szene, name) {
  var s = MASS.px(18), schluessel = "symbol-" + name + "-" + s;
  if (szene.textures.exists(schluessel)) return schluessel;
  var u = s / 16, g = szene.make.graphics({ add: false });
  var P = function (liste) { return liste.map(function (p) { return { x: p[0] * u, y: p[1] * u }; }); };
  if (name === "schwert") {
    g.lineStyle(2.4 * u, 0xdfe6ea).lineBetween(5 * u, 11 * u, 14.5 * u, 1.5 * u);   // Klinge
    g.lineStyle(2.2 * u, 0xd9a63a).lineBetween(2.5 * u, 8.5 * u, 7.5 * u, 13.5 * u); // Parierstange
    g.lineStyle(2.4 * u, 0x8a5a32).lineBetween(1.5 * u, 14.5 * u, 4.5 * u, 11.5 * u); // Griff
  } else if (name === "schild") {
    var sechs = P([[8, 1], [14, 4.5], [14, 11.5], [8, 15], [2, 11.5], [2, 4.5]]);
    g.fillStyle(0x6aa6e0).fillPoints(sechs, true);
    g.lineStyle(1.6 * u, 0xdfe6ea).strokePoints(sechs, true, true);
  } else if (name === "blitz") {
    g.fillStyle(0xf5d547).fillPoints(P([[9, 0.5], [3, 9], [7.5, 9], [5.5, 15.5], [13, 6], [8.5, 6], [11, 0.5]]), true);
  } else if (name === "flagge") {
    g.lineStyle(1.8 * u, 0xc9a66b).lineBetween(3 * u, 1 * u, 3 * u, 15.5 * u);
    g.fillStyle(0xf4ead5).fillPoints(P([[3.8, 1.5], [14, 3.5], [11, 5.5], [14, 8], [3.8, 8.5]]), true);
  } else if (name === "sauerstoff") {
    // Kampfwetter Sauerstoffschub: eine Flamme mit O
    g.fillStyle(0xe8573a).fillTriangle(8 * u, 1 * u, 3 * u, 11 * u, 13 * u, 11 * u).fillCircle(8 * u, 11 * u, 5 * u);
    g.fillStyle(0xf5d547).fillCircle(8 * u, 11.5 * u, 2.8 * u);
  } else if (name === "staub") {
    // Kampfwetter Kalkstaubsturm: Staubkörner im Wind
    g.lineStyle(1.4 * u, 0xd8cbb0).lineBetween(1 * u, 5 * u, 12 * u, 5 * u).lineBetween(3 * u, 10 * u, 15 * u, 10 * u);
    g.fillStyle(0xe8e0d0);
    [[13, 3], [6, 7], [10, 12], [2, 13], [14, 7]].forEach(function (p) { g.fillCircle(p[0] * u, p[1] * u, 1.2 * u); });
  } else if (name === "glas") {
    g.lineStyle(1.6 * u, 0xdfe6ea).strokeRoundedRect(5 * u, 1 * u, 6 * u, 14 * u, { tl: 0, tr: 0, bl: 3 * u, br: 3 * u });
    g.fillStyle(0x7fd07f).fillRoundedRect(5.8 * u, 8 * u, 4.4 * u, 6.2 * u, { tl: 0, tr: 0, bl: 2.2 * u, br: 2.2 * u });
    g.lineStyle(1.6 * u, 0xdfe6ea).lineBetween(3.5 * u, 1 * u, 12.5 * u, 1 * u);
  }
  g.generateTexture(schluessel, s, s);
  g.destroy();
  return schluessel;
}

// Ein rechteckiger Knopf mit Beschriftung. Reagiert auf pointerup,
// nicht pointerdown: Nur so erlauben Browser Vollbild und
// Zwischenablage aus dem Handler heraus, und ein Finger, der
// über den Knopf wischt, löst nichts aus.
function baueKnopf(szene, text, beiKlick, optionen) {
  optionen = optionen || {};
  var hoehe = MASS.px(optionen.hoehe || 48);
  var schrift = MASS.px(optionen.schrift || 18);
  var gruppe = szene.add.container(0, 0);
  var grund = szene.add.graphics();
  var beschriftung = szene.add.text(0, 0, text, {
    fontFamily: SCHRIFT.familie, fontSize: schrift + "px", color: FARBE.knopfText, align: "center"
  }).setOrigin(0.5);
  gruppe.add([grund, beschriftung]);

  // optionen.unten: zweite Zeile (z. B. die Stärke), optionen.symbol: ein
  // Symbol (symbolTextur) – rechts neben der zweiten Zeile, ohne sie
  // rechts neben dem Text. Beides als Gruppe mittig.
  if (optionen.unten !== undefined || optionen.symbol) {
    var unten = szene.add.text(0, 0, optionen.unten || "", {
      fontFamily: SCHRIFT.familie, fontSize: schrift + "px", color: FARBE.knopfText, fontStyle: "bold"
    }).setOrigin(0, 0.5);
    gruppe.add(unten);
    var bild = optionen.symbol ? szene.add.image(0, 0, symbolTextur(szene, optionen.symbol)).setOrigin(0, 0.5) : null;
    if (bild) gruppe.add(bild);
    var zweiZeilen = optionen.unten !== undefined;
    var luecke = unten.width && bild ? MASS.px(5) : 0;
    if (!zweiZeilen && bild) {
      var gesamt = beschriftung.width + MASS.px(6) + bild.width;
      beschriftung.setX(-gesamt / 2 + beschriftung.width / 2);
      bild.setPosition(gesamt / 2 - bild.width, 0);
    } else {
      beschriftung.setY(-hoehe * 0.2);
      var zb = unten.width + luecke + (bild ? bild.width : 0), zy = hoehe * 0.22;
      unten.setPosition(-zb / 2, zy);
      if (bild) bild.setPosition(-zb / 2 + unten.width + luecke, zy);
    }
  }

  // optionen.punkt: Farbe des Typs als Punkt links vom Namen (seit Fassung 20)
  var punktR = MASS.px(4), punktPlatz = optionen.punkt !== undefined ? 2 * punktR + MASS.px(4) : 0;

  var breite = 0;
  function zeichne(aktiv) {
    grund.clear();
    grund.fillStyle(aktiv ? FARBE.knopfAktiv : FARBE.knopf, 0.94);
    grund.fillRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, MASS.px(10));
    grund.lineStyle(MASS.px(2), 0xc9a66b, 1);
    grund.strokeRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, MASS.px(10));
    if (punktPlatz) {
      var bx = beschriftung.x - beschriftung.displayWidth / 2 - punktPlatz / 2;
      grund.fillStyle(optionen.punkt, 1).fillCircle(bx, beschriftung.y, punktR)
        .lineStyle(MASS.px(1), 0x101418, 0.8).strokeCircle(bx, beschriftung.y, punktR);
    }
  }
  function setzeBreite(b) {
    breite = b || Math.max(MASS.px(optionen.mindestbreite || 160), beschriftung.width + punktPlatz + MASS.px(32));
    // Lange Namen (Schleichendes Gas) auf schmalen Knöpfen etwas kleiner
    beschriftung.setScale(Math.min(1, (breite - MASS.px(8) - punktPlatz) / beschriftung.width));
    if (punktPlatz) beschriftung.setX(punktPlatz / 2);
    gruppe.setSize(breite, hoehe);
    // Die Trefferfläche wird beim setInteractive einmal angelegt und
    // wächst nicht von selbst mit.
    if (gruppe.input) gruppe.input.hitArea.setSize(breite, hoehe);
    zeichne(false);
  }
  setzeBreite(optionen.breite ? MASS.px(optionen.breite) : 0);

  gruppe.setInteractive({ useHandCursor: true });
  gruppe.on("pointerdown", function () { zeichne(true); });
  gruppe.on("pointerout", function () { zeichne(false); });
  gruppe.on("pointerup", function (zeiger, lx, ly, ereignis) {
    zeichne(false);
    if (ereignis && ereignis.stopPropagation) ereignis.stopPropagation();
    beiKlick();
  });

  gruppe.setzeText = function (t) { beschriftung.setText(t); };
  gruppe.setzeBreite = function (cssBreite) { setzeBreite(cssBreite ? MASS.px(cssBreite) : 0); };
  return gruppe;
}
