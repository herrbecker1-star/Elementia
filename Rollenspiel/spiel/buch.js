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

    this.scale.on("resize", this.neuZeichnen, this);
    this.events.once("shutdown", function () { szene.scale.off("resize", szene.neuZeichnen, szene); });
    this.zeige(daten.reiter || "gruppe");
  }

  zeige(reiter) {
    this.reiter = reiter;
    this.neuZeichnen();
  }

  neuZeichnen() {
    var b = this.scale.width, h = this.scale.height, rand = MASS.px(12);
    this.inhalt.forEach(function (o) { o.destroy(); });
    this.inhalt = [];

    this.grund.clear().fillStyle(0x000000, 0.55).fillRect(0, 0, b, h)
      .fillStyle(FARBE.papier, 0.98).fillRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14))
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).strokeRoundedRect(rand, rand, b - 2 * rand, h - 2 * rand, MASS.px(14));

    var szene = this, x = rand * 2;
    this.reiterKnoepfe.forEach(function (k, i) {
      k.setPosition(x + k.width / 2, rand * 2 + k.height / 2);
      k.setAlpha(["gruppe", "stoffbuch", "gepaeck"][i] === szene.reiter ? 1 : 0.6);
      x += k.width + MASS.px(8);
    });
    this.schliessen.setPosition(b - rand * 2 - this.schliessen.width / 2, rand * 2 + this.schliessen.height / 2);

    var oben = rand * 2 + MASS.px(48);
    var flaeche = { x: rand * 2, y: oben, b: b - rand * 4, h: h - oben - rand * 2 };
    if (this.reiter === "gruppe") this.zeigeGruppe(flaeche);
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
      var w = KAMPF.grundwerte(el.art, el.stufe);
      szene.bild(x, y, el.art, zeileH, false);
      var tx = x + zeileH * 1.5 + MASS.px(8);
      szene.text(tx, y, (el.spitzname || ARTEN[el.art].name) + "  ·  Stufe " + el.stufe, 16, null, "bold");
      var balken = szene.add.graphics();
      var bb = spB - (tx - x) - MASS.px(8), anteil = el.zh / w.zhMax;
      balken.fillStyle(0x3a2a1c, 0.25).fillRoundedRect(tx, y + MASS.px(26), bb, MASS.px(9), MASS.px(4))
        .fillStyle(anteil > 0.5 ? 0x4f9a5a : anteil > 0.2 ? 0xd9a63a : 0xc0453a, 1)
        .fillRoundedRect(tx, y + MASS.px(26), Math.max(0, bb * anteil), MASS.px(9), MASS.px(4));
      szene.inhalt.push(balken);
      szene.text(tx, y + MASS.px(40), (el.zh > 0 ? "Zusammenhalt " + el.zh + "/" + w.zhMax : "erschöpft – ab ins Labor") +
        "\nErfahrung " + el.ep + "/" + KAMPF.epBisNaechste(el.stufe), 12, "#5a4632");
    });
    if (stand.lager.length) {
      this.text(f.x, f.y + f.h - MASS.px(20), "Im Lager warten " + stand.lager.length + " weitere Elementals.", 13, "#5a4632");
    }
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
