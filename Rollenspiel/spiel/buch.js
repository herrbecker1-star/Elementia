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
      baueKnopf(this, "Gepäck", function () { szene.zeige("gepaeck"); }, { hoehe: 36, schrift: 14, mindestbreite: 110 })
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
      k.setAlpha(["gruppe", "stoffbuch", "gepaeck"][i] === szene.reiter ? 1 : 0.6);
      x += k.width + MASS.px(8);
    });
    this.zurueckKnopf.setVisible(imDetail).setPosition(rand * 2 + this.zurueckKnopf.width / 2, rand * 2 + this.zurueckKnopf.height / 2);
    this.schliessen.setPosition(b - rand * 2 - this.schliessen.width / 2, rand * 2 + this.schliessen.height / 2);

    var oben = rand * 2 + MASS.px(48);
    var flaeche = { x: rand * 2, y: oben, b: b - rand * 4, h: h - oben - rand * 2 };
    if (imDetail) this.zeigeDetail(flaeche);
    else if (this.reiter === "gruppe") this.zeigeGruppe(flaeche);
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

  zeigeGruppe(f) {
    var szene = this, stand = this.stand;
    if (!stand.gruppe.length) { this.text(f.x, f.y, "Noch begleitet dich kein Elemental.", 16); return; }
    var spalten = 2, zeileH = MASS.px(76), spB = (f.b - MASS.px(12)) / spalten;
    stand.gruppe.forEach(function (el, i) {
      var x = f.x + (i % spalten) * (spB + MASS.px(12)), y = f.y + Math.floor(i / spalten) * (zeileH + MASS.px(8));
      var w = KAMPF.werte(el);
      szene.bild(x, y, el.art, zeileH, false);
      var tx = x + zeileH * 1.5 + MASS.px(8);
      szene.text(tx, y, (el.spitzname || ARTEN[el.art].name) + "  ·  Stufe " + el.stufe, 16, null, "bold");
      var balken = szene.add.graphics();
      var bb = spB - (tx - x) - MASS.px(8), anteil = el.zh / w.zhMax;
      balken.fillStyle(0x3a2a1c, 0.25).fillRoundedRect(tx, y + MASS.px(26), bb, MASS.px(9), MASS.px(4))
        .fillStyle(anteil > 0.5 ? 0x4f9a5a : anteil > 0.2 ? 0xd9a63a : 0xc0453a, 1)
        .fillRoundedRect(tx, y + MASS.px(26), Math.max(0, bb * anteil), MASS.px(9), MASS.px(4));
      szene.inhalt.push(balken);
      szene.text(tx, y + MASS.px(40), (el.zh > 0 ? "LP " + el.zh + "/" + w.zhMax : "erschöpft – ab ins Labor") +
        "\nErfahrung " + el.ep + "/" + KAMPF.epBisNaechste(el.stufe), 12, "#5a4632");
      szene.antippbar(x, y, spB, zeileH, function () { szene.zeigeDetailVon(el, el.art, "gruppe"); });
    });
    this.text(f.x, f.y + f.h - MASS.px(20), (stand.lager.length ? "Im Lager warten " + stand.lager.length + " weitere Elementals. " : "") +
      "Antippen zeigt Werte und Angriffe.", 13, "#5a4632");
  }

  zeigeStoffbuch(f) {
    var szene = this, stand = this.stand;
    var arten = Object.keys(ARTEN);
    var gefangen = {};
    stand.gruppe.concat(stand.lager).forEach(function (el) { gefangen[el.art] = true; });
    // Wer mitkommt, ist bekannt – auch ohne Bestimmung im Kampf.
    function kenntArt(a) { return stand.bekannt.indexOf(a) >= 0 || gefangen[a]; }
    var bekannt = arten.filter(kenntArt).length;
    this.text(f.x, f.y, "Großmutters Buch · " + bekannt + " von " + arten.length + " Stoffen bekannt", 13, "#5a4632");

    var spalten = 3, luecke = MASS.px(10);
    var zB = (f.b - (spalten - 1) * luecke) / spalten, zH = (f.h - MASS.px(24) - luecke) / 2;
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
      szene.text(tx, y + MASS.px(26), kennt ? a.formel + " · " + a.klasse + (gefangen[art] ? "\n✓ gefangen" : "") : (a.seltenheit !== "haeufig" ? "selten" : ""), 12, "#5a4632");
      var hinweis = szene.text(x + MASS.px(6), y + bh + MASS.px(12), kennt ? FUNDHINWEISE[art].genau : FUNDHINWEISE[art].vage, 11, kennt ? FARBE.tinte : "#6b4a2b", kennt ? "" : "italic");
      hinweis.setWordWrapWidth(zB - MASS.px(12), true);
      // Einmal erkannt genügt: Werte und Angriffe stehen dann im Buch.
      if (kennt) szene.antippbar(x, y, zB, zH, function () { szene.zeigeDetailVon(null, art, "stoffbuch"); });
    });
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

    // Links: Bild, Name, Beschreibung
    var linksB = Math.min(f.b * 0.36, MASS.px(260));
    var bildH = Math.min(f.h * 0.42, MASS.px(120));
    var bild = this.bild(f.x, f.y, art, bildH, false);
    this.text(f.x + bild.displayWidth + MASS.px(8), f.y, (el && el.spitzname) || a.name, 17, null, "bold");
    this.text(f.x + bild.displayWidth + MASS.px(8), f.y + MASS.px(24), a.formel + " · " + a.klasse +
      "\n" + (el ? "Stufe " + el.stufe + (el.starter ? " · Starter" : "") : "Werte auf Stufe 5"), 13, "#5a4632");
    this.text(f.x, f.y + bildH + MASS.px(8), a.beschreibung || "", 13).setWordWrapWidth(linksB, true);

    // Rechts: Werte, Empfindlichkeiten, Angriffe
    var x = f.x + linksB + MASS.px(16), b = f.b - linksB - MASS.px(16), y = f.y;
    var bonus = probe.starter ? "  (+" + Math.round(KAMPF.STARTER_BONUS * 100) + " % als Starter)" : "";
    var stufeLP = s.schmelz >= 1000 ? "hoch" : s.schmelz >= 500 ? "mittel" : "niedrig";
    var werteText =
      "LP " + (el ? el.zh + "/" : "") + w.zhMax + bonus + " – Schmelzpunkt " + s.schmelz + " °C (" + stufeLP + ")" +
      "\nAbwehr " + w.abwehr + " – Härte " + komma(s.haerte) + " · Tempo " + komma(w.tempo) + " – Dichte " + komma(s.dichte) + " g/cm³ (leicht ist schnell)";
    var t = this.text(x, y, werteText, 12, "#3a2a1c"); t.setWordWrapWidth(b, true); y += t.height + MASS.px(4);

    var sulf = REAKTIONEN.sulfidbildung, sf = (sulf.gegen && sulf.gegen[art]) || (a.klasse === "Metall" ? sulf.gegenMetall : sulf.gegenNichtmetall);
    var spr = KAMPF.wuchtFaktor(art, 20);
    var empf = [
      "Feuer ×" + komma(KAMPF.hitzeFaktor(art)),
      "Schlag ×" + komma(spr) + (spr > 1 ? " (spröde" + (a.warmVerformbar ? ", warm formbar" : "") + ")" : " (verformbar)"),
      "Sulfidbildung ×" + komma(sf),
      "Wärmeleitung ×" + komma(KAMPF.leitFaktor(art))
    ].join(" · ");
    t = this.text(x, y, "Trifft es: " + empf, 12, "#3a2a1c"); t.setWordWrapWidth(b, true); y += t.height + MASS.px(6);

    var ARTNAME = { wucht: "Schlag", hitze: "Feuer", reaktion: "Stoffreaktion", leitung: "Wärme", schutz: "Schutz" };
    a.reaktionen.forEach(function (id) {
      var r = REAKTIONEN[id], teile = [ARTNAME[r.art]];
      if (r.art === "leitung") teile.push("Kraft: Wärme des Feldes");
      else if (r.kraft) teile.push("Kraft " + r.kraft);
      teile.push(r.ae + " Energie");
      if (r.o2) teile.push("braucht Sauerstoff");
      var stark = Object.keys(r.gegen || {}).filter(function (z) { return r.gegen[z] >= 1.5; }).map(function (z) { return ARTEN[z].name; });
      if (r.art === "reaktion" && r.gegenMetall > 1) stark.unshift("Metalle");
      if (stark.length) teile.push("stark gegen " + stark.join(", "));
      var kopf = szene.text(x, y, r.name + " – " + teile.join(" · "), 12, null, "bold");
      kopf.setWordWrapWidth(b, true); y += kopf.height;
      var tx = szene.text(x, y, r.text, 11, "#5a4632"); tx.setWordWrapWidth(b, true); y += tx.height + MASS.px(4);
    });
  }

  zeigeGepaeck(f) {
    var stand = this.stand, y = f.y;
    this.text(f.x, y, "Fanggeräte", 15, null, "bold"); y += MASS.px(24);
    var geraete = Object.keys(FANGGERAETE).filter(function (g) { return stand.vorrat[g] > 0; });
    if (!geraete.length) { this.text(f.x, y, "keine", 13, "#5a4632"); y += MASS.px(20); }
    geraete.forEach(function (g) {
      this.text(f.x, y, "• " + FANGGERAETE[g].name + "  ×" + stand.vorrat[g], 14); y += MASS.px(22);
    }, this);
    this.text(f.x, y + MASS.px(2), "Ein Gerät wird nur verbraucht, wenn der Bund gelingt.", 12, "#5a4632", "italic");
    y += MASS.px(34);
    this.text(f.x, y, "Werkzeuge zum Untersuchen", 15, null, "bold"); y += MASS.px(24);
    this.text(f.x, y, stand.werkzeuge.map(function (w) { return WERKZEUGE[w].name; }).join(" · "), 14);
  }
}
