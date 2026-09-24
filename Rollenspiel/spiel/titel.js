// ============================================================
//  LADEN UND TITEL
// ============================================================

class LadeSzene extends Phaser.Scene {
  constructor() { super("laden"); }

  preload() {
    var b = this.scale.width, h = this.scale.height;
    var balken = this.add.graphics();
    var text = this.add.text(b / 2, h / 2 - MASS.px(28), "Elementia wird geladen …", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(16) + "px", color: "#f4ead5"
    }).setOrigin(0.5);
    this.load.on("progress", function (anteil) {
      balken.clear();
      balken.fillStyle(0xc9a66b, 1);
      balken.fillRect(b * 0.25, h / 2, b * 0.5 * anteil, MASS.px(6));
    });
    if (window.PROBE_MELDEN) this.load.on("filecomplete", function (schluessel) { window.PROBE_MELDEN("geladen: " + schluessel); });
    this.load.on("loaderror", function (datei) {
      if (window.PROBE_MELDEN) window.PROBE_MELDEN("Ladefehler: " + datei.src);
      text.setText("Fehlt: " + datei.src + "\nLäuft das Spiel über spiel-testen.ps1?");
    });

    this.load.image("kacheln", "grafik/platzhalter-kacheln.png");
    this.load.spritesheet("figuren", "grafik/platzhalter-figuren.png", { frameWidth: 32, frameHeight: 32 });
    ["stoffingen", "kolbenwald", "brenner"].forEach(function (k) { this.load.tilemapTiledJSON(k, "karten/" + k + ".json"); }, this);
    // Die Kampfbilder gleich mit: Der erste Kampf soll sofort da sein,
    // nicht erst nach einem Nachladen mitten im Spiel.
    var lader = this.load;
    Object.keys(ARTEN).forEach(function (art) { lader.image("el-" + art, "grafik/elementals/" + ARTEN[art].bild + ".png"); });
    Object.keys(KAMPF_HINTERGRUND).forEach(function (ort) { lader.image("hg-" + ort, KAMPF_HINTERGRUND[ort]); });
  }

  create() {
    // Silhouetten fürs Stoffbuch als eigene Texturen: Einfärben per
    // Tint gibt es nur unter WebGL, im 2D-Renderer bliebe das Bild bunt
    // – und das Unbekannte wäre verraten.
    var texturen = this.textures;
    Object.keys(ARTEN).forEach(function (art) {
      var quelle = texturen.get("el-" + art).getSourceImage();
      var leinwand = document.createElement("canvas");
      leinwand.width = quelle.width; leinwand.height = quelle.height;
      var c = leinwand.getContext("2d");
      c.drawImage(quelle, 0, 0);
      // Fast deckend abgedunkelt: Die Gestalt ahnt man, die Farbe – und
      // damit der Stoff – bleibt verborgen. Ganz deckend blieb nur ein
      // Oval übrig, weil die Vignette den Bildhintergrund mitträgt.
      c.globalCompositeOperation = "saturation";
      c.fillStyle = "#808080";
      c.fillRect(0, 0, leinwand.width, leinwand.height);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = "rgba(43, 29, 16, 0.82)";
      c.fillRect(0, 0, leinwand.width, leinwand.height);
      // Das Entfärben füllt auch durchsichtige Stellen – die weiche
      // Vignette des Originals zurückholen.
      c.globalCompositeOperation = "destination-in";
      c.drawImage(quelle, 0, 0);
      if (!texturen.exists("sil-" + art)) texturen.addCanvas("sil-" + art, leinwand);
    });

    // Laufbilder je Figur: Zeile r, Spalten unten/links/rechts/oben × 2.
    var anims = this.anims;
    for (var r = 0; r < 11; r++) {
      ["unten", "links", "rechts", "oben"].forEach(function (richtung, i) {
        anims.create({
          key: "gehen-" + r + "-" + richtung,
          frames: anims.generateFrameNumbers("figuren", { frames: [r * 8 + i * 2, r * 8 + i * 2 + 1] }),
          frameRate: 6,
          repeat: -1
        });
      });
    }
    // Prüfschalter: ?direkt=1 überspringt den Titel mit einem neuen
    // Spiel, ?dialog=lumi öffnet zusätzlich sofort diesen Dialog.
    // Für kopflose Fotos, die sonst nie an der Titelseite vorbeikämen.
    var suche = new URLSearchParams(location.search);
    // (Den Dialog öffnet die UI-Szene selbst, sobald sie steht.)
    // ?probegruppe=1 gibt die Probegruppe auch ohne Kampf (Schemen
    // erscheinen erst, wenn jemand mitkommt); ?zeit=22:00 und
    // ?wetter=regen stellen Uhr und Himmel.
    if (suche.get("direkt") === "1" || suche.get("dialog") || suche.get("kampf")) {
      var stand = SPIELSTAND.neu();
      if (suche.get("zeit")) { var hm = suche.get("zeit").split(":"); stand.zeit = Number(hm[0]) * 60 + Number(hm[1] || 0); }
      if (suche.get("wetter")) stand.wetter = { art: suche.get("wetter"), bis: (stand.zeit || 420) + 100000 };
      if (suche.get("kampf") || suche.get("probegruppe")) {
        // Probegruppe, bis die Starterwahl (M3) steht.
        stand.gruppe = [KAMPF.neuesElemental("eisen", 5), KAMPF.neuesElemental("magnesium", 5)];
        stand.vorrat = { reagenzglas: 3, tiegelzange: 2, spatel: 2 };
        stand.werkzeuge = ["lupe", "magnet", "stromkreis", "hammer", "gasbrenner"];
        stand.bekannt = ["eisen", "magnesium"];
        stand.flags.schemen_frei = true;
        stand.flags.starter = "eisen";
        stand.flags.ausgeloest_stoffingen_einstieg = true;
        if (suche.get("karte")) { stand.karte = suche.get("karte"); stand.ankunft = suche.get("punkt") || null; }
      }
      // ?flags=markt_fertig,geraetepass setzt Flags für Prüfungen mitten im Kapitel
      (suche.get("flags") || "").split(",").filter(Boolean).forEach(function (fl) { stand.flags[fl] = true; });
      this.scene.start("oberwelt", { stand: stand });
      return;
    }
    this.scene.start("titel");
  }
}

class TitelSzene extends Phaser.Scene {
  constructor() { super("titel"); }

  create() {
    var szene = this;
    this.hintergrund = this.add.graphics();
    this.titel = this.add.text(0, 0, "ELEMENTIA", {
      fontFamily: SCHRIFT.titel, fontSize: MASS.px(56) + "px", color: "#f4ead5",
      stroke: "#2b1d10", strokeThickness: MASS.px(4)
    }).setOrigin(0.5);
    this.untertitel = this.add.text(0, 0, "Die Feuerlande · Kapitel 1 (Probefassung)", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(18) + "px", color: "#c9a66b"
    }).setOrigin(0.5);

    this.knoepfe = [];
    if (SPIELSTAND.vorhanden()) {
      this.knoepfe.push(baueKnopf(this, "Weiterspielen", function () {
        szene.starte(SPIELSTAND.laden());
      }, { mindestbreite: 240 }));
    }
    this.knoepfe.push(baueKnopf(this, "Neues Spiel", function () {
      if (SPIELSTAND.vorhanden() && !window.confirm("Ein neues Spiel beginnen? Der gespeicherte Stand wird beim nächsten Speichern überschrieben.")) return;
      szene.starte(SPIELSTAND.neu());
    }, { mindestbreite: 240 }));
    this.knoepfe.push(baueKnopf(this, "Spielstand-Code eingeben", function () {
      var code = window.prompt("Spielstand-Code einfügen (beginnt mit EA1-):");
      if (!code) return;
      try {
        var stand = SPIELSTAND.ausCode(code);
        SPIELSTAND.speichern(stand);
        szene.starte(stand);
      } catch (e) {
        window.alert(e.message);
      }
    }, { mindestbreite: 240, schrift: 15, hoehe: 40 }));

    this.anordnen();
    this.scale.on("resize", this.anordnen, this);
    this.events.once("shutdown", function () { szene.scale.off("resize", szene.anordnen, szene); });
  }

  anordnen() {
    var b = this.scale.width, h = this.scale.height;
    this.hintergrund.clear();
    this.hintergrund.fillGradientStyle(0x2b1d10, 0x2b1d10, 0x101418, 0x101418, 1);
    this.hintergrund.fillRect(0, 0, b, h);
    this.titel.setPosition(b / 2, h * 0.26);
    this.untertitel.setPosition(b / 2, h * 0.26 + MASS.px(48));
    var y = h * 0.26 + MASS.px(110);
    this.knoepfe.forEach(function (k) {
      k.setPosition(b / 2, y);
      y += k.height + MASS.px(12);
    });
  }

  starte(stand) {
    this.scene.start("oberwelt", { stand: stand });
  }
}
