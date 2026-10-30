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
      // Ein wildes Elemental oder die Gruppe eines Stoffmeisters (Prüfungskampf)
      gegner: daten.gegner.map(function (g) {
        var el = KAMPF.neuesElemental(g.art, g.stufe);
        // „Gildenmeisterin Ilka“ → „Ilkas Kupfer“ – passt in den Kasten
        if (daten.gegnerName) el.spitzname = daten.gegnerName.split(" ").pop() + "s " + ARTEN[g.art].name;
        return el;
      }),
      feld: daten.feld,
      wild: daten.wild !== false,
      bekannt: this.stand.bekannt,
      vorrat: this.stand.vorrat,
      material: this.stand.material,
      werkzeuge: this.stand.werkzeuge
    });

    this.hintergrund = this.add.image(0, 0, "hg-" + (daten.ort || "dorf")).setOrigin(0.5);
    this.abdunkeln = this.add.graphics();
    this.bildGegner = this.add.image(0, 0, "el-" + daten.gegner[0].art);
    this.bildSpieler = this.add.image(0, 0, "el-" + KAMPF.aktiv(this.k, "spieler").art).setFlipX(true);

    this.infoGegner = this.baueInfo();
    this.infoSpieler = this.baueInfo();
    this.feldAnzeige = this.add.graphics();
    this.feldText = this.add.text(0, 0, "", { fontFamily: SCHRIFT.familie, fontSize: MASS.px(12) + "px", color: "#f4ead5", lineSpacing: MASS.px(4) });
    // Antippen der drei Balken erklärt, was das Feld gerade bewirkt.
    this.feldZone = this.add.zone(0, 0, 10, 10).setOrigin(0, 0).setInteractive();
    this.feldZone.on("pointerdown", function () { szene.feldErklaeren(); });

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
    var erster = !this.k.wild
      ? (daten.gegnerName || "Dein Gegenüber") + " schickt " + ARTEN[daten.gegner[0].art].name + " vor!"
      : this.k.erkannt
        ? "Ein wildes " + ARTEN[daten.gegner[0].art].name + " stellt sich dir in den Weg!"
        : "Ein unbekanntes Elemental stellt sich dir in den Weg! Was mag es sein?";
    this.bereit = this.rundeStarten(erster);

    // Prüfschalter ?zuege=lupe,magnet,bestimmen:schwefel,ki,fangen:spatel
    // spielt eine Zugfolge durch die echte Szene – für kopflose Fotos
    // von Abläufen, die sonst nur ein Finger auslöst.
    var zuege = new URLSearchParams(location.search).get("zuege");
    if (zuege) this.spieleZuege(zuege.split(","));
    // Prüfschalter &lernfenster=1: das Lernfenster sofort zeigen (für Fotos).
    // Das Elemental springt dafür auf die nächste Stufe seines Lernsets.
    if (/[?&]lernfenster=1\b/.test(location.search)) {
      var probeEl = KAMPF.aktiv(this.k, "spieler");
      var naechste = Object.keys(ARTEN[probeEl.art].lernset).map(Number).filter(function (st) { return st > probeEl.stufe; })[0];
      if (naechste) {
        probeEl.stufe = naechste;
        this.bereit.then(function () { szene.lernDialog(probeEl, ARTEN[probeEl.art].lernset[naechste][0]); });
      }
    }
  }

  // Beginn jeder Runde: Ist der Gegner schneller, handelt er zuerst –
  // erst danach erscheint das eigene Menü. Man wählt also immer dann,
  // wenn das eigene Elemental an der Reihe ist.
  async rundeStarten(einleitung) {
    this.beschaeftigt = true;
    var log = KAMPF.rundeBeginnen(this.k);
    if (log.length) {
      if (einleitung) await this.wartenAufTipp(einleitung);
      for (var i = 0; i < log.length; i++) await this.spieleEintrag(log[i]);
      this.markiere(null);
      this.aktualisieren();
      if (this.k.ende) { await this.beenden(); return; }
    }
    this.beschaeftigt = false;
    if (window.PROBE_MELDEN) window.PROBE_MELDEN("Runde " + this.k.runde + " bereit");
    this.zeigeText(einleitung && !log.length ? einleitung : "Was tust du?");
    this.zeigeHauptmenue();
    // Prüfschalter &menue=mehr / feld / bestimmen / fangen: gleich offen (für Fotos)
    if (/[?&]menue=mehr\b/.test(location.search)) this.menueMehr();
    if (/[?&]menue=fangen\b/.test(location.search)) this.menueFangen();
    if (/[?&]menue=feld\b/.test(location.search)) this.feldErklaeren();
    if (/[?&]menue=bestimmen\b/.test(location.search)) this.menueBestimmen();
  }

  async spieleZuege(liste) {
    var vorab = this.time.addEvent({ delay: 60, loop: true, callback: this.weiter, callbackScope: this });
    await this.bereit;
    vorab.remove();
    for (var i = 0; i < liste.length && !this.k.ende; i++) {
      var teil = liste[i].split(":"), a;
      if (teil[0] === "ki") a = KAMPF.kiWahl(this.k, "spieler");
      else if (WERKZEUGE[teil[0]]) a = { typ: "untersuchen", werkzeug: teil[0] };
      else if (teil[0] === "bestimmen") a = { typ: "bestimmen", art: teil[1] };
      else if (teil[0] === "fangen") a = { typ: "fangen", geraet: teil[1] };
      else if (teil[0] === "fliehen") a = { typ: "fliehen" };
      else if (teil[0] === "brenner") a = { typ: "brenner" };
      else if (teil[0] === "kuehlen") a = { typ: "kuehlen" };
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
    c.rahmen = this.add.graphics();
    c.add([c.grund, c.name, c.stufe, c.balken, c.zeile, c.rahmen]);
    c.anteil = 1;
    return c;
  }

  // Wer gerade handelt, bekommt einen farbigen Rahmen: grün die eigene
  // Seite, rot der Gegner. null nimmt beide Rahmen weg.
  markiere(seite) {
    var szene = this;
    [["spieler", this.infoSpieler, 0x3f9a4a], ["gegner", this.infoGegner, 0xc0453a]].forEach(function (p) {
      var c = p[1];
      c.rahmen.clear();
      if (p[0] === seite && c.breite) {
        c.rahmen.lineStyle(MASS.px(4), p[2], 1).strokeRoundedRect(-MASS.px(2), -MASS.px(2), c.breite + MASS.px(4), c.hoehe + MASS.px(4), MASS.px(12));
      }
    });
    this.markiert = seite;
  }

  // Was ein Kasten zeigt: aus der Momentaufnahme einer Meldung (lage,
  // siehe KAMPF.melde) oder, ohne sie, aus dem Stand von jetzt.
  ansicht(seite, lage) {
    var k = this.k;
    if (lage && lage.seiten[seite]) {
      var l = lage.seiten[seite];
      return { name: l.name, art: l.art, stufe: l.stufe, zh: l.zh, zhMax: l.zhMax, ae: l.ae, status: l.status, erkannt: lage.erkannt, befunde: lage.befunde, feld: lage.feld };
    }
    var el = KAMPF.aktiv(k, seite);
    return { name: KAMPF.name(k, seite), art: el.art, stufe: el.stufe, zh: el.zh, zhMax: KAMPF.werte(el).zhMax, ae: k.seiten[seite].ae, status: k.seiten[seite].status, erkannt: k.erkannt, befunde: k.befunde, feld: k.feld };
  }

  zeichneInfo(c, seite, lage) {
    var k = this.k, a = this.ansicht(seite, lage);
    // Der Gegnerkasten hat eine Zeile mehr: LP und darunter die Befunde.
    var b = MASS.px(220), h = MASS.px(seite === "gegner" ? 76 : 62);
    c.breite = b; c.hoehe = h;
    c.grund.clear().fillStyle(FARBE.papier, 0.93).fillRoundedRect(0, 0, b, h, MASS.px(10))
      .lineStyle(MASS.px(2), FARBE.papierRand, 1).strokeRoundedRect(0, 0, b, h, MASS.px(10));
    c.name.setText(seite === "gegner" && k.wild && !a.erkannt ? "???" : a.name).setPosition(MASS.px(10), MASS.px(6));
    // Status neben der Stufe, damit man sieht, warum etwas schiefgeht.
    var st = a.status, zeichen = [];
    if (st.vergiftet) zeichen.push("GIFT");
    if (st.brennt) zeichen.push("BRAND");
    if (st.geblendet) zeichen.push("GEBLENDET");
    if (st.abgekuehlt) zeichen.push("ABGEKÜHLT");
    if (st.inert) zeichen.push("INERT");
    if (st.geloest) zeichen.push("GELÖST");
    c.stufe.setText((zeichen.length ? zeichen.join(" ") + " · " : "") + "Stufe " + a.stufe).setPosition(b - MASS.px(10), MASS.px(8));
    var ziel = a.zh / a.zhMax;
    // Der Balken läuft dem Wert nach – so sieht man, wie viel ein Treffer kostete.
    // Seit Fassung 15 wird bei jeder Meldung neu gezeichnet: der alte Lauf muss weichen.
    if (c.lauf) c.lauf.stop();
    c.lauf = this.tweens.addCounter({
      from: c.anteil, to: ziel, duration: 450, onUpdate: function (t) {
        c.anteil = t.getValue();
        var bb = b - MASS.px(20), y = MASS.px(27);
        var farbe = c.anteil > 0.5 ? 0x4f9a5a : c.anteil > 0.2 ? 0xd9a63a : 0xc0453a;
        c.balken.clear().fillStyle(0x3a2a1c, 0.25).fillRoundedRect(MASS.px(10), y, bb, MASS.px(9), MASS.px(4))
          .fillStyle(farbe, 1).fillRoundedRect(MASS.px(10), y, Math.max(0, bb * c.anteil), MASS.px(9), MASS.px(4));
      }
    });
    if (seite === "spieler") {
      c.zeile.setText("LP " + a.zh + "/" + a.zhMax + "  ·  Energie " + a.ae + "/" + KAMPF.AE_MAX);
    } else {
      c.zeile.setText("LP " + a.zh + "/" + a.zhMax + "\n" + this.befundZeile(a.befunde));
    }
    c.zeile.setPosition(MASS.px(10), MASS.px(40));
  }

  befundZeile(befunde) {
    var b = befunde || this.k.befunde, t = [];
    if (b.farbe !== undefined) t.push(b.farbe);
    if (b.glanz !== undefined) t.push(b.glanz ? "glänzt" : "matt");
    if (b.magnetisch !== undefined) t.push(b.magnetisch ? "magnetisch" : "nicht magnetisch");
    if (b.leitfaehig !== undefined) t.push(b.leitfaehig ? "leitet" : "leitet nicht");
    if (b.verformbar !== undefined) t.push(b.verformbar ? "verformbar" : "spröde");
    if (b.brennt !== undefined) t.push(b.brennt ? "brennt" : "brennt nicht");
    return t.length ? t.join(" · ") : "noch nicht untersucht";
  }

  zeichneFeld(feld) {
    var f = feld || this.k.feld, g = this.feldAnzeige;
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

  // Kurzfassung des Blatts „Energie und Kampffeld“ mit den Werten von jetzt
  feldErklaeren() {
    if (this.beschaeftigt) return;
    var f = this.k.feld, plus = Math.floor(f.waerme / 30);
    this.zeigeText(
      "Sauerstoff " + Math.round(f.sauerstoff) + ": Feuer braucht und verbraucht ihn." +
      " Wärme " + Math.round(f.waerme) + ": " + (plus ? "+" + plus + " E je Runde für beide" : "noch kein Energie-Bonus (ab 30)") +
      (f.waerme >= 50 ? ", Zink ist formbar" : "") + "." +
      " Feuchte " + Math.round(f.feuchte) + ": " + (f.feuchte > 70 ? "Feuer wirkt nur halb." : "Feuer brennt normal (halb erst über 70).") +
      (f.waerme >= KAMPF.REGEL.hitzeFeuer && f.feuchte <= 70 ? " Große Hitze: Feuer wirkt ×1,5." : ""));
  }

  // lage: Momentaufnahme einer Meldung; ohne sie der Stand von jetzt.
  aktualisieren(lage) {
    this.letzteLage = lage || null;     // für anordnen() beim Drehen mitten in der Runde
    this.zeichneInfo(this.infoGegner, "gegner", lage);
    this.zeichneInfo(this.infoSpieler, "spieler", lage);
    this.zeichneFeld(lage && lage.feld);
    this.bildSpieler.setTexture("el-" + this.ansicht("spieler", lage).art);
    this.bildGegner.setTexture("el-" + this.ansicht("gegner", lage).art);
  }

  zeigeText(t) { this.text.setText(t); }

  // ============================================================
  //  Menüs
  // ============================================================
  leereKnoepfe() {
    this.knoepfe.forEach(function (k) { k.destroy(); });
    this.knoepfe = [];
  }

  // eintraege: [{ text, aktiv, beiKlick, unten, symbol, platz }]
  // platz: [spalte, zeile] im Hauptmenü, "mehr" für den schmalen Knopf
  // rechts. Ohne platz ordnet anordnen() die Knöpfe als Raster.
  zeigeKnoepfe(eintraege) {
    var szene = this, haupt = eintraege.some(function (e) { return e.platz; });
    this.leereKnoepfe();
    this.knoepfe = eintraege.map(function (e) {
      var k = baueKnopf(szene, e.text, function () {
        if (szene.beschaeftigt) return;
        if (e.aktiv === false) { if (e.grund) szene.zeigeText(e.grund); return; }
        e.beiKlick();
      }, { hoehe: haupt ? (e.platz === "mehr" ? 90 : 42) : eintraege.length > 6 ? 30 : 38,
           schrift: haupt ? 13 : eintraege.length > 6 ? 12 : 13, mindestbreite: haupt ? 20 : 60,
           unten: e.unten, symbol: e.symbol });
      if (e.aktiv === false) k.setAlpha(0.45);
      k.platz = e.platz;
      return k;
    });
    this.anordnen();
  }

  zurueck() { return { text: "‹ Zurück", beiKlick: this.zeigeHauptmenue.bind(this) }; }

  // Seit Fassung 19 nach der Skizze drehbuch\Menüband im Kampf.png: Die
  // Angriffe liegen direkt auf Knöpfen – Name, darunter die Stärke und ein
  // Symbol (Schwert Schaden, Schild Schutz, Blitz Störung). Daneben Flucht
  // (Flagge) und Fangen (Reagenzglas), rechts „⋯“ für alles Weitere.
  // Treffer-% und Nebenwirkungen stehen nur noch im Menü (Gruppe → Elemental).
  zeigeHauptmenue() {
    var szene = this, k = this.k, el = KAMPF.aktiv(k, "spieler");
    var eintraege = KAMPF.angriffe(el).slice(0, 4).map(function (id, i) {
      var r = REAKTIONEN[id], grund = KAMPF.hindernis(k, "spieler", id);
      var schutz = r.typ === "schutz", stoer = r.typ === "stoer";
      var st = schutz || stoer ? "" : r.typ === "waerme" ? KAMPF.waermeStaerke(k, r) : KAMPF.staerke(el, id);
      return { text: r.name, unten: String(st), symbol: schutz ? "schild" : stoer ? "blitz" : "schwert",
        aktiv: !grund, grund: grund, platz: [i % 2, Math.floor(i / 2)],
        beiKlick: function () { szene.ausfuehren({ typ: "reaktion", id: id }); } };
    });
    eintraege.push(
      { text: "Flucht", symbol: "flagge", platz: [2, 0], aktiv: k.wild, grund: "Vor einem Stoffmeister läuft man nicht weg.",
        beiKlick: function () { szene.ausfuehren({ typ: "fliehen" }); } },
      { text: "Fangen", symbol: "glas", platz: [2, 1], aktiv: k.wild, grund: "Das Elemental eines Stoffmeisters fängt man nicht.",
        beiKlick: function () { szene.menueFangen(); } },
      { text: "⋯", platz: "mehr", beiKlick: function () { szene.menueMehr(); } }
    );
    this.zeigeKnoepfe(eintraege);
  }

  // Alles, was nicht auf das Menüband passt
  menueMehr() {
    var szene = this, k = this.k;
    var eintraege = [
      { text: "Untersuchen", beiKlick: function () { szene.menueUntersuchen(); } },
      { text: "Bestimmen", aktiv: k.wild && !k.erkannt, grund: k.wild ? "Du weißt schon, was es ist." : "Den Stoff eines Stoffmeisters kennst du – er hat ihn dir genannt.", beiKlick: function () { szene.menueBestimmen(); } },
      { text: "Wechseln", aktiv: this.stand.gruppe.filter(function (el) { return el.zh > 0; }).length > 1, grund: "Niemand sonst ist bereit.", beiKlick: function () { szene.menueWechseln(); } },
      { text: "Kraft sammeln\n+2 E", beiKlick: function () { szene.ausfuehren({ typ: "sammeln" }); } }
    ];
    if (this.stand.werkzeuge.indexOf("gasbrenner") >= 0) {
      eintraege.push({ text: "Gasbrenner\n+4 E", aktiv: !k.brennerBenutzt, grund: "Das Gas ist für diesen Kampf verbraucht.", beiKlick: function () { szene.ausfuehren({ typ: "brenner" }); } });
    }
    eintraege.push(this.zurueck());
    this.zeigeKnoepfe(eintraege);
  }

  menueUntersuchen() {
    var szene = this;
    var eintraege = this.stand.werkzeuge.filter(function (w) { return WERKZEUGE[w].prueft.length; }).map(function (w) {
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
    var szene = this, v = this.stand.vorrat, k = this.k;
    var eintraege = Object.keys(GEFAESSE).filter(function (g) { return v[g] > 0; }).map(function (g) {
      return { text: GEFAESSE[g].kurz + " ×" + v[g] + "\nFangrate " + GEFAESSE[g].rate, beiKlick: function () { szene.ausfuehren({ typ: "fangen", geraet: g }); } };
    });
    var gefaesse = eintraege.length;
    if (v.kaeltemischung > 0) {
      eintraege.push({ text: "Kältemischung ×" + v.kaeltemischung + "\nabkühlen: ×2", aktiv: !k.seiten.gegner.status.abgekuehlt, grund: "Es ist schon abgekühlt.",
        beiKlick: function () { szene.ausfuehren({ typ: "kuehlen" }); } });
    }
    if (!gefaesse) this.zeigeText("Du hast kein Gefäß mehr dabei. Reagenzgläser gibt es auf dem Markt.");
    else this.zeigeText("Welches Gefäß? Es wird nur verbraucht, wenn der Bund gelingt.");
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
    // Was du gewählt hast (Untersuchen, Fangen …), geschieht zuerst.
    this.markiere("spieler");
    for (var i = 0; i < log.length; i++) {
      await this.spieleEintrag(log[i]);
    }
    this.markiere(null);
    this.aktualisieren();
    var gegnerArt = KAMPF.aktiv(this.k, "gegner").art;
    if (this.k.erkannt && this.k.wild && this.stand.bekannt.indexOf(gegnerArt) < 0) this.stand.bekannt.push(gegnerArt);
    if (this.k.ende) { await this.beenden(); return; }
    await this.rundeStarten();
  }

  spieleEintrag(e) {
    var szene = this;
    this.zeigeText(e.text);
    // Die Anzeige zeigt den Augenblick dieser Meldung, nicht das Ende der Runde.
    if (e.lage) this.aktualisieren(e.lage);
    // Im Protokoll steht mit, was die Kästen gerade zeigen (kopflose Prüfung).
    if (window.PROBE_MELDEN) window.PROBE_MELDEN("› " + e.text + "   [du: " + this.infoSpieler.name.text + " " + this.infoSpieler.zeile.text.split("  ·")[0] +
      " · Gegner: " + this.infoGegner.name.text + " " + this.infoGegner.zeile.text.split("\n")[0] + "]");
    if (e.erschoepft || e.ruft) {
      var wesen = e.seite === "spieler" ? this.bildSpieler : this.bildGegner;
      if (e.erschoepft) this.tweens.add({ targets: wesen, alpha: 0.15, duration: 450 });
      else { wesen.alpha = 0; this.tweens.add({ targets: wesen, alpha: 1, duration: 350 }); }
    }
    if (e.reaktion || e.handelt) this.markiere(e.seite);
    if (e.reaktion) {
      var bild = e.seite === "spieler" ? this.bildSpieler : this.bildGegner;
      var richtung = e.seite === "spieler" ? 1 : -1;
      this.tweens.add({ targets: bild, x: bild.x + richtung * MASS.px(36), duration: 160, yoyo: true, ease: "Quad.easeOut" });
      var typ = REAKTIONEN[e.reaktion].typ;
      if (typ === "feuer" || typ === "reaktion" || typ === "waerme") this.aufblitzen(e.seite === "spieler" ? this.bildGegner : this.bildSpieler, 0xff8a3a);
    }
    if (e.schaden) {
      var ziel = e.seite === "spieler" ? this.bildSpieler : this.bildGegner;
      this.tweens.add({ targets: ziel, x: ziel.x + MASS.px(8), duration: 70, yoyo: true, repeat: 3 });
    }
    if (e.volltreffer) this.cameras.main.shake(180, 0.006);
    return new Promise(function (fertig) {
      szene.weiterWartet = fertig;
      // Jede Meldung steht mindestens 0,3 s – sonst blättert ein schneller
      // Finger durch die Runde, ohne dass man sieht, wer was getan hat.
      // (Fassung 6 hatte 0,7 s und 2,2 s – beim Spielen zu langsam.)
      szene.sperreBis = szene.time.now + 300;
      // Wer nicht tippt, liest trotzdem mit: Nach einer Weile geht es von selbst weiter.
      szene.selbstWeiter = szene.time.delayedCall(Math.max(1300, e.text.length * 35), function () { szene.sperreBis = 0; szene.weiter(); });
    });
  }

  weiter() {
    var f = this.weiterWartet;
    if (!f) return;
    if (this.sperreBis && this.time.now < this.sperreBis) return;
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
      szene.selbstWeiter = szene.time.delayedCall(Math.max(1300, text.length * 35), function () { szene.weiter(); });
    });
  }

  // Eine Auswahl mit Knöpfen; liefert die Nummer der gewählten Option.
  waehle(text, optionen) {
    var szene = this;
    this.beschaeftigt = false;
    this.zeigeText(text);
    return new Promise(function (fertig) {
      szene.zeigeKnoepfe(optionen.map(function (t, i) {
        return { text: t, beiKlick: function () { szene.leereKnoepfe(); szene.beschaeftigt = true; fertig(i); } };
      }));
    });
  }

  angriffKurz(id, el) {
    var r = REAKTIONEN[id], typ = r.typ === "schutz" ? "Schutz" : r.typ === "stoer" ? "Störung" : TYPEN[r.typ].name;
    var st = KAMPF.staerke(el, id);
    return r.name + "\n" + typ + (st ? " " + st : "") + " · " + r.ae + " E";
  }

  // Seit Fassung 18 nach dem Lernset: Ist ein Platz frei, lernt das
  // Elemental den Angriff sofort. Bei vier Angriffen wählt man, welcher
  // ersetzt wird – oder lernt ihn nicht. Dazu der Satz Chemie.
  async lernDialog(el, neu) {
    var name = el.spitzname || ARTEN[el.art].name;
    if (!neu) neu = KAMPF.lernsetBis(el.art, el.stufe).filter(function (id) { return KAMPF.angriffe(el).indexOf(id) < 0; }).pop();
    if (!neu || KAMPF.angriffe(el).indexOf(neu) >= 0) return;
    var szene = this, r = REAKTIONEN[neu], liste = KAMPF.angriffe(el);
    var info = [r.text].concat(angriffZusatz(neu).length ? [angriffZusatz(neu).join(", ") + "."] : []).join(" ") + (r.chemie ? "\n" + r.chemie : "");
    if (liste.length < KAMPF.ANGRIFFE_MAX) {
      KAMPF.lernen(el, neu);
      await this.wartenAufTipp(name + " lernt " + r.name + "!\n" + info);
      return;
    }
    var w2 = await this.waehle(name + " kann " + r.name + " lernen. " + info + "\nEs kann höchstens " + KAMPF.ANGRIFFE_MAX + " Angriffe. Welchen soll " + r.name + " ersetzen?",
      liste.map(function (id) { return szene.angriffKurz(id, el); }).concat(["nicht lernen"]));
    if (w2 >= liste.length) return;
    var alt = liste[w2];
    KAMPF.lernen(el, neu, alt);
    await this.wartenAufTipp(name + " vergisst " + REAKTIONEN[alt].name + " und kann jetzt " + REAKTIONEN[neu].name + ".");
  }

  async beenden() {
    var k = this.k, stand = this.stand, ende = k.ende;
    // Seit Fassung 17: Die Elementals der Stoffmeister gelten als gesehen –
    // das Stoffbuch zeigt sie mit „fangbar später“.
    if (!k.wild) k.seiten.gegner.gruppe.forEach(function (el) {
      if (stand.gesehen.indexOf(el.art) < 0) stand.gesehen.push(el.art);
    });
    if (ende === "gefangen") {
      var wohin = SPIELSTAND.aufnehmen(stand, k.gefangen);
      if (stand.bekannt.indexOf(k.gefangen.art) < 0) stand.bekannt.push(k.gefangen.art);
      this.tweens.add({ targets: this.bildGegner, scale: 0.1, alpha: 0, duration: 600, ease: "Back.easeIn" });
      await this.wartenAufTipp(ARTEN[k.gefangen.art].name + " ist jetzt dein Gefährte" + (wohin === "lager" ? " und wartet im Lager – deine Gruppe ist voll." : " und kommt mit dir."));
    } else if (ende === "sieg" || ende === "entkommen") {
      this.tweens.add({ targets: this.bildGegner, alpha: 0, x: this.bildGegner.x + MASS.px(80), duration: 700 });
    } else if (ende === "niederlage") {
      // Kein „Game Over“: zurück ins Labor, alle erholt.
      stand.gruppe.forEach(function (el) { el.zh = KAMPF.werte(el).zhMax; });
      var imDorf = !stand.labor || /stoffingen/.test(stand.labor.karte);
      await this.wartenAufTipp(imDorf
        ? "Du wachst in Mutters Werkstatt auf. Es riecht nach Salbe. Deine Elementals haben sich erholt – und du bist klüger als vorhin."
        : "Du wachst im Labor der Gilde auf. Jemand hat deine Elementals versorgt. „Beim nächsten Mal erst denken, dann zünden“, brummt eine Stimme.");
    }
    // Angriffe lernen: die fälligen Angriffe aus dem Lernset (el.lernen).
    for (var n = 0; n < stand.gruppe.length; n++) {
      var el = stand.gruppe[n];
      while (Array.isArray(el.lernen) && el.lernen.length) await this.lernDialog(el, el.lernen.shift());
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
    this.zeichneInfo(this.infoGegner, "gegner", this.letzteLage);
    this.zeichneInfo(this.infoSpieler, "spieler", this.letzteLage);
    this.infoSpieler.setPosition(b - rand - this.infoSpieler.breite, raumH - this.infoSpieler.hoehe - MASS.px(8));
    var feldX = rand + this.infoGegner.breite + MASS.px(10);
    this.feldAnzeige.setPosition(feldX, rand);
    this.feldText.setPosition(feldX + MASS.px(8), rand + MASS.px(6));
    this.feldZone.setPosition(feldX, rand).setSize(MASS.px(186), MASS.px(62));
    if (this.feldZone.input) this.feldZone.input.hitArea.setSize(MASS.px(186), MASS.px(62));
    this.zeichneFeld(this.letzteLage && this.letzteLage.feld);

    // Untere Leiste (seit Fassung 19): links der Kampftext auf einer
    // Schriftrolle, rechts das Menüband in einem Rahmen.
    var knopfB = Math.min(MASS.px(440), b * 0.54), innen = MASS.px(8);
    var rahmenX = b - rand - knopfB - innen, rahmenB = knopfB + 2 * innen;
    var rolleB = rahmenX - 2 * rand, rolleY = raumH + MASS.px(10), rolleH = leisteH - MASS.px(24);
    var g = this.leiste.clear();
    g.fillStyle(0x101418, 0.55).fillRect(0, raumH, b, leisteH);
    this.zeichneRolle(g, rand, rolleY, rolleB, rolleH);
    g.fillStyle(FARBE.papier, 0.96).fillRoundedRect(rahmenX, raumH + MASS.px(4), rahmenB, leisteH - MASS.px(8), MASS.px(18))
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).strokeRoundedRect(rahmenX, raumH + MASS.px(4), rahmenB, leisteH - MASS.px(8), MASS.px(18));
    var rolleRand = MASS.px(22);
    this.text.setPosition(rand + rolleRand, rolleY + MASS.px(8)).setWordWrapWidth(rolleB - 2 * rolleRand, true);

    var luecke = MASS.px(6), x0 = rahmenX + innen, y0 = raumH + MASS.px(10);
    if (this.knoepfe.some(function (k) { return k.platz; })) {
      // Hauptmenü: 2 × 3 Knöpfe, rechts der schmale „⋯“ über beide Reihen
      var mehrB = MASS.px(30), kh2 = MASS.px(42);
      var kb2 = (knopfB - mehrB - 3 * luecke) / 3;
      this.knoepfe.forEach(function (k) {
        if (k.platz === "mehr") {
          k.setzeBreite(mehrB / MASS.dpr);
          k.setPosition(x0 + knopfB - mehrB / 2, y0 + kh2 + luecke / 2);
          return;
        }
        k.setzeBreite(kb2 / MASS.dpr);
        k.setPosition(x0 + k.platz[0] * (kb2 + luecke) + kb2 / 2, y0 + k.platz[1] * (kh2 + luecke) + kh2 / 2);
      });
      return;
    }
    // Untermenüs: bis sechs Knöpfe in zwei Reihen; mehr (Bestimmen: neun) in vier Spalten.
    var spalten = this.knoepfe.length > 6 ? 4 : 3;
    var kh = MASS.px(this.knoepfe.length > 6 ? 30 : 38);
    var kb = (knopfB - (spalten - 1) * luecke) / spalten;
    this.knoepfe.forEach(function (k, i) {
      k.setzeBreite(kb / MASS.dpr);
      var sp = i % spalten, ze = Math.floor(i / spalten);
      k.setPosition(x0 + sp * (kb + luecke) + kb / 2, y0 + ze * (kh + luecke) + kh / 2);
    });
  }

  // Eine Schriftrolle: Papierbahn zwischen zwei gerollten Enden, unten
  // links ein Zipfel wie bei einer Sprechblase.
  zeichneRolle(g, x, y, b, h) {
    var r = MASS.px(9), dunkel = 0xb89a66, rand = FARBE.papierRand, linie = MASS.px(2);
    var zx = x + b * 0.22, zh = MASS.px(8);
    g.fillStyle(FARBE.papier, 0.97).fillRect(x + r, y + MASS.px(4), b - 2 * r, h - MASS.px(8));
    g.fillTriangle(zx - MASS.px(10), y + h - MASS.px(5), zx + MASS.px(10), y + h - MASS.px(5), zx - MASS.px(2), y + h + zh);
    g.lineStyle(linie, rand, 1)
      .lineBetween(x + r, y + MASS.px(4), x + b - r, y + MASS.px(4))
      .lineBetween(x + r, y + h - MASS.px(4), zx - MASS.px(10), y + h - MASS.px(4))
      .lineBetween(zx + MASS.px(10), y + h - MASS.px(4), x + b - r, y + h - MASS.px(4))
      .lineBetween(zx - MASS.px(10), y + h - MASS.px(4), zx - MASS.px(2), y + h + zh)
      .lineBetween(zx + MASS.px(10), y + h - MASS.px(4), zx - MASS.px(2), y + h + zh);
    [x, x + b - 2 * r].forEach(function (rx) {
      g.fillStyle(0xe6d3ab, 1).fillRoundedRect(rx, y, 2 * r, h, r);
      g.fillStyle(dunkel, 1).fillRect(rx + r * 0.9, y + r * 0.6, r * 0.5, h - r * 1.2);
      g.lineStyle(linie, rand, 1).strokeRoundedRect(rx, y, 2 * r, h, r);
    });
  }}
