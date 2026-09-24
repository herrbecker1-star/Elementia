// ============================================================
//  KAMPFSZENE – zeigt an, was kern\kampf.js entscheidet
//
//  Die Szene rechnet nichts selbst. Sie ruft KAMPF.zug auf und
//  spielt das Protokoll der Runde ab: Text für Text, mit Wackeln
//  bei Treffern und Balken, die nachlaufen.
//
//  Aufbau (Querformat):
//    oben links   Gegner: Name (oder „unbekannt“), Stufe, Zusammenhalt, Befunde
//    oben rechts  Feld: Sauerstoff, Wärme, Feuchte
//    Mitte        die beiden Elementals – der Gegner rechts hinten, das eigene links vorn
//    unten        Textleiste links, Aktionen rechts
// ============================================================

var KAMPF_HINTERGRUND = { dorf: "grafik/kampf/dorf.jpg", wald: "grafik/kampf/wald.jpg", steppe: "grafik/kampf/steppe.jpg" };

class KampfSzene extends Phaser.Scene {
  constructor() { super("kampf"); }

  // daten: { stand, gegner: { art, stufe }, feld, ort, wild, beiEnde(ende) }
  preload() {
    var szene = this;
    Object.keys(ARTEN).forEach(function (art) {
      if (!szene.textures.exists("el-" + art)) szene.load.image("el-" + art, "grafik/elementals/" + ARTEN[art].bild + ".png");
    });
    Object.keys(KAMPF_HINTERGRUND).forEach(function (ort) {
      if (!szene.textures.exists("hg-" + ort)) szene.load.image("hg-" + ort, KAMPF_HINTERGRUND[ort]);
    });
  }

  create(daten) {
    var szene = this;
    this.daten = daten;
    this.stand = daten.stand;
    this.beschaeftigt = false;
    this.weiterWartet = null;

    // Gruppe und Vorrat werden NICHT kopiert: Zusammenhalt, Erfahrung
    // und verbrauchte Geräte sollen im Spielstand ankommen.
    this.k = KAMPF.neu({
      gruppe: this.stand.gruppe,
      gegner: [KAMPF.neuesElemental(daten.gegner.art, daten.gegner.stufe)],
      feld: daten.feld,
      wild: daten.wild !== false,
      bekannt: this.stand.bekannt,
      vorrat: this.stand.vorrat,
      werkzeuge: this.stand.werkzeuge
    });

    this.hintergrund = this.add.image(0, 0, "hg-" + (daten.ort || "dorf")).setOrigin(0.5);
    this.abdunkeln = this.add.graphics();
    this.bildGegner = this.add.image(0, 0, "el-" + daten.gegner.art);
    this.bildSpieler = this.add.image(0, 0, "el-" + KAMPF.aktiv(this.k, "spieler").art).setFlipX(true);

    this.infoGegner = this.baueInfo();
    this.infoSpieler = this.baueInfo();
    this.feldAnzeige = this.add.graphics();
    this.feldText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(12) + "px", color: "#f4ead5", lineSpacing: MASS.px(4) });

    this.leiste = this.add.graphics();
    this.text = this.add.text(0, 0, "", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(16) + "px", color: FARBE.tinte, lineSpacing: MASS.px(3)
    });
    this.knoepfe = [];

    this.input.on("pointerdown", function (zeiger, getroffen) {
      if (getroffen.length) return;
      szene.weiter();
    });
    if (this.input.keyboard) this.input.keyboard.on("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") szene.weiter();
    });

    this.anordnen();
    this.scale.on("resize", this.anordnen, this);
    this.events.once("shutdown", function () { szene.scale.off("resize", szene.anordnen, szene); });

    // Auftritt: Der Gegner gleitet herein, dann der erste Satz.
    var zielX = this.bildGegner.x;
    this.bildGegner.x = this.scale.width + this.bildGegner.displayWidth;
    this.tweens.add({ targets: this.bildGegner, x: zielX, duration: 600, ease: "Cubic.easeOut" });
    this.aktualisieren();
    var erster = this.k.erkannt
      ? "Ein wildes " + ARTEN[daten.gegner.art].name + " stellt sich dir in den Weg!"
      : "Ein unbekanntes Elemental stellt sich dir in den Weg! Was mag es sein?";
    this.zeigeText(erster);
    this.zeigeHauptmenue();

    // Prüfschalter ?zuege=lupe,magnet,bestimmen:schwefel,ki,fangen:spatel
    // spielt eine Zugfolge durch die echte Szene – für kopflose Fotos
    // von Abläufen, die sonst nur ein Finger auslöst.
    var zuege = new URLSearchParams(location.search).get("zuege");
    if (zuege) this.spieleZuege(zuege.split(","));
  }

  async spieleZuege(liste) {
    for (var i = 0; i < liste.length && !this.k.ende; i++) {
      var teil = liste[i].split(":"), a;
      if (teil[0] === "ki") a = KAMPF.kiWahl(this.k, "spieler");
      else if (WERKZEUGE[teil[0]]) a = { typ: "untersuchen", werkzeug: teil[0] };
      else if (teil[0] === "bestimmen") a = { typ: "bestimmen", art: teil[1] };
      else if (teil[0] === "fangen") a = { typ: "fangen", geraet: teil[1] };
      else if (teil[0] === "fliehen") a = { typ: "fliehen" };
      else a = { typ: "reaktion", id: teil[0] };
      var weiter = this.time.addEvent({ delay: 60, loop: true, callback: this.weiter, callbackScope: this });
      await this.ausfuehren(a);
      weiter.remove();
    }
  }

  // Leichtes Atmen: Die Wesen leben, auch wenn sie stillstehen.
  // Über update statt Tween, weil anordnen() die Größe bei jedem
  // Drehen neu setzt und ein laufender Tween sie zurückdrehen würde.
  update(zeit) {
    [[this.bildGegner, 0], [this.bildSpieler, 1.3]].forEach(function (p) {
      var bild = p[0];
      if (bild.grundSkala) bild.scaleY = bild.grundSkala * (1 + 0.015 * Math.sin(zeit / 700 + p[1]));
    });
  }

  // ============================================================
  //  Anzeigen
  // ============================================================
  baueInfo() {
    var c = this.add.container(0, 0);
    c.grund = this.add.graphics();
    c.name = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(15) + "px", color: FARBE.tinte, fontStyle: "bold" });
    c.stufe = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: "#6b4a2b" }).setOrigin(1, 0);
    c.balken = this.add.graphics();
    c.zeile = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(12) + "px", color: "#5a4632" });
    c.add([c.grund, c.name, c.stufe, c.balken, c.zeile]);
    c.anteil = 1;
    return c;
  }

  zeichneInfo(c, seite) {
    var k = this.k, el = KAMPF.aktiv(k, seite);
    var w = KAMPF.grundwerte(el.art, el.stufe);
    var b = MASS.px(220), h = MASS.px(62);
    c.breite = b; c.hoehe = h;
    c.grund.clear().fillStyle(FARBE.papier, 0.93).fillRoundedRect(0, 0, b, h, MASS.px(10))
      .lineStyle(MASS.px(2), FARBE.papierRand, 1).strokeRoundedRect(0, 0, b, h, MASS.px(10));
    c.name.setText(seite === "gegner" && k.wild && !k.erkannt ? "???" : KAMPF.name(k, seite)).setPosition(MASS.px(10), MASS.px(6));
    c.stufe.setText("Stufe " + el.stufe).setPosition(b - MASS.px(10), MASS.px(8));
    var ziel = el.zh / w.zhMax;
    // Der Balken läuft dem Wert nach – so sieht man, wie viel ein Treffer kostete.
    this.tweens.addCounter({
      from: c.anteil, to: ziel, duration: 450, onUpdate: function (t) {
        c.anteil = t.getValue();
        var bb = b - MASS.px(20), y = MASS.px(27);
        var farbe = c.anteil > 0.5 ? 0x4f9a5a : c.anteil > 0.2 ? 0xd9a63a : 0xc0453a;
        c.balken.clear().fillStyle(0x3a2a1c, 0.25).fillRoundedRect(MASS.px(10), y, bb, MASS.px(9), MASS.px(4))
          .fillStyle(farbe, 1).fillRoundedRect(MASS.px(10), y, Math.max(0, bb * c.anteil), MASS.px(9), MASS.px(4));
      }
    });
    if (seite === "spieler") {
      var ae = k.seiten.spieler.ae;
      c.zeile.setText("Zusammenhalt " + el.zh + "/" + w.zhMax + "  ·  Energie " + ae + "/" + KAMPF.AE_MAX);
    } else {
      c.zeile.setText(this.befundZeile());
    }
    c.zeile.setPosition(MASS.px(10), MASS.px(40));
  }

  befundZeile() {
    var b = this.k.befunde, t = [];
    if (b.farbe !== undefined) t.push(b.farbe);
    if (b.glanz !== undefined) t.push(b.glanz ? "glänzt" : "matt");
    if (b.magnetisch !== undefined) t.push(b.magnetisch ? "magnetisch" : "nicht magnetisch");
    if (b.leitfaehig !== undefined) t.push(b.leitfaehig ? "leitet" : "leitet nicht");
    if (b.verformbar !== undefined) t.push(b.verformbar ? "verformbar" : "spröde");
    return t.length ? t.join(" · ") : "noch nicht untersucht";
  }

  zeichneFeld() {
    var f = this.k.feld, g = this.feldAnzeige;
    var b = MASS.px(100), zeile = MASS.px(18);
    var werte = [["Sauerstoff", f.sauerstoff, 0x6aa6e0], ["Wärme", f.waerme, 0xe0703a], ["Feuchte", f.feuchte, 0x4fb0a0]];
    g.clear().fillStyle(0x101418, 0.6).fillRoundedRect(0, 0, b + MASS.px(86), zeile * 3 + MASS.px(8), MASS.px(8));
    werte.forEach(function (w, i) {
      var y = MASS.px(6) + i * zeile + MASS.px(5);
      g.fillStyle(0xffffff, 0.15).fillRect(MASS.px(78), y, b, MASS.px(7));
      g.fillStyle(w[2], 1).fillRect(MASS.px(78), y, b * Math.max(0, Math.min(100, w[1])) / 100, MASS.px(7));
    });
    this.feldText.setText(werte.map(function (w) { return w[0]; }).join("\n"));
  }

  aktualisieren() {
    this.zeichneInfo(this.infoGegner, "gegner");
    this.zeichneInfo(this.infoSpieler, "spieler");
    this.zeichneFeld();
    this.bildSpieler.setTexture("el-" + KAMPF.aktiv(this.k, "spieler").art);
  }

  zeigeText(t) { this.text.setText(t); }

  // ============================================================
  //  Menüs
  // ============================================================
  leereKnoepfe() {
    this.knoepfe.forEach(function (k) { k.destroy(); });
    this.knoepfe = [];
  }

  // eintraege: [{ text, aktiv, beiKlick }]
  zeigeKnoepfe(eintraege) {
    var szene = this;
    this.leereKnoepfe();
    this.knoepfe = eintraege.map(function (e) {
      var k = baueKnopf(szene, e.text, function () {
        if (szene.beschaeftigt) return;
        if (e.aktiv === false) { if (e.grund) szene.zeigeText(e.grund); return; }
        e.beiKlick();
      }, { hoehe: eintraege.length > 6 ? 30 : 38, schrift: eintraege.length > 6 ? 12 : 13, mindestbreite: 60 });
      if (e.aktiv === false) k.setAlpha(0.45);
      return k;
    });
    this.anordnen();
  }

  zurueck() { return { text: "‹ Zurück", beiKlick: this.zeigeHauptmenue.bind(this) }; }

  zeigeHauptmenue() {
    var szene = this, k = this.k;
    this.zeigeKnoepfe([
      { text: "Reaktion", beiKlick: function () { szene.menueReaktion(); } },
      { text: "Untersuchen", beiKlick: function () { szene.menueUntersuchen(); } },
      { text: "Bestimmen", aktiv: !k.erkannt, grund: "Du weißt schon, was es ist.", beiKlick: function () { szene.menueBestimmen(); } },
      { text: "Fangen", aktiv: k.wild, beiKlick: function () { szene.menueFangen(); } },
      { text: "Wechseln", aktiv: this.stand.gruppe.filter(function (el) { return el.zh > 0; }).length > 1, grund: "Niemand sonst ist bereit.", beiKlick: function () { szene.menueWechseln(); } },
      { text: "Fliehen", aktiv: k.wild, beiKlick: function () { szene.ausfuehren({ typ: "fliehen" }); } }
    ]);
  }

  menueReaktion() {
    var szene = this, k = this.k;
    var el = KAMPF.aktiv(k, "spieler");
    var eintraege = ARTEN[el.art].reaktionen.map(function (id) {
      var r = REAKTIONEN[id], grund = KAMPF.hindernis(k, "spieler", id);
      return { text: r.name + "\n" + r.ae + " AE", aktiv: !grund, grund: grund, beiKlick: function () { szene.ausfuehren({ typ: "reaktion", id: id }); } };
    });
    eintraege.push({ text: "Kraft sammeln", beiKlick: function () { szene.ausfuehren({ typ: "sammeln" }); } });
    eintraege.push(this.zurueck());
    this.zeigeText("Welche Reaktion? Verbrennungen brauchen Sauerstoff und heizen das Feld auf.");
    this.zeigeKnoepfe(eintraege);
  }

  menueUntersuchen() {
    var szene = this;
    var eintraege = this.stand.werkzeuge.map(function (w) {
      return { text: WERKZEUGE[w].name, beiKlick: function () { szene.ausfuehren({ typ: "untersuchen", werkzeug: w }); } };
    });
    eintraege.push(this.zurueck());
    this.zeigeText("Womit prüfst du das Elemental? Jede Prüfung kostet einen Zug.");
    this.zeigeKnoepfe(eintraege);
  }

  menueBestimmen() {
    var szene = this;
    var eintraege = Object.keys(ARTEN).map(function (art) {
      return { text: ARTEN[art].name, beiKlick: function () { szene.ausfuehren({ typ: "bestimmen", art: art }); } };
    });
    eintraege.push(this.zurueck());
    this.zeigeText("Welcher Stoff ist es? Vergleiche mit deinen Befunden: " + this.befundZeile() + ".");
    this.zeigeKnoepfe(eintraege);
  }

  menueFangen() {
    var szene = this, v = this.stand.vorrat;
    var eintraege = Object.keys(FANGGERAETE).filter(function (g) { return v[g] > 0; }).map(function (g) {
      return { text: FANGGERAETE[g].kurz + " ×" + v[g], beiKlick: function () { szene.ausfuehren({ typ: "fangen", geraet: g }); } };
    });
    if (!eintraege.length) this.zeigeText("Du hast kein Fanggerät mehr dabei.");
    else this.zeigeText("Welches Gerät passt zu diesem Stoff? Ein Gerät wird nur verbraucht, wenn der Bund gelingt.");
    eintraege.push(this.zurueck());
    this.zeigeKnoepfe(eintraege);
  }

  menueWechseln() {
    var szene = this, k = this.k;
    var eintraege = [];
    this.stand.gruppe.forEach(function (el, nr) {
      if (nr === k.seiten.spieler.aktiv || el.zh <= 0) return;
      eintraege.push({ text: (el.spitzname || ARTEN[el.art].name) + " (St. " + el.stufe + ")", beiKlick: function () { szene.ausfuehren({ typ: "wechseln", nr: nr }); } });
    });
    eintraege.push(this.zurueck());
    this.zeigeText("Wen rufst du?");
    this.zeigeKnoepfe(eintraege);
  }

  // ============================================================
  //  Eine Runde abspielen
  // ============================================================
  async ausfuehren(aktion) {
    this.beschaeftigt = true;
    this.leereKnoepfe();
    var log = KAMPF.zug(this.k, aktion);
    for (var i = 0; i < log.length; i++) {
      await this.spieleEintrag(log[i]);
    }
    this.aktualisieren();
    if (this.k.erkannt && this.stand.bekannt.indexOf(this.daten.gegner.art) < 0) this.stand.bekannt.push(this.daten.gegner.art);
    if (this.k.ende) { await this.beenden(); return; }
    this.beschaeftigt = false;
    if (window.PROBE_MELDEN) window.PROBE_MELDEN("Runde " + this.k.runde + " bereit");
    this.zeigeText("Was tust du?");
    this.zeigeHauptmenue();
  }

  spieleEintrag(e) {
    var szene = this;
    if (window.PROBE_MELDEN) window.PROBE_MELDEN("› " + e.text);
    this.zeigeText(e.text);
    if (e.reaktion) {
      var bild = e.seite === "spieler" ? this.bildSpieler : this.bildGegner;
      var richtung = e.seite === "spieler" ? 1 : -1;
      this.tweens.add({ targets: bild, x: bild.x + richtung * MASS.px(30), duration: 120, yoyo: true, ease: "Quad.easeOut" });
      var art = REAKTIONEN[e.reaktion].art;
      if (art === "hitze" || art === "reaktion" || art === "leitung") this.aufblitzen(e.seite === "spieler" ? this.bildGegner : this.bildSpieler, 0xff8a3a);
    }
    if (e.schaden) {
      var ziel = e.seite === "spieler" ? this.bildSpieler : this.bildGegner;
      this.tweens.add({ targets: ziel, x: ziel.x + MASS.px(8), duration: 50, yoyo: true, repeat: 3 });
      this.aktualisieren();
    }
    if (e.volltreffer) this.cameras.main.shake(180, 0.006);
    if (e.erkannt) this.aktualisieren();
    if (e.befund !== undefined) this.aktualisieren();
    return new Promise(function (fertig) {
      szene.weiterWartet = fertig;
      // Wer nicht tippt, liest trotzdem mit: Nach einer Weile geht es von selbst weiter.
      szene.selbstWeiter = szene.time.delayedCall(Math.max(1400, e.text.length * 45), function () { szene.weiter(); });
    });
  }

  weiter() {
    var f = this.weiterWartet;
    if (!f) return;
    this.weiterWartet = null;
    if (this.selbstWeiter) { this.selbstWeiter.remove(); this.selbstWeiter = null; }
    f();
  }

  aufblitzen(bild, farbe) {
    bild.setTintFill(farbe);
    this.time.delayedCall(90, function () { bild.clearTint(); });
  }

  wartenAufTipp(text) {
    var szene = this;
    this.zeigeText(text);
    return new Promise(function (fertig) {
      szene.weiterWartet = fertig;
      szene.selbstWeiter = szene.time.delayedCall(Math.max(2000, text.length * 50), function () { szene.weiter(); });
    });
  }

  async beenden() {
    var k = this.k, stand = this.stand, ende = k.ende;
    if (ende === "gefangen") {
      var wohin = SPIELSTAND.aufnehmen(stand, k.gefangen);
      if (stand.bekannt.indexOf(k.gefangen.art) < 0) stand.bekannt.push(k.gefangen.art);
      this.tweens.add({ targets: this.bildGegner, scale: 0.1, alpha: 0, duration: 600, ease: "Back.easeIn" });
      await this.wartenAufTipp(ARTEN[k.gefangen.art].name + " ist jetzt dein Gefährte" + (wohin === "lager" ? " und wartet im Lager – deine Gruppe ist voll." : " und kommt mit dir."));
    } else if (ende === "sieg" || ende === "entkommen") {
      this.tweens.add({ targets: this.bildGegner, alpha: 0, x: this.bildGegner.x + MASS.px(80), duration: 700 });
    } else if (ende === "niederlage") {
      // Kein „Game Over“: zurück ins Labor, alle erholt.
      stand.gruppe.forEach(function (el) { el.zh = KAMPF.grundwerte(el.art, el.stufe).zhMax; });
      stand.x = null; stand.y = null;
      await this.wartenAufTipp("Mutter nimmt dich in der Werkstatt in Empfang. „Salbe, Ruhe, und morgen versuchst du es klüger.“ Deine Elementals sind wieder bei Kräften.");
    }
    var beiEnde = this.daten.beiEnde;
    this.scene.stop();
    if (beiEnde) beiEnde(ende);
  }

  // ============================================================
  //  Anordnen
  // ============================================================
  anordnen() {
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(10);

    // Hintergrund deckend, wie object-fit: cover
    var hg = this.hintergrund;
    hg.setPosition(b / 2, h / 2).setScale(Math.max(b / hg.width, h / hg.height));
    var leisteH = MASS.px(112);
    var raumH = h - leisteH;
    this.abdunkeln.clear().fillStyle(0x000000, 0.2).fillRect(0, 0, b, raumH);

    // Klassische Aufstellung: Gegner rechts hinten, eigenes Elemental
    // links vorn. Die Werte jeweils auf der anderen Seite, damit kein
    // Kasten ein Wesen verdeckt.
    var groesse = Math.min(raumH * 0.62, b * 0.34);
    this.bildGegner.setDisplaySize(groesse * this.bildGegner.width / this.bildGegner.height, groesse);
    this.bildGegner.setPosition(b * 0.72, raumH * 0.42);
    this.bildGegner.grundSkala = this.bildGegner.scaleY;
    var gs = groesse * 1.1;
    this.bildSpieler.setDisplaySize(gs * this.bildSpieler.width / this.bildSpieler.height, gs);
    this.bildSpieler.setPosition(b * 0.25, raumH - gs * 0.42);
    this.bildSpieler.grundSkala = this.bildSpieler.scaleY;

    this.infoGegner.setPosition(rand, rand);
    this.zeichneInfo(this.infoGegner, "gegner");
    this.zeichneInfo(this.infoSpieler, "spieler");
    this.infoSpieler.setPosition(b - rand - this.infoSpieler.breite, raumH - this.infoSpieler.hoehe - MASS.px(8));
    var feldX = rand + this.infoGegner.breite + MASS.px(10);
    this.feldAnzeige.setPosition(feldX, rand);
    this.feldText.setPosition(feldX + MASS.px(8), rand + MASS.px(6));
    this.zeichneFeld();

    // Untere Leiste: Text links, Knöpfe rechts
    var knopfB = Math.min(MASS.px(420), b * 0.52);
    this.leiste.clear().fillStyle(FARBE.papier, 0.97).fillRect(0, raumH, b, leisteH)
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).lineBetween(0, raumH, b, raumH);
    this.text.setPosition(rand + MASS.px(6), raumH + MASS.px(10)).setWordWrapWidth(b - knopfB - 3 * rand, true);

    // Bis sechs Knöpfe in zwei Reihen; mehr (Bestimmen: sieben) in vier Spalten.
    var spalten = this.knoepfe.length > 6 ? 4 : 3, luecke = MASS.px(6);
    var kh = MASS.px(this.knoepfe.length > 6 ? 30 : 38);
    var kb = (knopfB - (spalten - 1) * luecke) / spalten;
    var x0 = b - rand - knopfB, y0 = raumH + MASS.px(10);
    this.knoepfe.forEach(function (k, i) {
      k.setzeBreite(kb / MASS.dpr);
      var sp = i % spalten, ze = Math.floor(i / spalten);
      k.setPosition(x0 + sp * (kb + luecke) + kb / 2, y0 + ze * (kh + luecke) + kh / 2);
    });
  }}
