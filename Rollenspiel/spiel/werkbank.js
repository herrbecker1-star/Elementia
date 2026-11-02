// ============================================================
//  WERKBANK – das Minispiel zu Maras Kisten
//
//  Zeigt an, was kern\werkbank.js entscheidet. Links steht Maras Tisch,
//  darauf liegt die Probe, darunter die vier Werkzeuge. Jedes Werkzeug
//  spielt eine kurze Animation: Der Magnet zieht oder nicht, das
//  Lämpchen leuchtet oder bleibt dunkel, unter dem Hammer biegt oder
//  splittert das Stück, die Lupe zeigt Farbe und Glanz. Rechts füllt
//  sich der Steckbrief; darunter steht, was Mara sagt und welcher Stoff
//  es ist, und darunter legt man die Probe zum passenden Stoff.
//
//  Seit Fassung 21 (Handytest): Die Probe lag als großes Rechteck mitten
//  im Bild und wurde für eine Unterlage gehalten. Jetzt liegt sie als
//  kleiner Brocken auf einem Tisch. Die Befunde stehen in einem Steckbrief
//  statt als Fließtext, und das Ergebnis steht unter dem Steckbrief statt
//  in der Sprechzeile am unteren Rand.
//
//  Gestartet über den Ablaufschritt { minispiel: "werkbank" } (spiel\ui.js).
// ============================================================

var WERKBANK_FARBE = {
  "grau": 0x8a8f96, "silbrig": 0xc9ced3, "schwarz": 0x2e2e30, "rötlich": 0xb8643a,
  "bläulich-grau": 0x8a9bb0, "gelb": 0xe8d23a, "silberweiß": 0xdfe3e8, "dunkelgrau": 0x55595f
};
var WERKBANK_STOFFE = ["kohlenstoff", "kupfer", "zink", "schwefel", "eisen"];

// Die Zeilen des Steckbriefs: Beschriftung und wie der Befund heißt
var WERKBANK_ZEILEN = [
  ["Farbe",    function (b) { return b.farbe; }],
  ["Glanz",    function (b) { return b.glanz === undefined ? undefined : (b.glanz ? "glänzt" : "matt"); }],
  ["Magnet",   function (b) { return b.magnetisch === undefined ? undefined : (b.magnetisch ? "zieht an" : "keine Wirkung"); }],
  ["Lämpchen", function (b) { return b.leitfaehig === undefined ? undefined : (b.leitfaehig ? "leuchtet" : "bleibt dunkel"); }],
  ["Hammer",   function (b) { return b.verformbar === undefined ? undefined : (b.verformbar ? "verbiegt sich" : "splittert"); }]
];

class WerkbankSzene extends Phaser.Scene {
  constructor() { super("werkbank"); }

  // daten: { cfg: { sprecher, proben }, beiEnde }
  create(daten) {
    this.daten = daten;
    this.w = WERKBANK.neu(daten.cfg.proben);
    this.sprecher = daten.cfg.sprecher || "Mara";
    this.beschaeftigt = false;
    this.inhalt = [];
    this.grund = this.add.graphics();
    this.tisch = this.add.graphics();
    this.karte = this.add.graphics();
    this.titel = this.add.text(0, 0, "Maras Werkbank", { fontFamily: SCHRIFT.titel, fontSize: MASS.px(18) + "px", color: FARBE.tinte, fontStyle: "bold" });

    // Der Steckbrief: Kopf, Kistennummer, fünf Zeilen
    var klein = { fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: "#3a2a1c" };
    this.briefKopf = this.add.text(0, 0, "Steckbrief", { fontFamily: SCHRIFT.titel, fontSize: MASS.px(16) + "px", color: FARBE.tinte, fontStyle: "bold" });
    this.briefNr = this.add.text(0, 0, "", klein).setOrigin(1, 0);
    this.briefZeilen = WERKBANK_ZEILEN.map(function (z) {
      return {
        name: this.add.text(0, 0, z[0], klein),
        wert: this.add.text(0, 0, "?", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: "#3a2a1c", fontStyle: "bold" })
      };
    }, this);

    // Unter dem Steckbrief: welcher Stoff es ist, und was Mara sagt
    this.ergebnisKopf = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(16) + "px", color: FARBE.tinte, fontStyle: "bold" });
    this.sagText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: FARBE.tinte, lineSpacing: MASS.px(2) });

    this.werkzeugKnoepfe = [
      ["lupe", "🔍 Lupe"], ["magnet", "🧲 Magnet"], ["stromkreis", "💡 Lämpchen"], ["hammer", "🔨 Hammer"]
    ].map(function (p) {
      return baueKnopf(this, p[1], function () { this.pruefen(p[0]); }.bind(this), { hoehe: 38, schrift: 14, mindestbreite: 80 });
    }, this);
    this.stoffKnoepfe = WERKBANK_STOFFE.map(function (art) {
      return baueKnopf(this, ARTEN[art].name, function () { this.bestimmen(art); }.bind(this), { hoehe: 34, schrift: 14, mindestbreite: 80 });
    }, this);
    this.weiterKnopf = baueKnopf(this, "Weiter ›", function () { this.weiter(); }.bind(this), { hoehe: 34, schrift: 15, mindestbreite: 80 }).setVisible(false);

    this.anordnen();
    this.scale.on("resize", this.anordnen, this);
    this.events.once("shutdown", function () { this.scale.off("resize", this.anordnen, this); }, this);
    this.neueProbe();
    this.sag("Kiste für Kiste: erst prüfen, dann zum Stoff legen. Tipp auf ein Werkzeug.");
    // Prüfschalter &werkbankzuege=lupe,magnet,stromkreis,hammer,eisen – für Fotos
    var zuege = new URLSearchParams(location.search).get("werkbankzuege");
    if (zuege) {
      var szene = this;
      zuege.split(",").forEach(function (z, i) {
        szene.time.delayedCall(400 + i * 1300, function () {
          if (WERKBANK.WERKZEUG_EIG[z]) szene.pruefen(z); else if (ARTEN[z]) szene.bestimmen(z);
        });
      });
    }
  }

  sag(t) { this.sagText.setText(this.sprecher + ": " + t); }

  anordnen() {
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(12), P = MASS.px;
    this.b = b; this.h = h;
    this.grund.clear().fillStyle(0x000000, 0.6).fillRect(0, 0, b, h)
      .fillStyle(FARBE.papier, 0.98).fillRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, P(14))
      .lineStyle(P(3), FARBE.papierRand, 1).strokeRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, P(14));
    var innen = rand + P(12), oben = innen + P(30), unten = h - innen, luecke = P(6);
    this.titel.setPosition(innen, innen);

    // Quer: Tisch links, Steckbrief rechts. Hoch: übereinander.
    var quer = b / h >= 1.1, links, rechts;
    var knopfH = P(38);
    if (quer) {
      var lb = (b - 2 * innen - P(20)) * 0.5;
      links = { x: innen, y: oben, b: lb, h: unten - oben };
      rechts = { x: innen + lb + P(20), y: oben, b: b - innen - (innen + lb + P(20)), h: unten - oben };
    } else {
      var th = (unten - oben) * 0.36;
      links = { x: innen, y: oben, b: b - 2 * innen, h: th };
      rechts = { x: innen, y: oben + th + P(12), b: b - 2 * innen, h: unten - oben - th - P(12) };
    }

    // ---------- Links: Tisch mit Probe, darunter die Werkzeuge ----------
    var tischH = links.h - knopfH - P(10);
    this.tischZeichnen(links.x, links.y, links.b, tischH);
    var kb = (links.b - 3 * luecke) / 4;
    this.werkzeugKnoepfe.forEach(function (k, i) {
      k.setzeBreite(kb / MASS.dpr);
      k.setPosition(links.x + i * (kb + luecke) + kb / 2, links.y + links.h - knopfH / 2);
    });

    // ---------- Rechts: Steckbrief, Ergebnis, Stoffwahl ----------
    // Unten eine Reihe Stoffknöpfe (nach der Entscheidung steht dort
    // „Weiter“), darüber zwei Zeilen Ergebnis; der Steckbrief nimmt den Rest.
    var sh = P(34), ergebnisH = P(24) + 2 * P(17), kopfH = P(28), polster = P(6);
    var frei = rechts.h - sh - P(8) - ergebnisH - P(8) - kopfH - polster;
    var zeileH = Math.max(P(15), Math.min(P(22), Math.floor(frei / WERKBANK_ZEILEN.length)));
    var karteH = kopfH + WERKBANK_ZEILEN.length * zeileH + polster;
    var kx = rechts.x, ky = rechts.y, kbr = rechts.b;
    this.karte.clear()
      .fillStyle(0x000000, 0.12).fillRoundedRect(kx + P(3), ky + P(4), kbr, karteH, P(8))
      .fillStyle(0xfffaf0, 1).fillRoundedRect(kx, ky, kbr, karteH, P(8))
      .lineStyle(P(2), FARBE.papierRand, 1).strokeRoundedRect(kx, ky, kbr, karteH, P(8))
      .fillStyle(0xe2cfa6, 1).fillRoundedRect(kx + P(1), ky + P(1), kbr - P(2), kopfH - P(2), { tl: P(7), tr: P(7), bl: 0, br: 0 })
      .lineStyle(P(1), FARBE.papierRand, 0.6).lineBetween(kx, ky + kopfH, kx + kbr, ky + kopfH);
    this.briefKopf.setPosition(kx + polster, ky + (kopfH - this.briefKopf.height) / 2);
    this.briefNr.setPosition(kx + kbr - polster, ky + (kopfH - this.briefNr.height) / 2);
    var spalte = Math.min(P(90), kbr * 0.4), karte = this.karte;
    this.briefZeilen.forEach(function (z, i) {
      var zy = ky + kopfH + P(2) + i * zeileH;
      z.name.setPosition(kx + polster + P(4), zy + (zeileH - z.name.height) / 2);
      z.wert.setPosition(kx + polster + P(4) + spalte, zy + (zeileH - z.wert.height) / 2);
      if (i > 0) karte.lineStyle(P(1), FARBE.papierRand, 0.18).lineBetween(kx + polster, zy, kx + kbr - polster, zy);
    });

    var ey = ky + karteH + P(8);
    this.ergebnisKopf.setPosition(kx, ey);
    this.sagText.setPosition(kx, ey + P(24)).setWordWrapWidth(kbr, true).setMaxLines(2);

    // Die fünf Stoffe in einer Reihe am unteren Rand
    var n = WERKBANK_STOFFE.length, sb = (kbr - (n - 1) * P(4)) / n, sy = rechts.y + rechts.h - sh / 2;
    this.stoffKnoepfe.forEach(function (k, i) {
      k.setzeBreite(sb / MASS.dpr);
      k.setPosition(kx + i * (sb + P(4)) + sb / 2, sy);
    });
    this.weiterKnopf.setzeBreite(Math.min(kbr, P(200)) / MASS.dpr);
    this.weiterKnopf.setPosition(kx + kbr - this.weiterKnopf.width / 2, sy);

    if (this.probe) this.probe.setPosition(this.probeOrt.x, this.probeOrt.y);
    this.befundZeigen();
  }

  // Maras Tisch: Holzplatte mit Maserung, Vorderkante und zwei Beinen.
  tischZeichnen(x, y, b, h) {
    var P = MASS.px, g = this.tisch.clear();
    var platteY = y + h * 0.18, platteH = h * 0.56, kante = P(14), beinH = h - (platteY - y) - platteH - kante;
    // Beine
    g.fillStyle(0x5a3a1e, 1)
      .fillRect(x + b * 0.08, platteY + platteH + kante, P(16), beinH)
      .fillRect(x + b * 0.92 - P(16), platteY + platteH + kante, P(16), beinH);
    // Platte (leicht trapezförmig: hinten schmaler)
    var ein = b * 0.06;
    g.fillStyle(0xc28a52, 1).fillPoints([
      { x: x + ein, y: platteY }, { x: x + b - ein, y: platteY },
      { x: x + b, y: platteY + platteH }, { x: x, y: platteY + platteH }
    ], true);
    // Maserung
    g.lineStyle(P(1), 0x9c6a3a, 0.55);
    for (var i = 1; i < 6; i++) {
      var my = platteY + platteH * i / 6, e = ein * (1 - i / 6);
      g.lineBetween(x + e + P(6), my, x + b - e - P(6), my + P(2) * ((i % 2) ? 1 : -1));
    }
    // Vorderkante
    g.fillStyle(0x7a4e2a, 1).fillRect(x, platteY + platteH, b, kante);
    g.lineStyle(P(1), 0x3d2412, 0.6).strokeRect(x, platteY + platteH, b, kante);
    this.probeOrt = { x: x + b / 2, y: platteY + platteH * 0.55 };
  }

  neueProbe() {
    this.inhalt.forEach(function (o) { o.destroy(); });
    this.inhalt = [];
    this.werkzeugTeile = [];
    var p = WERKBANK.probe(this.w), a = ARTEN[p.stoff];
    this.briefNr.setText("Kiste " + (this.w.nr + 1) + " von " + this.w.proben.length);
    this.ergebnisKopf.setText("Das ist: ?").setColor(FARBE.tinte);
    // Die Probe: ein Brocken oder ein Häufchen Pulver im Uhrglas, mit Schatten
    var c = this.add.container(this.probeOrt.x, this.probeOrt.y), g = this.add.graphics();
    var farbe = WERKBANK_FARBE[a.steckbrief.farbe] || 0x888888, s = MASS.px(1);
    var P = function (liste) { return liste.map(function (q) { return { x: q[0] * s, y: q[1] * s }; }); };
    g.fillStyle(0x000000, 0.25).fillEllipse(2 * s, 22 * s, 84 * s, 16 * s);
    if (a.form === "pulver") {
      g.fillStyle(0xeef3f6, 0.95).fillEllipse(0, 16 * s, 88 * s, 22 * s);
      g.lineStyle(2 * s, 0x9fb0bb, 1).strokeEllipse(0, 16 * s, 88 * s, 22 * s);
      [[0, 6, 20], [-18, 12, 13], [18, 12, 14], [-7, -2, 12], [9, -1, 12]].forEach(function (k) {
        g.fillStyle(farbe, 1).fillCircle(k[0] * s, k[1] * s, k[2] * s);
      });
      g.fillStyle(0x000000, 0.12).fillEllipse(0, 18 * s, 56 * s, 10 * s);
    } else {
      var umriss = P([[-36, 12], [-30, -10], [-12, -22], [10, -21], [30, -10], [37, 6], [26, 19], [-22, 20]]);
      g.fillStyle(farbe, 1).fillPoints(umriss, true);
      // untere Hälfte im Schatten, damit es wie ein Körper wirkt
      g.fillStyle(0x000000, 0.18).fillPoints(P([[-36, 12], [37, 6], [26, 19], [-22, 20]]), true);
      g.lineStyle(2 * s, 0x000000, 0.45).strokePoints(umriss, true, true);
      if (a.steckbrief.glanz) g.fillStyle(0xffffff, 0.6).fillPoints(P([[-20, -12], [-8, -18], [8, -17], [-2, -12]]), true);
    }
    c.add(g);
    this.probe = c;
    this.inhalt.push(c);
    this.befundZeigen();
  }

  befundZeigen() {
    if (!this.w) return;
    var b = this.w.befunde;
    this.briefZeilen.forEach(function (z, i) {
      var wert = WERKBANK_ZEILEN[i][1](b);
      z.wert.setText(wert === undefined ? "?" : wert).setColor(wert === undefined ? "#a08a6a" : "#2b1d10");
    });
  }

  // Ein Werkzeug anwenden: Animation, dann Befund
  pruefen(werkzeug) {
    if (this.beschaeftigt || this.w.fertig) return;
    this.beschaeftigt = true;
    // Die Grafik des vorigen Werkzeugs weg, die Probe zurück in Form
    (this.werkzeugTeile || []).forEach(function (o) { o.destroy(); });
    this.werkzeugTeile = [];
    this.probe.setScale(1).setPosition(this.probeOrt.x, this.probeOrt.y);
    var szene = this, befunde = WERKBANK.pruefe(this.w, werkzeug), p = this.probe, s = MASS.px(1);
    var teil = function (o) { szene.werkzeugTeile.push(o); szene.inhalt.push(o); return o; };
    var fertig = function () { szene.befundZeigen(); szene.sag(befunde.map(function (x) { return x.text; }).join(" ")); szene.beschaeftigt = false; };
    var wert = befunde[0].wert;
    if (werkzeug === "magnet") {
      var m = this.add.graphics().lineStyle(10 * s, 0xc0453a, 1);
      m.beginPath(); m.arc(0, 0, 22 * s, Math.PI * 0.5, Math.PI * 1.5, false); m.strokePath();
      m.setPosition(p.x + 120 * s, p.y); teil(m);
      this.tweens.add({ targets: m, x: p.x + 70 * s, duration: 350, onComplete: function () {
        if (wert) szene.tweens.add({ targets: p, x: p.x + 14 * s, duration: 140, yoyo: true, repeat: 1, onComplete: fertig });
        else szene.time.delayedCall(300, fertig);
      } });
    } else if (werkzeug === "stromkreis") {
      var l = this.add.graphics();
      var lx = p.x - 80 * s, ly = p.y - 4 * s;
      l.lineStyle(2 * s, 0x3a2a1c, 1).lineBetween(lx, ly - 13 * s, lx, ly - 26 * s).lineBetween(lx, ly - 26 * s, p.x - 24 * s, ly - 26 * s).lineBetween(p.x - 24 * s, ly - 26 * s, p.x - 24 * s, ly - 14 * s)
        .lineBetween(lx, ly + 13 * s, lx, ly + 26 * s).lineBetween(lx, ly + 26 * s, p.x + 20 * s, ly + 26 * s).lineBetween(p.x + 20 * s, ly + 26 * s, p.x + 20 * s, ly + 18 * s);
      l.fillStyle(0x777777, 1).fillCircle(lx, ly, 13 * s);
      teil(l);
      this.time.delayedCall(350, function () {
        if (wert) l.fillStyle(0xffe08a, 0.35).fillCircle(lx, ly, 26 * s).fillStyle(0xffd23a, 1).fillCircle(lx, ly, 13 * s);
        szene.time.delayedCall(300, fertig);
      });
    } else if (werkzeug === "hammer") {
      var hm = this.add.graphics().fillStyle(0x6b4424, 1).fillRect(-4 * s, -50 * s, 8 * s, 50 * s).fillStyle(0x777b80, 1).fillRect(-18 * s, -62 * s, 36 * s, 16 * s);
      hm.setPosition(p.x + 30 * s, p.y - 10 * s).setAngle(-50); teil(hm);
      this.tweens.add({ targets: hm, angle: 10, duration: 220, ease: "Quad.easeIn", onComplete: function () {
        if (wert) szene.tweens.add({ targets: p, scaleY: 0.8, scaleX: 1.1, duration: 160, onComplete: fertig });
        else {
          for (var i = 0; i < 6; i++) {
            var sp = szene.add.graphics().fillStyle(WERKBANK_FARBE[ARTEN[WERKBANK.probe(szene.w).stoff].steckbrief.farbe] || 0x888888, 1).fillRect(-4 * s, -4 * s, 8 * s, 8 * s);
            sp.setPosition(p.x, p.y); teil(sp);
            szene.tweens.add({ targets: sp, x: p.x + (Math.random() - 0.5) * 140 * s, y: p.y + (Math.random() - 0.6) * 50 * s, angle: 200, alpha: 0.2, duration: 450 });
          }
          szene.time.delayedCall(480, fertig);
        }
      } });
    } else {
      var r = this.add.graphics().lineStyle(5 * s, 0x3a2a1c, 1).strokeCircle(0, 0, 40 * s).lineBetween(28 * s, 28 * s, 60 * s, 60 * s);
      r.setPosition(p.x - 14 * s, p.y - 10 * s).setScale(0.6).setAlpha(0); teil(r);
      this.tweens.add({ targets: r, scale: 1, alpha: 1, duration: 300, onComplete: function () { szene.time.delayedCall(250, fertig); } });
    }
  }

  bestimmen(art) {
    if (this.beschaeftigt || this.w.fertig) return;
    var wahr = WERKBANK.probe(this.w).stoff;
    var r = WERKBANK.bestimme(this.w, art);
    this.sag(r.text);
    if (r.weiter) {
      this.beschaeftigt = true;
      this.ergebnisKopf.setText("Das ist: " + ARTEN[wahr].name + (r.richtig ? " ✓" : ""))
        .setColor(r.richtig ? "#2e6b2a" : "#8a3a1c");
      this.stoffKnoepfe.forEach(function (k) { k.setVisible(false); });
      this.weiterKnopf.setVisible(true);
      if (r.richtig) this.tweens.add({ targets: this.probe, y: this.probe.y - MASS.px(10), duration: 160, yoyo: true });
    } else {
      this.cameras.main.shake(120, 0.004);
    }
  }

  weiter() {
    this.weiterKnopf.setVisible(false);
    this.stoffKnoepfe.forEach(function (k) { k.setVisible(true); });
    if (this.w.fertig) {
      this.scene.stop();
      if (this.daten.beiEnde) this.daten.beiEnde();
      return;
    }
    this.beschaeftigt = false;
    this.neueProbe();
    if (this.w.nr === this.w.proben.length - 1) this.sag("Die letzte Kiste.");
    else this.sag("Nächste Kiste.");
  }
}
