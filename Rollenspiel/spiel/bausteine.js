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

  var breite = 0;
  function zeichne(aktiv) {
    grund.clear();
    grund.fillStyle(aktiv ? FARBE.knopfAktiv : FARBE.knopf, 0.94);
    grund.fillRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, MASS.px(10));
    grund.lineStyle(MASS.px(2), 0xc9a66b, 1);
    grund.strokeRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, MASS.px(10));
  }
  function setzeBreite(b) {
    breite = b || Math.max(MASS.px(optionen.mindestbreite || 160), beschriftung.width + MASS.px(32));
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
