// ============================================================
//  OBERWELT – Karte, Laufen, Ansprechen
//
//  Die Eingabe (Stick, Knöpfe, Tastatur) liegt ganz in der
//  UI-Szene. Die Oberwelt fragt sie nur ab. So gibt es genau eine
//  Stelle, die weiß, ob gerade ein Dialog läuft.
// ============================================================

var TEMPO = 110;          // Weltpixel je Sekunde, gut drei Kacheln
var REICHWEITE = 22;      // wie nah man jemandem gegenüberstehen muss

class OberweltSzene extends Phaser.Scene {
  constructor() { super("oberwelt"); }

  create(daten) {
    var szene = this;
    this.stand = daten.stand;

    // ---------- Karte ----------
    var karte = this.make.tilemap({ key: this.stand.karte });
    var satz = karte.addTilesetImage("platzhalter", "kacheln");
    karte.createLayer("boden", satz);
    this.hindernisse = karte.createLayer("hindernisse", satz);
    this.hindernisse.setCollisionByExclusion([-1]);
    this.karte = karte;
    this.physics.world.setBounds(0, 0, karte.widthInPixels, karte.heightInPixels);

    // ---------- Figuren und Dinge zum Ansprechen ----------
    this.ansprechbar = [];
    this.personen = this.physics.add.staticGroup();
    var start = { x: karte.widthInPixels / 2, y: karte.heightInPixels / 2 };

    karte.getObjectLayer("objekte").objects.forEach(function (o) {
      var eig = {};
      (o.properties || []).forEach(function (p) { eig[p.name] = p.value; });
      if (o.name === "start") { start = { x: o.x, y: o.y }; return; }

      var eintrag = { name: o.name, x: o.x, y: o.y, dialog: eig.dialog, figur: null };
      if (eig.figur !== undefined) {
        var spr = szene.personen.create(o.x, o.y, "figuren", eig.figur * 8 + richtungsSpalte(eig.richtung));
        spr.body.setSize(20, 12, false).setOffset(6, 19);
        spr.setDepth(o.y);
        eintrag.figur = spr;
        eintrag.figurNr = eig.figur;
      } else if (o.name === "schild") {
        var schild = szene.personen.create(o.x, o.y, szene.schildTextur());
        schild.body.setSize(20, 12, false).setOffset(6, 19);
        schild.setDepth(o.y);
      }
      szene.ansprechbar.push(eintrag);
    });

    // ---------- Spielfigur ----------
    var x = this.stand.x !== null ? this.stand.x : start.x;
    var y = this.stand.y !== null ? this.stand.y : start.y;
    this.held = this.physics.add.sprite(x, y, "figuren", richtungsSpalte(this.stand.richtung));
    this.held.body.setSize(16, 10).setOffset(8, 21);
    this.held.setCollideWorldBounds(true);
    this.richtung = this.stand.richtung;
    this.physics.add.collider(this.held, this.hindernisse);
    this.physics.add.collider(this.held, this.personen);

    // ---------- Kamera ----------
    var kamera = this.cameras.main;
    kamera.setBounds(0, 0, karte.widthInPixels, karte.heightInPixels);
    kamera.startFollow(this.held, true);
    kamera.setRoundPixels(true);
    this.zoomAnpassen();
    this.scale.on("resize", this.zoomAnpassen, this);

    // ---------- Oberfläche darüber ----------
    this.scene.launch("ui", { oberwelt: this });
    this.ui = this.scene.get("ui");

    // Wer das Handy weglegt oder die App wechselt, verliert nichts.
    this.beimVerstecken = function () {
      if (document.visibilityState === "hidden") szene.speichern();
    };
    document.addEventListener("visibilitychange", this.beimVerstecken);

    this.events.once("shutdown", function () {
      szene.scale.off("resize", szene.zoomAnpassen, szene);
      document.removeEventListener("visibilitychange", szene.beimVerstecken);
      szene.scene.stop("ui");
    });
  }

  zoomAnpassen() {
    this.cameras.main.setZoom(MASS.weltZoom(this.scale.width, this.scale.height));
  }

  schildTextur() {
    if (!this.textures.exists("schild")) {
      var g = this.make.graphics({ add: false });
      g.fillStyle(0x6e4626).fillRect(14, 16, 4, 14);
      g.fillStyle(0xa07848).fillRect(4, 6, 24, 12);
      g.fillStyle(0x6e4626).fillRect(6, 9, 20, 1).fillRect(6, 13, 16, 1);
      g.generateTexture("schild", 32, 32);
      g.destroy();
    }
    return "schild";
  }

  // ---------- Spielstand ----------
  speichern() {
    this.stand.x = Math.round(this.held.x);
    this.stand.y = Math.round(this.held.y);
    this.stand.richtung = this.richtung;
    return SPIELSTAND.speichern(this.stand);
  }

  // ---------- Ansprechen ----------
  gegenueber() {
    var v = richtungsVektor(this.richtung);
    var px = this.held.x + v.x * 20;
    var py = this.held.y + 4 + v.y * 20;
    var bestes = null, abstand = REICHWEITE;
    this.ansprechbar.forEach(function (e) {
      var d = Phaser.Math.Distance.Between(px, py, e.x, e.y);
      if (d < abstand) { abstand = d; bestes = e; }
    });
    return bestes;
  }

  ansprechen(ziel) {
    var ablauf = DIALOGE[ziel.dialog];
    if (!ablauf) return;
    if (ziel.figur) {
      // Wer angesprochen wird, dreht sich zum Sprechenden.
      var gegen = { unten: "oben", oben: "unten", links: "rechts", rechts: "links" }[this.richtung];
      ziel.figur.setFrame(ziel.figurNr * 8 + richtungsSpalte(gegen));
    }
    this.ui.dialogFuehren(ablauf, this.stand.flags);
  }

  update() {
    var held = this.held;
    held.setDepth(held.y);

    // Die UI-Szene startet parallel und ist im ersten Takt noch nicht fertig.
    if (!this.ui.eingabe) return;

    if (this.ui.dialogAktiv || this.ui.menueOffen) {
      held.setVelocity(0, 0);
      held.anims.stop();
      held.setFrame(richtungsSpalte(this.richtung));
      return;
    }

    var e = this.ui.eingabe;
    var betrag = Math.min(1, Math.hypot(e.x, e.y));
    if (betrag > 0.15) {
      var winkel = Math.atan2(e.y, e.x);
      held.setVelocity(Math.cos(winkel) * TEMPO * betrag, Math.sin(winkel) * TEMPO * betrag);
      this.richtung = Math.abs(e.x) > Math.abs(e.y) ? (e.x > 0 ? "rechts" : "links") : (e.y > 0 ? "unten" : "oben");
      held.anims.play("gehen-0-" + this.richtung, true);
    } else {
      held.setVelocity(0, 0);
      held.anims.stop();
      held.setFrame(richtungsSpalte(this.richtung));
    }

    // Ostausgang: Der Kolbenwald folgt in M3.
    if (held.x > this.karte.widthInPixels - 20) {
      held.x -= 24;
      this.ui.dialogFuehren([{ erzaehl: "Hier beginnt der Weg in den Kolbenwald. In dieser Probefassung endet die Welt noch an diesem Zaunpfahl." }], this.stand.flags);
      return;
    }

    var ziel = this.gegenueber();
    this.ui.zeigeAktion(ziel ? (ziel.figur ? "Sprechen" : "Ansehen") : "");
    if (this.ui.aktionAbholen() && ziel) this.ansprechen(ziel);
  }
}

function richtungsSpalte(richtung) {
  return { unten: 0, links: 2, rechts: 4, oben: 6 }[richtung] || 0;
}

function richtungsVektor(richtung) {
  return { unten: { x: 0, y: 1 }, oben: { x: 0, y: -1 }, links: { x: -1, y: 0 }, rechts: { x: 1, y: 0 } }[richtung];
}
