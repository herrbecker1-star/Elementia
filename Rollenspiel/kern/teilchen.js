// ============================================================
//  TEILCHEN – die Minispiele der Teilchin-Quest (seit Fassung 26)
//
//  Nur die Logik, ohne Grafik – damit der Prüfstand sie spielen kann.
//  Die Szene dazu steht in spiel\teilchen.js.
//
//  1. Teilchenkisten: drei Bilder (dicht und geordnet, dicht und
//     durcheinander, weit und schnell) in die Kästen fest, flüssig,
//     gasförmig legen. Ein Fehler gibt einen Hinweis, keine Sackgasse.
//  2. Duftspur: zwei Gläser, kalt und warm, je ein Tropfen Tinte. Wo
//     verteilt sich die Farbe schneller? (Blickpunkt Chemie 7/8, S. 18)
// ============================================================

var TEILCHEN = (function () {
  "use strict";

  var KISTEN = [
    { id: "fest",     name: "fest",     bild: "geordnet",
      hinweis: "Im Festen sitzen die Teilchen dicht an festen Plätzen. Sie zittern nur." },
    { id: "fluessig", name: "flüssig",  bild: "durcheinander",
      hinweis: "Im Flüssigen sind die Teilchen dicht, aber durcheinander. Sie gleiten aneinander vorbei." },
    { id: "gas",      name: "gasförmig", bild: "weit",
      hinweis: "Im Gas sind die Teilchen weit voneinander entfernt und fliegen schnell umher." }
  ];
  var BILDER = ["geordnet", "durcheinander", "weit"];
  // Derselbe Satz steht als TEILCHEN_MERKSATZ in daten\dialoge.js (wird vorher geladen).
  var MERKSATZ = typeof TEILCHEN_MERKSATZ === "string" ? TEILCHEN_MERKSATZ : "Alle Stoffe bestehen aus kleinsten Teilchen, die sich ständig bewegen.";

  function kiste(id) { return KISTEN.filter(function (k) { return k.id === id; })[0]; }

  // Die Reihenfolge der Bilder unten wird gemischt (zufall: 0 … 1).
  function neuKisten(zufall) {
    var offen = BILDER.slice();
    for (var i = offen.length - 1; i > 0; i--) {
      var j = Math.floor((zufall ? zufall() : Math.random()) * (i + 1)), t = offen[i];
      offen[i] = offen[j]; offen[j] = t;
    }
    return { offen: offen, gelegt: {}, fehler: 0, fertig: false };
  }

  // Ein Bild in einen Kasten legen. Liefert { richtig, text }.
  function lege(z, bild, kistenId) {
    var k = kiste(kistenId);
    if (z.offen.indexOf(bild) < 0 || z.gelegt[kistenId]) return { richtig: false, text: "" };
    if (k.bild !== bild) {
      z.fehler++;
      return { richtig: false, text: "Noch nicht. " + k.hinweis };
    }
    z.gelegt[kistenId] = bild;
    z.offen.splice(z.offen.indexOf(bild), 1);
    z.fertig = z.offen.length === 0;
    return { richtig: true, text: z.fertig ? "Alle drei richtig! " + MERKSATZ : "Richtig – " + k.name + "." };
  }

  // Duftspur: Welches Glas ist warm? links oder rechts, zufällig.
  function neuDuft(zufall) {
    return { warm: (zufall ? zufall() : Math.random()) < 0.5 ? "links" : "rechts", versuche: 0, fertig: false };
  }

  function waehle(d, seite) {
    d.versuche++;
    if (seite === d.warm) {
      d.fertig = true;
      return { richtig: true, text: "Genau. Im warmen Wasser bewegen sich die Teilchen schneller – die Farbe ist schon überall. Mit dem Brotduft ist es genauso." };
    }
    return { richtig: false, text: "Schau noch einmal hin: In welchem Glas hat sich die Farbe schon weiter verteilt?" };
  }

  // Die vier Stationen im Dorf (Zustandsänderungen): Szene → Vorgang
  var VORGAENGE = ["schmelzen", "erstarren", "verdunsten", "kondensieren"];

  return {
    KISTEN: KISTEN, BILDER: BILDER, MERKSATZ: MERKSATZ, VORGAENGE: VORGAENGE,
    kiste: kiste, neuKisten: neuKisten, lege: lege, neuDuft: neuDuft, waehle: waehle
  };
})();
