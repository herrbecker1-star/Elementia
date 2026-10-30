// ============================================================
//  BUCH – Gruppe, Stoffbuch, Gepäck
//
//  Das Stoffbuch ist Großmutters Buch. Was man noch nicht kennt,
//  steht als dunkle Silhouette darin, mit einem vagen Satz in ihrer
//  Sprache. Wer ein Elemental erkannt oder gefangen hat, bekommt
//  Bild, Namen, Formel und den genauen Fundort.
//  Das Sichtbarmachen des Fehlenden ist der halbe Sammelreiz.
// ============================================================

class BuchSzene extends Phaser.Scene {
  constructor() { super("buch"); }

  create(daten) {
    var szene = this;
    this.stand = daten.stand;
    this.beiEnde = daten.beiEnde;
    this.reiter = "gruppe";
    this.inhalt = [];

    this.grund = this.add.graphics();
    this.reiterKnoepfe = [
      baueKnopf(this, "Gruppe", function () { szene.zeige("gruppe"); }, { hoehe: 36, schrift: 14, mindestbreite: 110 }),
      baueKnopf(this, "Stoffbuch", function () { szene.zeige("stoffbuch"); }, { hoehe: 36, schrift: 14, mindestbreite: 110 }),
      baueKnopf(this, "Gepäck", function () { szene.zeige("gepaeck"); }, { hoehe: 36, schrift: 14, mindestbreite: 110 }),
      baueKnopf(this, "Lager", function () { szene.zeige("lager"); }, { hoehe: 36, schrift: 14, mindestbreite: 90 })
    ];
    this.schliessen = baueKnopf(this, "Schließen", function () {
      szene.scene.stop();
      if (szene.beiEnde) szene.beiEnde();
    }, { hoehe: 36, schrift: 14, mindestbreite: 110 });
    this.zurueckKnopf = baueKnopf(this, "‹ Zurück", function () { szene.zeige(szene.vorDetail || "gruppe"); }, { hoehe: 36, schrift: 14, mindestbreite: 110 });

    this.scale.on("resize", this.neuZeichnen, this);
    this.events.once("shutdown", function () { szene.scale.off("resize", szene.neuZeichnen, szene); });
    // Prüfschalter ?detail=<art>: sofort die Detailansicht dieser Art
    if (daten.detail && ARTEN[daten.detail]) {
      var eigenes = this.stand.gruppe.filter(function (el) { return el.art === daten.detail; })[0];
      this.zeigeDetailVon(eigenes || null, daten.detail, eigenes ? "gruppe" : "stoffbuch");
    } else if (daten.reiter === "stoffkunde") {
      // Prüfschalter ?buch=stoffkunde&seite=1..4
      this.stoffTeil = "kunde";
      this.kundeSeite = Math.max(0, (Number(new URLSearchParams(location.search).get("seite")) || 1) - 1);
      this.zeige("stoffbuch");
    } else this.zeige(daten.reiter || "gruppe");
  }

  zeige(reiter) {
    this.reiter = reiter;
    this.neuZeichnen();
  }

  // Detailansicht: ein eigenes Elemental (el) oder eine bekannte Art (el = null, Stufe 5)
  zeigeDetailVon(el, art, vorher) {
    this.detail = { el: el, art: art };
    this.vorDetail = vorher;
    this.zeige("detail");
  }

  // Eine unsichtbare Fläche, die antippbar macht, was darunter gezeichnet ist.
  antippbar(x, y, b, h, beiKlick) {
    var z = this.add.zone(x, y, b, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    z.on("pointerdown", beiKlick);
    this.inhalt.push(z);
  }

  neuZeichnen() {
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(12);
    this.inhalt.forEach(function (o) { o.destroy(); });
    this.inhalt = [];

    this.grund.clear().fillStyle(0x000000, 0.55).fillRect(0, 0, b, h)
      .fillStyle(FARBE.papier, 0.98).fillRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14))
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).strokeRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14));

    var szene = this, x = rand * 2, imDetail = this.reiter === "detail";
    this.reiterKnoepfe.forEach(function (k, i) {
      k.setVisible(!imDetail);
      k.setPosition(x + k.width / 2, rand * 2 + k.height / 2);
      k.setAlpha(["gruppe", "stoffbuch", "gepaeck", "lager"][i] === szene.reiter ? 1 : 0.6);
      x += k.width + MASS.px(8);
    });
    this.zurueckKnopf.setVisible(imDetail).setPosition(rand * 2 + this.zurueckKnopf.width / 2, rand * 2 + this.zurueckKnopf.height / 2);
    this.schliessen.setPosition(b - rand * 2 - this.schliessen.width / 2, rand * 2 + this.schliessen.height / 2);

    var oben = rand * 2 + MASS.px(48);
    var flaeche = { x: rand * 2, y: oben, b: b - rand * 4, h: h - oben - rand * 2 };
    if (imDetail) this.zeigeDetail(flaeche);
    else if (this.reiter === "gruppe") this.zeigeGruppe(flaeche);
    else if (this.reiter === "lager") this.zeigeLager(flaeche);
    else if (this.reiter === "stoffbuch") this.zeigeStoffbuch(flaeche);
    else this.zeigeGepaeck(flaeche);
  }

  text(x, y, t, groesse, farbe, stil) {
    var o = this.add.text(x, y, t, {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(groesse) + "px", color: farbe || FARBE.tinte, fontStyle: stil || "",
      lineSpacing: MASS.px(2)
    });
    this.inhalt.push(o);
    return o;
  }

  bild(x, y, art, groesse, silhouette) {
    var o = this.add.image(x, y, (silhouette ? "sil-" : "el-") + art).setOrigin(0, 0);
    o.setDisplaySize(groesse * o.width / o.height, groesse);
    if (silhouette) o.setAlpha(0.8);
    this.inhalt.push(o);
    return o;
  }

  // Die Gruppe als Liste: Wer oben steht, beginnt den Kampf. Mit ▲ ▼
  // ändert man die Reihenfolge; Antippen der Zeile zeigt die Details.
  zeigeGruppe(f) {
    var szene = this, stand = this.stand;
    if (!stand.gruppe.length) { this.text(f.x, f.y, "Noch begleitet dich kein Elemental.", 16); return; }
    var luecke = MASS.px(5), fussH = MASS.px(18);
    var zeileH = Math.min(MASS.px(64), (f.h - fussH - luecke * (SPIELSTAND.GRUPPE_MAX - 1)) / SPIELSTAND.GRUPPE_MAX);
    var knopfB = MASS.px(44), rechts = f.x + f.b;
    var ersterFit = stand.gruppe.findIndex(function (el) { return el.zh > 0; });
    stand.gruppe.forEach(function (el, i) {
      var y = f.y + i * (zeileH + luecke), w = KAMPF.werte(el);
      var grund = szene.add.graphics();
      grund.fillStyle(i === ersterFit ? 0xe3eeee : 0xffffff, i === ersterFit ? 0.9 : 0.35).fillRoundedRect(f.x, y, f.b, zeileH, MASS.px(6))
        .lineStyle(MASS.px(1.5), i === ersterFit ? 0x2f5d62 : 0xc9a66b, 1).strokeRoundedRect(f.x, y, f.b, zeileH, MASS.px(6));
      szene.inhalt.push(grund);
      var bild = szene.bild(f.x + MASS.px(4), y + MASS.px(3), el.art, zeileH - MASS.px(6), false);
      var tx = f.x + MASS.px(10) + bild.displayWidth;
      szene.text(tx, y + MASS.px(3), (el.spitzname || ARTEN[el.art].name) + "  ·  Stufe " + el.stufe +
        (i === ersterFit ? "   – kämpft zuerst" : ""), 14, null, "bold");
      var bb = Math.min(MASS.px(220), rechts - tx - 2 * knopfB - MASS.px(24)), anteil = el.zh / w.zhMax;
      var balken = szene.add.graphics();
      balken.fillStyle(0x3a2a1c, 0.25).fillRoundedRect(tx, y + zeileH * 0.48, bb, MASS.px(7), MASS.px(3))
        .fillStyle(anteil > 0.5 ? 0x4f9a5a : anteil > 0.2 ? 0xd9a63a : 0xc0453a, 1)
        .fillRoundedRect(tx, y + zeileH * 0.48, Math.max(0, bb * anteil), MASS.px(7), MASS.px(3));
      szene.inhalt.push(balken);
      szene.text(tx + bb + MASS.px(8), y + zeileH * 0.48 - MASS.px(4),
        (el.zh > 0 ? "LP " + el.zh + "/" + w.zhMax : "erschöpft") + "  ·  Erfahrung " + el.ep + "/" + KAMPF.epBisNaechste(el.stufe), 12, "#5a4632");
      szene.antippbar(f.x, y, f.b - 2 * knopfB - MASS.px(16), zeileH, function () { szene.zeigeDetailVon(el, el.art, "gruppe"); });
      // ▲ ▼ – tauschen mit dem Nachbarn und speichern
      [["▲", -1], ["▼", 1]].forEach(function (p, n) {
        var ziel = i + p[1], geht = ziel >= 0 && ziel < stand.gruppe.length;
        var k = baueKnopf(szene, p[0], function () {
          if (!geht) return;
          var t = stand.gruppe[i]; stand.gruppe[i] = stand.gruppe[ziel]; stand.gruppe[ziel] = t;
          SPIELSTAND.speichern(stand);
          szene.neuZeichnen();
        }, { hoehe: Math.min(36, zeileH / MASS.dpr - 10), schrift: 15, mindestbreite: 40 });
        k.setPosition(rechts - MASS.px(6) - knopfB / 2 - (1 - n) * (knopfB + MASS.px(6)), y + zeileH / 2).setAlpha(geht ? 1 : 0.3);
        szene.inhalt.push(k);
      });
    });
    this.text(f.x, f.y + f.h - fussH + MASS.px(2), (stand.lager.length ? "Im Lager warten " + stand.lager.length + " weitere Elementals. " : "") +
      "Wer oben steht, beginnt den Kampf. Antippen zeigt Werte und Angriffe.", 12, "#5a4632");
  }

  // Das Lager: wer nicht in die Gruppe passt (höchstens vier). „In die
  // Gruppe“ holt ein Elemental nach vorn; ist die Gruppe voll, tauscht es
  // mit dem untersten der Gruppe (SPIELSTAND.ausLager).
  zeigeLager(f) {
    var szene = this, stand = this.stand;
    if (!stand.lager.length) {
      this.text(f.x, f.y, "Das Lager ist leer.", 16);
      this.text(f.x, f.y + MASS.px(26), "Fängst du mehr Elementals, als in deine Gruppe passen (" + SPIELSTAND.GRUPPE_MAX + "), warten sie hier.", 13, "#5a4632")
        .setWordWrapWidth(f.b, true);
      return;
    }
    var spalten = 2, luecke = MASS.px(6), zeileH = MASS.px(56);
    var spB = (f.b - luecke) / spalten, knopfB = MASS.px(120);
    stand.lager.forEach(function (el, i) {
      var x = f.x + (i % spalten) * (spB + luecke), y = f.y + Math.floor(i / spalten) * (zeileH + luecke);
      if (y + zeileH > f.y + f.h - MASS.px(20)) return;
      var w = KAMPF.werte(el);
      var grund = szene.add.graphics();
      grund.fillStyle(0xffffff, 0.35).fillRoundedRect(x, y, spB, zeileH, MASS.px(6)).lineStyle(MASS.px(1.5), 0xc9a66b, 1).strokeRoundedRect(x, y, spB, zeileH, MASS.px(6));
      szene.inhalt.push(grund);
      var bild = szene.bild(x + MASS.px(4), y + MASS.px(3), el.art, zeileH - MASS.px(6), false);
      var tx = x + MASS.px(10) + bild.displayWidth;
      szene.text(tx, y + MASS.px(4), (el.spitzname || ARTEN[el.art].name) + " · Stufe " + el.stufe, 14, null, "bold");
      szene.text(tx, y + MASS.px(24), "LP " + el.zh + "/" + w.zhMax, 12, "#5a4632");
      szene.antippbar(x, y, spB - knopfB - MASS.px(10), zeileH, function () { szene.zeigeDetailVon(el, el.art, "lager"); });
      var k = baueKnopf(szene, "in die Gruppe", function () {
        SPIELSTAND.ausLager(stand, i);
        SPIELSTAND.speichern(stand);
        szene.neuZeichnen();
      }, { hoehe: 32, schrift: 13, mindestbreite: 110 });
      k.setPosition(x + spB - MASS.px(6) - k.width / 2, y + zeileH / 2);
      szene.inhalt.push(k);
    });
    this.text(f.x, f.y + f.h - MASS.px(16), "Ist die Gruppe voll, tauscht das Elemental mit dem untersten der Gruppe.", 12, "#5a4632");
  }

  // Eine einfache Tabelle: breiten in Pixeln, zeilen[0] ist die Kopfzeile.
  // Liefert die Höhe.
  tabelle(x, y, breiten, zeilen, groesse) {
    var szene = this, g = this.add.graphics(), pad = MASS.px(3), yy = y;
    this.inhalt.push(g);
    var gesamt = breiten.reduce(function (a, b) { return a + b; }, 0);
    zeilen.forEach(function (zeile, z) {
      var texte = [], h = 0, xx = x;
      zeile.forEach(function (zelle, s) {
        var t = szene.text(xx + pad, yy + pad, String(zelle), groesse || 11, z === 0 ? "#2b2b2b" : "#3a2a1c", z === 0 ? "bold" : "");
        t.setWordWrapWidth(breiten[s] - 2 * pad, true);
        texte.push(t); h = Math.max(h, t.height + 2 * pad); xx += breiten[s];
      });
      if (z === 0) g.fillStyle(0xe3eeee, 1).fillRect(x, yy, gesamt, h);
      g.lineStyle(MASS.px(1), 0x2f5d62, 0.6).strokeRect(x, yy, gesamt, h);
      var sx = x;
      breiten.slice(0, -1).forEach(function (b) { sx += b; g.lineBetween(sx, yy, sx, yy + h); });
      yy += h;
    });
    return yy - y;
  }

  // Seit Fassung 19 zwei Teile: Stoffe (die Sammlung) und Stoffkunde (die
  // chemischen Hintergründe). Im Spiel selbst stehen nur Symbole und
  // Zahlen; wer mehr wissen will, findet es hier.
  zeigeStoffbuch(f0) {
    var szene = this, stand = this.stand, teil = this.stoffTeil || "stoffe";
    var kopfH = MASS.px(36), x = f0.x;
    [["stoffe", "Stoffe"], ["kunde", "Stoffkunde"]].forEach(function (p) {
      var k = baueKnopf(szene, p[1], function () { szene.stoffTeil = p[0]; szene.neuZeichnen(); }, { hoehe: 28, schrift: 13, mindestbreite: 96 });
      k.setPosition(x + k.width / 2, f0.y + MASS.px(14)).setAlpha(teil === p[0] ? 1 : 0.55);
      x += k.width + MASS.px(6);
      szene.inhalt.push(k);
    });
    if (teil === "kunde") { this.zeigeStoffkunde({ x: f0.x, y: f0.y + kopfH, b: f0.b, h: f0.h - kopfH }, x + MASS.px(8), f0.y); return; }
    var f = { x: f0.x, y: f0.y + kopfH - MASS.px(24), b: f0.b, h: f0.h - kopfH + MASS.px(24) };
    var arten = Object.keys(ARTEN);
    var gefangen = {};
    stand.gruppe.concat(stand.lager).forEach(function (el) { gefangen[el.art] = true; });
    // Wer mitkommt, ist bekannt – auch ohne Bestimmung im Kampf.
    // Seit Fassung 17 auch, wen man bei einem Stoffmeister gesehen hat.
    function kenntArt(a) { return stand.bekannt.indexOf(a) >= 0 || gefangen[a] || stand.gesehen.indexOf(a) >= 0; }
    var bekannt = arten.filter(kenntArt).length;
    this.text(x + MASS.px(8), f0.y + MASS.px(6), "Großmutters Buch · " + bekannt + " von " + arten.length + " Stoffen bekannt", 13, "#5a4632");

    // Ab 7 Arten vier Spalten: Bei acht Arten in drei Spalten ragte die
    // dritte Reihe unten aus dem Buch (Fassung 13–16).
    var spalten = arten.length > 6 ? 4 : 3, reihen = Math.ceil(arten.length / spalten), luecke = MASS.px(10);
    var zB = (f.b - (spalten - 1) * luecke) / spalten, zH = (f.h - MASS.px(24) - (reihen - 1) * luecke) / reihen;
    arten.forEach(function (art, i) {
      var x = f.x + (i % spalten) * (zB + luecke), y = f.y + MASS.px(24) + Math.floor(i / spalten) * (zH + luecke);
      var kennt = kenntArt(art), a = ARTEN[art];
      var rahmen = szene.add.graphics();
      rahmen.fillStyle(0xffffff, 0.35).fillRoundedRect(x, y, zB, zH, MASS.px(8)).lineStyle(MASS.px(1.5), 0xc9a66b, 1).strokeRoundedRect(x, y, zB, zH, MASS.px(8));
      szene.inhalt.push(rahmen);
      var bh = Math.min(zH * 0.45, MASS.px(64));
      var bild = szene.bild(x + MASS.px(6), y + MASS.px(6), art, bh, !kennt);
      var tx = x + MASS.px(12) + bild.displayWidth;
      szene.text(tx, y + MASS.px(6), kennt ? a.name : "???", 14, null, "bold");
      // Seit Fassung 18 gilt die Sperre auch für Lumis Starter (AUFTRETEN.fangbarAb).
      var spaeter = AUFTRETEN.fangbarAb(art, stand);
      var marke = gefangen[art] ? "\n✓ gefangen" : spaeter && kennt ? "\ngesehen · fangbar später" : "";
      szene.text(tx, y + MASS.px(26), kennt ? a.formel + " · " + a.klasse + marke : (a.seltenheit !== "haeufig" ? "selten" : ""), 12, "#5a4632");
      var lumis = spaeter && !a.fangbarAb;
      var fundtext = !kennt ? FUNDHINWEISE[art].vage : lumis ? "Lumi hat es. Wild erst bei den " + spaeter + "." : FUNDHINWEISE[art].genau;
      var hinweis = szene.text(x + MASS.px(6), y + bh + MASS.px(12), fundtext, 11, kennt ? FARBE.tinte : "#6b4a2b", kennt ? "" : "italic");
      hinweis.setWordWrapWidth(zB - MASS.px(12), true);
      // Einmal erkannt genügt: Werte und Angriffe stehen dann im Buch.
      if (kennt) szene.antippbar(x, y, zB, zH, function () { szene.zeigeDetailVon(null, art, "stoffbuch"); });
    });
  }

  // Stoffkunde: vier Seiten zum Blättern. Seit Fassung 20 aus der Tabelle
  // des Nutzers (daten\kreaturen.js) – was hier steht, rechnet der Kampf.
  zeigeStoffkunde(f, kopfX, kopfY) {
    var szene = this, stand = this.stand;
    var seiten = ["Die Typen", "Typentabelle", "Status und Energie", "Deine Attacken"];
    var nr = this.kundeSeite || 0;
    [["‹", -1], ["›", 1]].forEach(function (p) {
      var ziel = nr + p[1], geht = ziel >= 0 && ziel < seiten.length;
      var k = baueKnopf(szene, p[0], function () { if (geht) { szene.kundeSeite = ziel; szene.neuZeichnen(); } }, { hoehe: 28, schrift: 15, mindestbreite: 36 });
      k.setPosition(kopfX + k.width / 2, kopfY + MASS.px(14)).setAlpha(geht ? 1 : 0.3);
      kopfX += k.width + MASS.px(6);
      szene.inhalt.push(k);
    });
    this.text(kopfX + MASS.px(6), kopfY + MASS.px(5), (nr + 1) + "/" + seiten.length + "  " + seiten[nr], 15, null, "bold");
    var typen = Object.keys(KTYPEN);

    if (nr === 0) {
      var zeilen = [["Typ", "Gruppe im Periodensystem", "Art", "Idee"]];
      typen.forEach(function (t) {
        var x = KTYPEN[t];
        zeilen.push(["● " + x.name, x.gruppe, x.physisch ? "physisch" : "speziell", x.idee]);
      });
      this.tabelle(f.x, f.y, [f.b * 0.13, f.b * 0.32, f.b * 0.09, f.b * 0.46], zeilen, 9);
    } else if (nr === 1) {
      this.typentabelle(f);
    } else if (nr === 2) {
      var z3 = [["Status", "Wirkung", "kommt von"]];
      KSTATUS.forEach(function (s) { z3.push([s.name, s.wirkung, s.quelle]); });
      z3.push(["Energie (E)", "Jede Runde +" + KAMPF.AE_JE_RUNDE + ", höchstens " + KAMPF.AE_MAX + ". Kraft sammeln +2, Bunsenbrenner +4 (einmal je Kampf).", ""]);
      z3.push(["Kosten", "Stärke bis 40: 0 E · 50–75: 1 E · 80–100: 2 E · ab 120: 3 E · Status-Attacken 1 E", ""]);
      z3.push(["Gleicher Typ", "Eine Attacke vom eigenen Typ trifft ×1,5.", ""]);
      this.tabelle(f.x, f.y, [f.b * 0.17, f.b * 0.6, f.b * 0.23], z3, 11);
    } else {
      var ids = [];
      stand.gruppe.concat(stand.lager).forEach(function (el) {
        KAMPF.angriffe(el).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
      });
      if (!ids.length) { this.text(f.x, f.y, "Noch kennt keines deiner Elementals eine Attacke.", 13); return; }
      var z4 = [["Attacke", "Typ", "Stärke", "Treffer", "E", "Effekt", "Erklärung"]];
      ids.forEach(function (id) {
        var a = ATTACKEN[id], st = KAMPF.staerke(null, id);
        z4.push([a.name, KTYPEN[a.typ].name, st === null ? "–" : String(st), a.genau === null ? "immer" : a.genau + " %", a.ae, a.effekt || "–", a.text]);
      });
      this.tabelle(f.x, f.y, [f.b * 0.14, f.b * 0.1, f.b * 0.07, f.b * 0.08, f.b * 0.04, f.b * 0.26, f.b * 0.31], z4, 10);
    }
  }

  // Die Typentabelle als farbiges Raster: Zeile = Attacken-Typ, Spalte =
  // Typ des Verteidigers. Grün ×2, orange ×½, grau ×0, leer ×1.
  typentabelle(f) {
    var g = this.add.graphics(), szene = this;
    this.inhalt.push(g);
    var zeilen = Object.keys(TYPENTABELLE), spalten = Object.keys(TYPENTABELLE[zeilen[0]]);
    var kopfB = f.b * 0.13, zb = (f.b - kopfB) / spalten.length;
    var zh = Math.min(MASS.px(20), (f.h - MASS.px(34)) / (zeilen.length + 1));
    var farbe = { 2: 0x6fbf73, 0.5: 0xe8a35a, 0: 0x9a9a9a };
    spalten.forEach(function (v, i) {
      szene.text(f.x + kopfB + i * zb + MASS.px(2), f.y, KTYPEN[v].name.slice(0, 5), 9, "#2b2b2b", "bold");
    });
    zeilen.forEach(function (an, j) {
      var y = f.y + (j + 1) * zh;
      g.fillStyle(TYPFARBE[an], 1).fillCircle(f.x + MASS.px(5), y + zh / 2, MASS.px(4));
      szene.text(f.x + MASS.px(12), y + MASS.px(2), KTYPEN[an].name, 9, "#2b2b2b", "bold");
      spalten.forEach(function (v, i) {
        var w = TYPENTABELLE[an][v], x = f.x + kopfB + i * zb;
        if (w !== 1) {
          g.fillStyle(farbe[w], 0.85).fillRect(x + 1, y + 1, zb - 2, zh - 2);
          szene.text(x + zb / 2, y + MASS.px(2), w === 0.5 ? "½" : String(w), 10, "#1a1a1a", "bold").setOrigin(0.5, 0);
        }
        g.lineStyle(MASS.px(1), 0x2f5d62, 0.25).strokeRect(x, y, zb, zh);
      });
    });
    this.text(f.x, f.y + (zeilen.length + 1) * zh + MASS.px(6), "Zeile: Attacke · Spalte: Typ des Ziels · Grün ×2, orange ×½, grau keine Wirkung. Normal trifft auch kein Gas.", 10, "#5a4632");
  }

  // ============================================================
  //  Detail: Werte mit Herkunft, Empfindlichkeiten, Angriffe
  //  Alles wird aus den Regeln in kern\kampf.js abgeleitet – was hier
  //  steht, ist genau das, womit der Kampf rechnet.
  // ============================================================
  zeigeDetail(f) {
    var szene = this, art = this.detail.art, a = ARTEN[art], el = this.detail.el;
    var probe = el || { art: art, stufe: 5 };
    var w = KAMPF.werte(probe), s = a.stoff;
    var komma = function (z) { return String(Math.round(z * 100) / 100).replace(".", ","); };

    // Linkes Drittel: das Bild so groß wie möglich, darunter Name, Klasse
    // und Beschreibung. Erst die Texte setzen, dann bekommt das Bild den Rest.
    var linksB = f.b / 3 - MASS.px(8);
    var name = this.text(f.x, 0, (el && el.spitzname) || a.name, 16, null, "bold");
    var typName = KTYPEN[a.typ1].name + (a.typ2 ? "/" + KTYPEN[a.typ2].name : "");
    var info = this.text(f.x, 0, a.formel + " · " + a.klasse + " · Typ " + typName + " · " + (el ? "Stufe " + el.stufe + (el.starter ? " · Starter" : "") : "Werte auf Stufe 5"), 11, "#5a4632");
    info.setWordWrapWidth(linksB, true);
    var beschr = this.text(f.x, 0, a.beschreibung || "", 11, "#3a2a1c");
    beschr.setWordWrapWidth(linksB, true);
    var textH = name.height + info.height + beschr.height + MASS.px(8);
    var o = this.add.image(f.x, f.y, "el-" + art).setOrigin(0, 0);
    o.setScale(Math.min(linksB / o.width, (f.h - textH) / o.height));
    this.inhalt.push(o);
    var ty = f.y + o.displayHeight + MASS.px(4);
    name.setY(ty); info.setY(ty + name.height); beschr.setY(ty + name.height + info.height + MASS.px(4));

    // Rechte zwei Drittel: zwei Tabellen nebeneinander, darunter die Attacken
    var x = f.x + linksB + MASS.px(16), b = f.b - linksB - MASS.px(16), y = f.y;

    var bonus = probe.starter ? " (+" + Math.round(KAMPF.STARTER_BONUS * 100) + " %)" : "";
    var g = GRUPPEN[a.gruppe];
    var bWerte = b * 0.6 - MASS.px(6), bTrifft = b - bWerte - MASS.px(6);
    // Seit Fassung 12: fünf Kampfwerte wie im Spiel der 1. Generation.
    // Die Gruppe gibt die Verteilung, der Stoff den Feinschliff.
    var h1 = this.tabelle(x, y, [bWerte * 0.3, bWerte * 0.22, bWerte * 0.48], [
      ["Wert", "Zahl", "kommt von"],
      ["LP", (el ? el.zh + "/" : "") + w.zhMax + bonus, "Schmelzpunkt " + s.schmelz + " °C"],
      ["Angriff", w.angriff + bonus, g.name],
      ["Verteidigung", w.verteidigung, g.name + ", Härte " + komma(s.haerte)],
      ["Sp.-Angriff", w.spAngriff + bonus, g.name],
      ["Sp.-Verteid.", w.spVerteidigung, g.name],
      ["Tempo", w.tempo, "Dichte " + komma(s.dichte) + " g/cm³"]
    ], 10);
    // Was gegen diese Art besonders gut oder schlecht wirkt (Typentabelle)
    var bruch = function (z) { return z === 0.5 ? "×½" : z === 0.25 ? "×¼" : "×" + z; };
    var wirkt = Object.keys(KTYPEN).map(function (t) { return [t, KAMPF.typFaktor(t, art)]; })
      .filter(function (p) { return p[1] !== 1; }).sort(function (p, q) { return q[1] - p[1]; });
    var h2 = this.tabelle(x + bWerte + MASS.px(6), y, [bTrifft * 0.55, bTrifft * 0.45], [["Attacken-Typ", "gegen " + typName]].concat(wirkt.map(function (p) {
      return [KTYPEN[p[0]].name, bruch(p[1])];
    })), 10);
    y += Math.max(h1, h2) + MASS.px(6);

    // Eigenes Elemental: seine Attacken. Sonst (Stoffbuch) das Lernset
    // der Art mit dem Level davor.
    var stufeVon = {};
    Object.keys(a.lernset).forEach(function (st) { a.lernset[st].forEach(function (id) { if (!stufeVon[id]) stufeVon[id] = st; }); });
    var liste = el ? KAMPF.angriffe(el) : KAMPF.lernsetBis(art, 100);
    var zeilen = [[el ? "Attacke" : "Level · Attacke", "Typ", "Stärke", "E", "Wirkung"]];
    liste.forEach(function (id) {
      var r = ATTACKEN[id], st = KAMPF.staerke(probe, id);
      zeilen.push([el ? r.name : stufeVon[id] + " · " + r.name, KTYPEN[r.typ].name, st === null ? "–" : String(st), r.ae, angriffZusatz(id).join(" · ") || "–"]);
    });
    this.tabelle(x, y, [b * 0.24, b * 0.15, b * 0.1, b * 0.05, b * 0.46], zeilen, el ? 10 : 8);
  }

  // Seit Fassung 17 als Tabellen: Gefäße und Waren links, Geräte rechts.
  zeigeGepaeck(f) {
    var stand = this.stand, y = f.y, halb = (f.b - MASS.px(12)) / 2;
    this.text(f.x, y, "Geld: " + stand.geld + " " + HANDEL.WAEHRUNG, 15, null, "bold");
    y += MASS.px(26);
    var zeilen = [["Gefäß / Ware", "Anzahl", "Fangrate"]];
    Object.keys(GEFAESSE).forEach(function (g) { if (stand.vorrat[g] > 0) zeilen.push([GEFAESSE[g].name, String(stand.vorrat[g]), GEFAESSE[g].rate]); });
    Object.keys(WAREN).forEach(function (w) {
      var n = WAREN[w].vorrat ? stand.vorrat[w] : stand.material[w];
      if (n > 0) zeilen.push([WAREN[w].name, String(n), w === "kaeltemischung" ? "abkühlen ×2" : "–"]);
    });
    if (zeilen.length === 1) zeilen.push(["keine", "", ""]);
    var h1 = this.tabelle(f.x, y, [halb * 0.5, halb * 0.2, halb * 0.3], zeilen, 11);
    this.text(f.x, y + h1 + MASS.px(4), "Ein Gefäß wird nur verbraucht, wenn der Bund gelingt.", 11, "#5a4632", "italic")
      .setWordWrapWidth(halb, true);

    var x2 = f.x + halb + MASS.px(12);
    var geraete = [["Werkzeug / Gerät", "wofür"]];
    stand.werkzeuge.forEach(function (w) {
      var wz = WERKZEUGE[w];
      geraete.push([wz.name, wz.prueft.length ? "Untersuchen" : wz.labor ? "Labor" : "–"]);
    });
    if (geraete.length === 1) geraete.push(["keine", ""]);
    this.tabelle(x2, y, [halb * 0.6, halb * 0.4], geraete, 11);
  }
}
