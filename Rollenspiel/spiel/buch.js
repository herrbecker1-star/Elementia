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

    // Linkes Drittel: das Bild so groß wie möglich, darunter Name, Klasse
    // und Beschreibung. Erst die Texte setzen, dann bekommt das Bild den Rest.
    var linksB = f.b / 3 - MASS.px(8);
    var name = this.text(f.x, 0, (el && el.spitzname) || a.name, 16, null, "bold");
    var info = this.text(f.x, 0, a.formel + " · " + a.klasse + " · " + (el ? "Stufe " + el.stufe + (el.starter ? " · Starter" : "") : "Werte auf Stufe 5"), 11, "#5a4632");
    info.setWordWrapWidth(linksB, true);
    var beschr = this.text(f.x, 0, a.beschreibung || "", 11, "#3a2a1c");
    beschr.setWordWrapWidth(linksB, true);
    var textH = name.height + info.height + beschr.height + MASS.px(8);
    var o = this.add.image(f.x, f.y, "el-" + art).setOrigin(0, 0);
    o.setScale(Math.min(linksB / o.width, (f.h - textH) / o.height));
    this.inhalt.push(o);
    var ty = f.y + o.displayHeight + MASS.px(4);
    name.setY(ty); info.setY(ty + name.height); beschr.setY(ty + name.height + info.height + MASS.px(4));

    // Rechte zwei Drittel: zwei Tabellen nebeneinander, darunter die Angriffe
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
    // Die Spalte der Typtabelle (daten\typen.js) für diesen Stoff – nur die
    // Typen, die es im Spiel schon als Angriff gibt.
    var typen = Object.keys(TYPEN).filter(function (t) {
      return Object.keys(REAKTIONEN).some(function (id) { return REAKTIONEN[id].typ === t; });
    });
    var bruch = function (f) { return f === 0.5 ? "×½" : "×" + f; };
    var h2 = this.tabelle(x + bWerte + MASS.px(6), y, [bTrifft * 0.38, bTrifft * 0.62], [["So stark trifft es", a.klasse]].concat(typen.map(function (t) {
      var wk = typWirkung(t, art, 20);
      return [TYPEN[t].name, bruch(wk.faktor) + (wk.wort ? " " + wk.wort : "")];
    })), 10);
    y += Math.max(h1, h2) + MASS.px(6);

    var zeilen = [["Angriff", "Typ", "Stärke", "E", "Wirkung"]];
    (el ? KAMPF.angriffe(el) : a.reaktionen).forEach(function (id) {
      var r = REAKTIONEN[id];
      var st = r.typ === "waerme" ? "Wärme + " + KAMPF.REGEL.waermeGrund : r.typ === "schutz" ? "–" : String(KAMPF.staerke(probe, id));
      zeilen.push([r.name, r.typ === "schutz" ? "Schutz" : TYPEN[r.typ].name, st, r.ae, [r.text].concat(angriffZusatz(id)).join(" ")]);
    });
    this.tabelle(x, y, [b * 0.2, b * 0.13, b * 0.12, b * 0.05, b * 0.5], zeilen, 10);
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
