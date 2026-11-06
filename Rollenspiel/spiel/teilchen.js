// ============================================================
//  TEILCHEN-SZENE – Minispiele der Teilchin-Quest (seit Fassung 26)
//
//  Zeigt an, was kern\teilchen.js entscheidet. Zwei Arten:
//   · "teilchenkisten": oben drei Kästen (fest, flüssig, gasförmig),
//     unten drei Bilder mit bewegten Teilchen. Bild antippen, dann
//     Kasten antippen.
//   · "duftspur": zwei Gläser, kalt und warm. In jedes fällt ein
//     Tropfen Tinte; im warmen verteilt er sich schneller. Man tippt
//     das Glas an, in dem es schneller ging.
//  Gestartet über { minispiel: "teilchenkisten" | "duftspur" } (spiel\ui.js).
//  Leitlinie: wenig Text, eine Minute, Symbole statt Erklärung.
// ============================================================

class TeilchenSzene extends Phaser.Scene {
  constructor() { super("teilchen"); }

  // daten: { cfg: { minispiel, sprecher }, beiEnde }
  create(daten) {
    this.daten = daten;
    this.art = daten.cfg.minispiel;
    this.sprecher = daten.cfg.sprecher || "Hella";
    this.zeit = 0;
    this.grund = this.add.graphics();
    this.bild = this.add.graphics();
    this.titel = this.add.text(0, 0, this.art === "duftspur" ? "Die Duftspur" : "Teilchenkisten",
      { fontFamily: SCHRIFT.titel, fontSize: MASS.px(18) + "px", color: FARBE.tinte, fontStyle: "bold" });
    this.sagText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(14) + "px", color: FARBE.tinte, lineSpacing: MASS.px(2) });
    this.beschriftungen = [];
    this.zonen = [];
    this.weiterKnopf = baueKnopf(this, "Weiter ›", function () { this.beenden(); }.bind(this), { hoehe: 36, schrift: 15, mindestbreite: 90 }).setVisible(false);

    if (this.art === "duftspur") {
      this.d = TEILCHEN.neuDuft();
      this.sag("Ein Tropfen Tinte in kaltes und in warmes Wasser. Schau zu – wo verteilt sich die Farbe schneller? Tipp auf das Glas.");
    } else {
      this.z = TEILCHEN.neuKisten();
      this.auswahl = null;
      this.sag("Welches Bild gehört zu fest, flüssig, gasförmig? Tipp ein Bild an, dann den Kasten.");
    }
    this.punkte = this.neuePunkte();
    this.anordnen();
    this.scale.on("resize", this.anordnen, this);
    this.events.once("shutdown", function () { this.scale.off("resize", this.anordnen, this); }, this);
  }

  sag(t) { this.sagText.setText(this.sprecher + ": " + t); }

  // Feste Startplätze der Teilchen je Bild (0 … 1 im Feld), mit eigenem Zittern
  neuePunkte() {
    var p = {}, z = 0;
    function zufall() { z = (z * 9301 + 49297) % 233280; return z / 233280; }
    p.geordnet = []; for (var r = 0; r < 4; r++) for (var s = 0; s < 5; s++) p.geordnet.push({ x: 0.14 + s * 0.18, y: 0.2 + r * 0.2, ph: zufall() * 6 });
    p.durcheinander = []; for (var i = 0; i < 18; i++) p.durcheinander.push({ x: 0.1 + zufall() * 0.8, y: 0.35 + zufall() * 0.55, ph: zufall() * 6, v: 0.5 + zufall() });
    p.weit = []; for (i = 0; i < 6; i++) p.weit.push({ x: zufall(), y: zufall(), vx: (zufall() - 0.5) * 0.9, vy: (zufall() - 0.5) * 0.9 });
    p.tinte = []; for (i = 0; i < 40; i++) p.tinte.push({ w: zufall() * Math.PI * 2, r: Math.pow(zufall(), 0.6) });
    return p;
  }

  anordnen() {
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(12), P = MASS.px;
    this.b = b; this.h = h;
    this.grund.clear().fillStyle(0x000000, 0.6).fillRect(0, 0, b, h)
      .fillStyle(FARBE.papier, 0.98).fillRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, P(14))
      .lineStyle(P(3), FARBE.papierRand, 1).strokeRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, P(14));
    var innen = rand + P(12);
    this.titel.setPosition(innen, innen);
    var unten = h - innen - P(48);
    this.sagText.setPosition(innen, unten + P(4)).setWordWrapWidth(b - 2 * innen - P(110), true).setMaxLines(3);
    this.weiterKnopf.setPosition(b - innen - P(50), h - innen - P(22));
    this.zonen.forEach(function (z) { z.destroy(); });
    this.beschriftungen.forEach(function (t) { t.destroy(); });
    this.zonen = []; this.beschriftungen = [];
    var oben = innen + P(32), frei = unten - oben - P(8);

    if (this.art === "duftspur") {
      var gb = Math.min((b - 2 * innen - P(40)) / 2, frei * 0.9), gy = oben + (frei - gb) / 2;
      this.glaeser = ["links", "rechts"].map(function (seite, i) {
        var gx = b / 2 + (i === 0 ? -P(20) - gb : P(20));
        return { seite: seite, x: gx, y: gy, b: gb, h: gb };
      });
      this.glaeser.forEach(function (g) {
        var warm = g.seite === this.d.warm;
        this.beschriftungen.push(this.add.text(g.x + g.b / 2, g.y - P(2), warm ? "warm 🔥" : "kalt ❄", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(14) + "px", color: warm ? "#b8322a" : "#2f6fb0", fontStyle: "bold" }).setOrigin(0.5, 1));
        this.zone(g.x, g.y, g.b, g.h, function () { this.glasGewaehlt(g.seite); });
      }, this);
    } else {
      var n = 3, luecke = P(10), kb = (b - 2 * innen - (n - 1) * luecke) / n, kh = frei * 0.48;
      this.kaesten = TEILCHEN.KISTEN.map(function (k, i) { return { id: k.id, name: k.name, x: innen + i * (kb + luecke), y: oben, b: kb, h: kh }; });
      this.karten = TEILCHEN.BILDER.map(function (bild, i) { return { bild: bild, x: innen + i * (kb + luecke) + kb * 0.15, y: oben + kh + P(10), b: kb * 0.7, h: frei - kh - P(12) }; });
      // Die Reihenfolge der Bilder unten folgt der gemischten Liste
      var reihe = this.z.offen.concat(Object.keys(this.z.gelegt).map(function (k) { return this.z.gelegt[k]; }, this));
      this.karten.sort(function (a, c) { return reihe.indexOf(a.bild) - reihe.indexOf(c.bild); });
      this.karten.forEach(function (k, i) { k.x = innen + i * (kb + luecke) + kb * 0.15; });
      this.kaesten.forEach(function (k) {
        this.beschriftungen.push(this.add.text(k.x + k.b / 2, k.y + P(4), k.name, { fontFamily: SCHRIFT.familie, fontSize: MASS.px(15) + "px", color: FARBE.tinte, fontStyle: "bold" }).setOrigin(0.5, 0));
        this.zone(k.x, k.y, k.b, k.h, function () { this.kastenGewaehlt(k.id); });
      }, this);
      this.karten.forEach(function (k) { this.zone(k.x, k.y, k.b, k.h, function () { this.karteGewaehlt(k.bild); }); }, this);
    }
  }

  zone(x, y, b, h, beiKlick) {
    var z = this.add.zone(x, y, b, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    z.on("pointerdown", beiKlick, this);
    this.zonen.push(z);
  }

  // ---------- Teilchenkisten ----------
  karteGewaehlt(bild) {
    if (this.z.fertig || this.z.offen.indexOf(bild) < 0) return;
    this.auswahl = bild;
  }

  kastenGewaehlt(id) {
    if (this.z.fertig || !this.auswahl) return;
    var r = TEILCHEN.lege(this.z, this.auswahl, id);
    this.sag(r.text);
    this.auswahl = null;
    if (this.z.fertig) this.weiterKnopf.setVisible(true);
  }

  // ---------- Duftspur ----------
  glasGewaehlt(seite) {
    if (this.d.fertig || this.zeit < 1.5) return;
    var r = TEILCHEN.waehle(this.d, seite);
    this.sag(r.text);
    if (r.richtig) this.weiterKnopf.setVisible(true);
    else this.zeit = 0;   // noch einmal zusehen
  }

  beenden() {
    this.scene.stop();
    if (this.daten.beiEnde) this.daten.beiEnde();
  }

  // ---------- Zeichnen: Teilchen bewegen sich ständig ----------
  update(zeit, delta) {
    this.zeit += delta / 1000;
    var g = this.bild.clear(), P = MASS.px, t = zeit / 1000, szene = this;
    if (this.art === "duftspur") {
      this.glaeser.forEach(function (gl) {
        var warm = gl.seite === szene.d.warm;
        g.fillStyle(0xd8eef8, 0.9).fillRoundedRect(gl.x, gl.y, gl.b, gl.h, P(6));
        g.lineStyle(P(2), 0x7fa7c0, 1).strokeRoundedRect(gl.x, gl.y, gl.b, gl.h, P(6));
        // Ausbreitung: im warmen Glas nach 3 s überall, im kalten erst nach 25 s –
        // so bleibt der Unterschied lange zu sehen.
        var reichweite = Math.min(1, szene.zeit / (warm ? 3 : 25));
        var mx = gl.x + gl.b / 2, my = gl.y + gl.h * 0.3;
        szene.punkte.tinte.forEach(function (p, i) {
          var zitter = (warm ? 3 : 1) * Math.sin(t * (warm ? 6 : 2) + i);
          var px = mx + Math.cos(p.w) * p.r * reichweite * gl.b * 0.45 + P(zitter);
          var py = my + Math.abs(Math.sin(p.w)) * p.r * reichweite * gl.h * 0.65 + P(zitter);
          g.fillStyle(0x3a3aa8, 0.55).fillCircle(px, py, P(4));
        });
      });
      return;
    }
    var gewaehlt = this.auswahl;
    this.kaesten.forEach(function (k) {
      g.fillStyle(0xfffaf0, 1).fillRoundedRect(k.x, k.y, k.b, k.h, P(8)).lineStyle(P(2), FARBE.papierRand, 1).strokeRoundedRect(k.x, k.y, k.b, k.h, P(8));
      var bild = szene.z.gelegt[k.id];
      if (bild) szene.teilchenMalen(g, bild, k.x + P(6), k.y + P(26), k.b - P(12), k.h - P(32), t);
    });
    this.karten.forEach(function (k) {
      if (szene.z.offen.indexOf(k.bild) < 0) return;
      g.fillStyle(gewaehlt === k.bild ? 0xfff0b0 : 0xf4ead5, 1).fillRoundedRect(k.x, k.y, k.b, k.h, P(8))
        .lineStyle(P(gewaehlt === k.bild ? 4 : 2), gewaehlt === k.bild ? 0xd9a63a : FARBE.papierRand, 1).strokeRoundedRect(k.x, k.y, k.b, k.h, P(8));
      szene.teilchenMalen(g, k.bild, k.x + P(4), k.y + P(4), k.b - P(8), k.h - P(8), t);
    });
  }

  teilchenMalen(g, bild, x, y, b, h, t) {
    var P = MASS.px, r = Math.max(P(3), Math.min(b, h) * 0.07);
    g.fillStyle(0xd96a3a, 1);
    if (bild === "geordnet") {
      this.punkte.geordnet.forEach(function (p) { g.fillCircle(x + p.x * b + Math.sin(t * 9 + p.ph) * P(1), y + p.y * h + Math.cos(t * 8 + p.ph) * P(1), r); });
    } else if (bild === "durcheinander") {
      this.punkte.durcheinander.forEach(function (p) { g.fillCircle(x + (p.x + 0.05 * Math.sin(t * p.v * 2 + p.ph)) * b, y + (p.y + 0.04 * Math.cos(t * p.v * 2 + p.ph)) * h, r); });
    } else {
      this.punkte.weit.forEach(function (p) {
        var px = ((p.x + p.vx * t) % 1 + 1) % 1, py = ((p.y + p.vy * t) % 1 + 1) % 1;
        var fx = px < 0.5 ? px * 2 : 2 - px * 2, fy = py < 0.5 ? py * 2 : 2 - py * 2;   // an den Wänden abprallen
        g.fillCircle(x + r + fx * (b - 2 * r), y + r + fy * (h - 2 * r), r);
      });
    }
  }
}
