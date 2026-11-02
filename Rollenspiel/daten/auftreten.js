// ============================================================
//  AUFTRITTSTABELLEN UND FUNDHINWEISE
//
//  Je Karte eine Tabelle (Format siehe kern\auftreten.js). Die
//  Gegenden stehen in der Karte als Rechtecke der Ebene „gebiete“
//  mit der Eigenschaft „biom“; alles andere ist „wiese“.
//
//  Chemisch begründet, wo es geht:
//   · Kohlenstoff am Meiler – nachts leuchtet dort die Glut. Holzkohle-
//     reste liegen auch auf Wiese, Hain und im Wald.
//   · Schwefel an der warmen Quelle, seit Fassung 22 zu jeder Zeit; bei
//     Nebel oder Hitze, morgens und abends noch häufiger – Schwefel-
//     quellen dampfen, wenn die Luft kühl ist.
//   · Bor an warmen Quellen: Borsäure tritt in heißen Quellen aus.
//   · Silicium (seit Fassung 21) im Sand: auf Wiese, Hain und im Wald.
//   · Magnesium im Garten, bei Tag – Mutter: „In jeder grünen
//     Pflanze steckt Magnesium.“ (Kapitel 1)
//   · Eisen an der Schmiede, solange die Esse brennt.
//   · Kupfer und Aluminium sind seit Fassung 17 in den Feuerlanden
//     nicht wild – sie kämpfen für Gildenmeisterin Ilka.
//
//  Fassung 21 (Handytest: „zu viel Zink“): Auf der Wiese, die fast ganz
//  Stoffingen ausmacht, gab es nur Zink. Jetzt teilen sich Zink,
//  Kohlenstoff und Silicium die Wiese; Bor braucht keinen Nebel mehr.
// ============================================================

var AUFTRITTE = {
  stoffingen: [
    { art: "zink",        stufe: [2, 4], gewicht: 3, biome: ["wiese", "hain"] },
    { art: "kohlenstoff", stufe: [2, 4], gewicht: 3, biome: ["wiese", "hain"] },
    { art: "silicium",    stufe: [3, 4], gewicht: 2, biome: ["wiese", "hain"] },
    { art: "eisen",       stufe: [2, 3], gewicht: 4, biome: ["schmiede"], zeit: ["morgen", "tag"] },
    { art: "magnesium",   stufe: [2, 3], gewicht: 4, biome: ["garten"], zeit: ["morgen", "tag"], wetter: ["klar", "hitze"] },
    { art: "kohlenstoff", stufe: [3, 5], gewicht: 6, biome: ["meiler"] },
    { art: "schwefel",    stufe: [4, 6], gewicht: 4, biome: ["quelle"] },
    { art: "schwefel",    stufe: [4, 6], gewicht: 3, biome: ["quelle"], zeit: ["morgen", "abend"], wetter: ["nebel", "hitze"] },
    { art: "bor",         stufe: [4, 5], gewicht: 2, biome: ["quelle"] }
    // Seit Fassung 17 nicht mehr wild: Kupfer und Aluminium. Man sieht sie
    // bei Gildenmeisterin Ilka; fangbar sind sie erst in den Clans der
    // Erzhügel (Entscheidung des Autors, 29.10.2026).
  ],

  // Der Kolbenwald: feucht und dunkel. Am Bach warme Stellen: Schwefel,
  // wie an der Quelle von Stoffingen.
  kolbenwald: [
    { art: "zink",        stufe: [3, 5], gewicht: 2, biome: ["wald"] },
    { art: "kohlenstoff", stufe: [3, 5], gewicht: 3, biome: ["wald"] },
    { art: "kohlenstoff", stufe: [3, 5], gewicht: 3, biome: ["wald"], zeit: ["abend", "nacht"] },
    { art: "silicium",    stufe: [3, 5], gewicht: 3, biome: ["wald"] },
    { art: "bor",         stufe: [4, 6], gewicht: 1, biome: ["wald"] },
    { art: "eisen",       stufe: [3, 5], gewicht: 2, biome: ["wald"], nurAbseits: true },
    { art: "schwefel",    stufe: [4, 6], gewicht: 4, biome: ["quelle"] },
    { art: "schwefel",    stufe: [4, 6], gewicht: 3, biome: ["quelle"], zeit: ["morgen", "abend"], wetter: ["nebel", "hitze"] },
    // Seit Fassung 13: Bor an der warmen Quelle – Borsäure tritt in heißen
    // Quellen aus (die Dampfquellen der Toskana). Seit Fassung 21 bei
    // jedem Wetter, im Nebel noch häufiger.
    { art: "bor",         stufe: [4, 6], gewicht: 4, biome: ["quelle"] },
    { art: "bor",         stufe: [4, 6], gewicht: 2, biome: ["quelle"], wetter: ["nebel"] }
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
  kohlenstoff: { vage: "„Was im Meiler schwarz wird, wacht auf – und wandert bis in den Wald.“",
                 genau: "Am Meiler am häufigsten. Auch auf Wiesen, im Hain und im Kolbenwald, dort nachts öfter." },
  zink:        { vage: "„Auf offenem Feld grasen die Stillen mit den bläulichen Platten.“",
                 genau: "Auf Wiesen und im Hain, zu jeder Zeit." },
  schwefel:    { vage: "„Wo das Wasser warm ist und nach faulen Eiern riecht – aber nicht zu jeder Stunde.“",
                 genau: "An den warmen Quellen in Stoffingen und im Kolbenwald. Morgens und abends bei Nebel oder Hitze am häufigsten." },
  // Seit Fassung 17: nur bei Ilka zu sehen, fangbar in den Erzhügeln
  kupfer:      { vage: "„Das rote Metall dient der Gilde der Flammen. Frei begegnet es dir erst bei den Clans der Erzhügel.“",
                 genau: "Gildenmeisterin Ilka kämpft damit. Wild erst bei den Clans der Erzhügel." },
  aluminium:   { vage: "„Ein Silberner, den kein Feuer frisst, hütet die Halle der Flammenwächter.“",
                 genau: "Gildenmeisterin Ilka kämpft damit. Wild erst bei den Clans der Erzhügel." },
  bor:         { vage: "„Wo warme Quellen dampfen, glänzt etwas Schwarzes, das grün brennt.“",
                 genau: "An den warmen Quellen in Stoffingen und im Kolbenwald, im Nebel öfter. Selten auch im Wald." },
  silicium:    { vage: "„Wo Sand durch die Wurzeln rieselt, glitzert ein Grauer, der wie Metall aussieht und doch zerspringt.“",
                 genau: "Auf Wiesen und im Hain von Stoffingen, häufiger im Kolbenwald. Abseits der Wege öfter." }
};
