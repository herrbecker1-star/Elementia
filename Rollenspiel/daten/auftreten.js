// ============================================================
//  AUFTRITTSTABELLEN UND FUNDHINWEISE
//
//  Je Karte eine Tabelle (Format siehe kern\auftreten.js). Die
//  Gegenden stehen in der Karte als Rechtecke der Ebene „gebiete“
//  mit der Eigenschaft „biom“; alles andere ist „wiese“.
//
//  Chemisch begründet, wo es geht:
//   · Kohlenstoff am Meiler, bei Nacht – wenn die Glut im Dunkeln leuchtet.
//   · Schwefel an der warmen Quelle, bei Nebel oder Hitze, morgens
//     und abends – Schwefelquellen dampfen, wenn die Luft kühl ist.
//   · Magnesium im Garten, bei Tag – Mutter: „In jeder grünen
//     Pflanze steckt Magnesium.“ (Kapitel 1)
//   · Eisen an der Schmiede, solange die Esse brennt.
//   · Kupfer selten und nur abseits der Wege, bei klarem Wetter –
//     gediegenes Kupfer findet man nicht am Wegrand.
// ============================================================

var AUFTRITTE = {
  stoffingen: [
    { art: "zink",        stufe: [2, 4], gewicht: 5, biome: ["wiese", "hain"] },
    { art: "eisen",       stufe: [2, 3], gewicht: 4, biome: ["schmiede"], zeit: ["morgen", "tag"] },
    { art: "magnesium",   stufe: [2, 3], gewicht: 4, biome: ["garten"], zeit: ["morgen", "tag"], wetter: ["klar", "hitze"] },
    { art: "kohlenstoff", stufe: [3, 5], gewicht: 5, biome: ["meiler"], zeit: ["abend", "nacht"] },
    { art: "kohlenstoff", stufe: [3, 4], gewicht: 1, biome: ["wiese", "hain"], nurAbseits: true },
    { art: "schwefel",    stufe: [4, 6], gewicht: 3, biome: ["quelle"], zeit: ["morgen", "abend"], wetter: ["nebel", "hitze"] },
    { art: "kupfer",      stufe: [4, 6], gewicht: 2, biome: ["wiese", "hain"], nurAbseits: true, wetter: ["klar"], zeit: ["tag"] }
  ],

  // Der Kolbenwald: feucht und dunkel. Kupfer ist hier öfter – die
  // Gerätemacher-Gilde verarbeitet es, Reste liegen im Unterholz.
  // Am Bach warme Stellen: Schwefel, wie an der Quelle von Stoffingen.
  kolbenwald: [
    { art: "zink",        stufe: [3, 5], gewicht: 4, biome: ["wald"] },
    { art: "kohlenstoff", stufe: [3, 5], gewicht: 3, biome: ["wald"], zeit: ["abend", "nacht"] },
    { art: "kupfer",      stufe: [4, 6], gewicht: 2, biome: ["wald"], nurAbseits: true },
    { art: "eisen",       stufe: [3, 5], gewicht: 1, biome: ["wald"], nurAbseits: true },
    { art: "schwefel",    stufe: [4, 6], gewicht: 3, biome: ["quelle"], zeit: ["morgen", "abend"], wetter: ["nebel", "hitze"] }
  ],

  // In Brenner selbst erscheinen keine – eine Stadt voller Flammenwächter.
  brenner: []
};

// Was das Stoffbuch verrät. „vage“ steht da, solange man die Art nicht
// kennt – aus Großmutters Buch, in ihrer Sprache. „genau“ danach.
var FUNDHINWEISE = {
  eisen:       { vage: "„Wo der Hammer singt, springen Funken, die Augen haben.“",
                 genau: "An der Schmiede, morgens und tagsüber, solange die Esse brennt." },
  magnesium:   { vage: "„Im Grün des Gartens schläft ein Licht, heller als hundert Kerzen.“",
                 genau: "Im Garten, bei Tag und klarem oder heißem Wetter." },
  kohlenstoff: { vage: "„Was im Meiler schwarz wird, wacht auf, wenn es dunkel ist.“",
                 genau: "Am Meiler, abends und nachts. Selten auch abseits der Wege." },
  zink:        { vage: "„Auf offenem Feld grasen die Stillen mit den bläulichen Platten.“",
                 genau: "Auf Wiesen und im Hain, zu jeder Zeit." },
  schwefel:    { vage: "„Wo das Wasser warm ist und nach faulen Eiern riecht – aber nicht zu jeder Stunde.“",
                 genau: "An der warmen Quelle, morgens und abends, bei Nebel oder Hitze." },
  kupfer:      { vage: "„Das rote Metall meidet die Wege. Es zeigt sich nur der Sonne.“",
                 genau: "Abseits der Wege, tagsüber bei klarem Wetter. Selten." }
};
