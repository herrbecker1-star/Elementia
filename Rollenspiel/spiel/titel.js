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
    this.load.tilemapTiledJSON("stoffingen", "karten/stoffingen.json");
  }

  create() {
    // Laufbilder je Figur: Zeile r, Spalten unten/links/rechts/oben × 2.
    var anims = this.anims;
    for (var r = 0; r < 5; r++) {
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
    if (suche.get("direkt") === "1" || suche.get("dialog")) {
      this.scene.start("oberwelt", { stand: SPIELSTAND.neu() });
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
    this.untertitel = this.add.text(0, 0, "Die Feuerlande · Technikprobe", {
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
