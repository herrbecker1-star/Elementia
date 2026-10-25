// ============================================================
//  WERKBANK – das Minispiel zu Maras Kisten
//
//  Zeigt an, was kern\werkbank.js entscheidet. Links liegt die Probe,
//  darunter die vier Werkzeuge. Jedes Werkzeug spielt eine kurze
//  Animation: Der Magnet zieht oder nicht, das Lämpchen leuchtet oder
//  bleibt dunkel, unter dem Hammer biegt oder splittert das Stück, die
//  Lupe zeigt Farbe und Glanz. Rechts wächst die Befundtabelle; darunter
//  legt man die Probe zum passenden Stoff.
//
//  Gestartet über den Ablaufschritt { minispiel: "werkbank" } (spiel\ui.js).
// ============================================================

var WERKBANK_FARBE = {
  "grau": 0x8a8f96, "silbrig": 0xc9ced3, "schwarz": 0x2e2e30, "rötlich": 0xb8643a,
  "bläulich-grau": 0x8a9bb0, "gelb": 0xe8d23a
};
var WERKBANK_STOFFE = ["kohlenstoff", "kupfer", "zink", "schwefel", "eisen"];

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
    this.titel = this.add.text(0, 0, "", { fontFamily: SCHRIFT.titel, fontSize: MASS.px(18) + "px", color: FARBE.tinte, fontStyle: "bold" });
    this.sagText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(15) + "px", color: FARBE.tinte, lineSpacing: MASS.px(2) });
    this.befundText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: "#3a2a1c", lineSpacing: MASS.px(4) });
    this.werkzeugKnoepfe = [
      ["lupe", "🔍 Lupe"], ["magnet", "🧲 Magnet"], ["stromkreis", "💡 Lämpchen"], ["hammer", "🔨 Hammer"]
    ].map(function (p) {
      return baueKnopf(this, p[1], function () { this.pruefen(p[0]); }.bind(this), { hoehe: 38, schrift: 14, mindestbreite: 80 });
    }, this);
    this.stoffKnoepfe = WERKBANK_STOFFE.map(function (art) {
      return baueKnopf(this, ARTEN[art].name, function () { this.bestimmen(art); }.bind(this), { hoehe: 36, schrift: 14, mindestbreite: 80 });
    }, this);
    this.weiterKnopf = baueKnopf(this, "Weiter ›", function () { this.weiter(); }.bind(this), { hoehe: 38, schrift: 15, mindestbreite: 110 }).setVisible(false);

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
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(12);
    this.b = b; this.h = h;
    this.grund.clear().fillStyle(0x000000, 0.6).fillRect(0, 0, b, h)
      .fillStyle(FARBE.papier, 0.98).fillRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14))
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).strokeRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14));
    var innen = rand + MASS.px(12);
    this.titel.setPosition(innen, innen);
    var linksB = (b - 2 * innen) * 0.46;
    // Probe in der linken Hälfte
    this.probeOrt = { x: innen + linksB / 2, y: h * 0.38 };
    // Werkzeuge unter der Probe
    var kb = (linksB - 3 * MASS.px(6)) / 4;
    this.werkzeugKnoepfe.forEach(function (k, i) {
      k.setzeBreite(kb / MASS.dpr);
      k.setPosition(innen + i * (kb + MASS.px(6)) + kb / 2, h * 0.66);
    });
    // Rechts: Befunde und Stoffwahl
    var rx = innen + linksB + MASS.px(20), rb = b - innen - rx;
    this.befundText.setPosition(rx, innen + MASS.px(30)).setWordWrapWidth(rb, true);
    var sb = (rb - 2 * MASS.px(6)) / 3;
    this.stoffKnoepfe.forEach(function (k, i) {
      k.setzeBreite(sb / MASS.dpr);
      k.setPosition(rx + (i % 3) * (sb + MASS.px(6)) + sb / 2, h * 0.58 + Math.floor(i / 3) * MASS.px(44));
    });
    this.sagText.setPosition(innen, h * 0.76).setWordWrapWidth(b - 2 * innen - MASS.px(130), true);
    this.weiterKnopf.setPosition(b - innen - this.weiterKnopf.width / 2, h - innen - this.weiterKnopf.height / 2);
    this.befundZeigen();
  }

  neueProbe() {
    this.inhalt.forEach(function (o) { o.destroy(); });
    this.inhalt = [];
    var p = WERKBANK.probe(this.w), a = ARTEN[p.stoff];
    this.titel.setText("Maras Werkbank · Kiste " + (this.w.nr + 1) + " von " + this.w.proben.length);
    // Die Probe: ein Stück oder ein Häufchen Pulver, in der Stofffarbe
    var c = this.add.container(this.probeOrt.x, this.probeOrt.y), g = this.add.graphics();
    var farbe = WERKBANK_FARBE[a.steckbrief.farbe] || 0x888888, s = MASS.px(1);
    if (a.form === "pulver") {
      [[0, 10, 34], [-26, 18, 22], [26, 18, 24], [-12, -6, 20], [14, -4, 20]].forEach(function (k) {
        g.fillStyle(farbe, 1).fillCircle(k[0] * s, k[1] * s, k[2] * s);
      });
    } else {
      g.fillStyle(farbe, 1).fillRoundedRect(-60 * s, -34 * s, 120 * s, 68 * s, 12 * s);
      g.lineStyle(2 * s, 0x000000, 0.35).strokeRoundedRect(-60 * s, -34 * s, 120 * s, 68 * s, 12 * s);
    }
    if (a.steckbrief.glanz) g.fillStyle(0xffffff, 0.55).fillRoundedRect(-44 * s, -26 * s, 50 * s, 8 * s, 4 * s);
    c.add(g);
    this.probe = c;
    this.inhalt.push(c);
    this.befundZeigen();
  }

  befundZeigen() {
    if (!this.w) return;
    var b = this.w.befunde, zeilen = ["Befunde"];
    if (b.farbe !== undefined) zeilen.push("Lupe:  " + b.farbe + ", " + (b.glanz ? "glänzt" : "matt"));
    if (b.magnetisch !== undefined) zeilen.push("Magnet:  " + (b.magnetisch ? "zieht an" : "keine Wirkung"));
    if (b.leitfaehig !== undefined) zeilen.push("Lämpchen:  " + (b.leitfaehig ? "leuchtet" : "bleibt dunkel"));
    if (b.verformbar !== undefined) zeilen.push("Hammer:  " + (b.verformbar ? "verbiegt sich" : "splittert"));
    if (zeilen.length === 1) zeilen.push("noch nichts geprüft");
    this.befundText.setText(zeilen.join("\n"));
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
      m.setPosition(p.x + 140 * s, p.y); teil(m);
      this.tweens.add({ targets: m, x: p.x + 95 * s, duration: 350, onComplete: function () {
        if (wert) szene.tweens.add({ targets: p, x: p.x + 18 * s, duration: 140, yoyo: true, repeat: 1, onComplete: fertig });
        else szene.time.delayedCall(300, fertig);
      } });
    } else if (werkzeug === "stromkreis") {
      var l = this.add.graphics();
      var lx = p.x - 100 * s, ly = p.y;
      l.lineStyle(2 * s, 0x3a2a1c, 1).lineBetween(lx, ly - 13 * s, lx, ly - 30 * s).lineBetween(lx, ly - 30 * s, p.x - 40 * s, ly - 30 * s)
        .lineBetween(lx, ly + 13 * s, lx, ly + 30 * s).lineBetween(lx, ly + 30 * s, p.x - 40 * s, ly + 30 * s);
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
        if (wert) szene.tweens.add({ targets: p, scaleY: 0.82, scaleX: 1.08, duration: 160, onComplete: fertig });
        else {
          for (var i = 0; i < 6; i++) {
            var sp = szene.add.graphics().fillStyle(WERKBANK_FARBE[ARTEN[WERKBANK.probe(szene.w).stoff].steckbrief.farbe] || 0x888888, 1).fillRect(-5 * s, -5 * s, 10 * s, 10 * s);
            sp.setPosition(p.x, p.y); teil(sp);
            szene.tweens.add({ targets: sp, x: p.x + (Math.random() - 0.5) * 160 * s, y: p.y + (Math.random() - 0.3) * 90 * s, angle: 200, alpha: 0.2, duration: 450 });
          }
          szene.time.delayedCall(480, fertig);
        }
      } });
    } else {
      var r = this.add.graphics().lineStyle(5 * s, 0x3a2a1c, 1).strokeCircle(0, 0, 48 * s).lineBetween(34 * s, 34 * s, 70 * s, 70 * s);
      r.setPosition(p.x - 20 * s, p.y - 10 * s).setScale(0.6).setAlpha(0); teil(r);
      this.tweens.add({ targets: r, scale: 1, alpha: 1, duration: 300, onComplete: function () { szene.time.delayedCall(250, fertig); } });
    }
  }

  bestimmen(art) {
    if (this.beschaeftigt || this.w.fertig) return;
    var r = WERKBANK.bestimme(this.w, art);
    this.sag(r.text);
    if (r.weiter) {
      this.beschaeftigt = true;
      this.weiterKnopf.setVisible(true);
      if (r.richtig) this.tweens.add({ targets: this.probe, y: this.probe.y - MASS.px(10), duration: 160, yoyo: true });
    } else {
      this.cameras.main.shake(120, 0.004);
    }
  }

  weiter() {
    this.weiterKnopf.setVisible(false);
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
