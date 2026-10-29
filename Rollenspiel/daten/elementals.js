// ============================================================
//  ELEMENTALS – Stoffdaten, Steckbriefe, Reaktionen (Kapitel 1)
//
//  Eigene Daten des Rollenspiels, NICHT aus Karten\karten-daten.js:
//  Das Kartenspiel rechnet mit festen Lebenspunkten, hier entstehen
//  die Werte aus echten Stoffeigenschaften (siehe kern\kampf.js,
//  Funktion grundwerte). Wer eine Zahl ändern will, ändert den
//  Stoffwert – und der muss dann im Lehrbuch stimmen.
//
//  gruppe         Hauptgruppe oder Stoffklasse (GRUPPEN unten)
//                 → Angriff, Verteidigung, Sp.-Angriff, Sp.-Verteidigung
//  klasse         Stoffklasse für die Typtabelle (daten\typen.js)
//  stoff.haerte   Mohshärte                        → Verteidigung ±
//  stoff.dichte   g/cm³                            → Tempo (leicht = schnell)
//  stoff.schmelz  Schmelz-/Sublimationstemp. in °C → LP
//  ausnahmen      Abweichung von der Typtabelle, mit Begründung
//  steckbrief     was man mit Lupe, Magnet, Stromkreis und Hammer
//                 herausfindet (Quest 1, Maras Stoffkisten)
//  form           "stueck" | "pulver"
//  fangbarAb      (seit Fassung 17) Region, ab der die Art wild vorkommt.
//                 Bis dahin sieht man sie nur bei Stoffmeistern und Bossen.
//  heftig         (seit Fassung 17) Satz, warum der Stoff heftig reagiert:
//                 Entwischt er, zerspringen Reagenzglas und Erlenmeyerkolben
//                 (kern\fangen.js). In Kapitel 1 trägt das noch keine Art –
//                 Natrium und Kalium in Periodika werden die ersten.
//
//  Quellen: Tafelwerk / Blickpunkt Chemie 7/8, S. 16–17.
// ============================================================

var ARTEN = {

  eisen: {
    name: "Eisen", formel: "Fe", klasse: "Metall", gruppe: "nebengruppe", bild: "eisen", seltenheit: "haeufig",
    beschreibung: "Graues, hartes Metall. Der Magnet hält es fest. An feuchter Luft rostet es. Aus Eisen schmiedet man Werkzeuge.",
    stoff: { haerte: 4, dichte: 7.87, schmelz: 1538 },
    steckbrief: { farbe: "grau", glanz: true, magnetisch: true, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["blankhieb", "funkenflug", "standfest"]
  },

  magnesium: {
    name: "Magnesium", formel: "Mg", klasse: "Metall", gruppe: "hg2", bild: "magnesium", seltenheit: "haeufig",
    beschreibung: "Leichtes, silbriges Metall. Es verbrennt mit gleißend hellem Licht. In jeder grünen Pflanze steckt etwas Magnesium.",
    stoff: { haerte: 2.5, dichte: 1.74, schmelz: 650 },
    steckbrief: { farbe: "silbrig", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: true },
    form: "stueck",
    reaktionen: ["hammerschlag", "aufflammen", "standfest"]
  },

  kohlenstoff: {
    // Holzkohle aus dem Meiler. Leitet den Strom – als einziges
    // Nichtmetall in Maras Kisten. Genau diese Ausnahme macht den
    // Steckbrief lehrreich: Leitfähigkeit allein heißt nicht Metall.
    name: "Kohlenstoff", formel: "C", klasse: "Nichtmetall", gruppe: "hg4", bild: "kohlenstoff", seltenheit: "haeufig", brennbar: true,
    ausnahmen: { waerme: { faktor: 2, wort: "Grafit leitet", merksatz: 7 } },
    beschreibung: "Schwarze, leichte Holzkohle. Leitet den Strom und ist trotzdem kein Metall. Verbrennt zu Kohlenstoffdioxid.",
    stoff: { haerte: 1.5, dichte: 2.26, schmelz: 3640 },   // Grafit, sublimiert
    steckbrief: { farbe: "schwarz", glanz: false, magnetisch: false, leitfaehig: true, verformbar: false, brennt: true },
    form: "stueck",
    reaktionen: ["glut", "russwolke", "kohlenstaub"]
  },

  kupfer: {
    // Seit Fassung 17: in den Feuerlanden nur bei Gildenmeisterin Ilka,
    // fangbar erst in den Clans der Erzhügel (Elementals je Region).
    name: "Kupfer", formel: "Cu", klasse: "Metall", gruppe: "nebengruppe", bild: "kupfer", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    beschreibung: "Rötliches, weiches Metall. Leitet Strom und Wärme besser als fast alle Stoffe – darum sind Kabel aus Kupfer.",
    stoff: { haerte: 3, dichte: 8.96, schmelz: 1085 },
    steckbrief: { farbe: "rötlich", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["blankhieb", "waermeleitung", "anlaufen"]
  },

  zink: {
    // Bei Raumtemperatur spröde; gut verformbar erst zwischen 100 und
    // 150 °C. Darum hier "verformbar: false" – und gegen Schlag die
    // Ausnahme ×1 statt ×½, solange das Feld kälter als Wärme 50 ist.
    // Seit Fassung 12 Wärmeleitung statt „Sulfid bilden“ (Zink leitet gut).
    // Mit Funkenflug gewann Zink 83 % (doppelt mit Eisen und schneller),
    // ohne speziellen Angriff 23 % (gegen Metalle wirkt Schlag nur halb).
    name: "Zink", formel: "Zn", klasse: "Metall", gruppe: "nebengruppe", bild: "zink", seltenheit: "haeufig",
    ausnahmen: { schlag: { faktor: 1, wort: "kalt spröde", merksatz: 1, bisWaerme: 50 } },
    beschreibung: "Bläulich-graues Metall. Kalt spröde, warm formbar. Als dünne Schicht schützt es Eisen vor Rost (verzinken).",
    stoff: { haerte: 2.5, dichte: 7.14, schmelz: 420 },
    steckbrief: { farbe: "bläulich-grau", glanz: true, magnetisch: false, leitfaehig: true, verformbar: false, brennt: false },
    warmVerformbar: true,
    form: "stueck",
    reaktionen: ["wuchtstoss", "waermeleitung", "zinkschild"]
  },

  schwefel: {
    name: "Schwefel", formel: "S", klasse: "Nichtmetall", gruppe: "hg6", bild: "schwefel", seltenheit: "selten", brennbar: true,
    beschreibung: "Gelbes Pulver, leitet keinen Strom. Schmilzt schon bei 115 °C und brennt mit blauer Flamme zu stechendem Schwefeldioxid.",
    stoff: { haerte: 2, dichte: 2.07, schmelz: 115 },
    steckbrief: { farbe: "gelb", glanz: false, magnetisch: false, leitfaehig: false, verformbar: false, brennt: true },
    form: "pulver",
    reaktionen: ["blaue_flamme", "sulfurierung", "leichtschlag"]
  },

  // Seit Fassung 13. Sieht aus wie Magnesium (silbrig, glänzt, leitet,
  // biegsam) – erst die Flammprobe trennt beide: Magnesium brennt grell,
  // Aluminiumblech nicht, weil eine dünne Oxidhaut es schützt. Dieselbe
  // Oxidhaut macht es im Kampf feuerfest (Ausnahme Feuer ×1) – darum ist
  // es der Konter gegen Schwefel: Schlag ×2, und Schwefels Flamme prallt ab.
  aluminium: {
    // Seit Fassung 17 wie Kupfer: Ilkas Elemental, fangbar ab den Erzhügeln.
    name: "Aluminium", formel: "Al", klasse: "Metall", gruppe: "hg3", bild: "aluminium", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    ausnahmen: { feuer: { faktor: 1, wort: "Oxidhaut", merksatz: 2 }, reaktion: { faktor: 1, wort: "Oxidhaut", merksatz: 2 } },
    beschreibung: "Leichtes, silberweißes Metall. Eine dünne Oxidhaut schützt es, darum rostet es nicht. Aus Aluminium sind Folie und Dosen.",
    stoff: { haerte: 2.75, dichte: 2.70, schmelz: 660 },
    steckbrief: { farbe: "silberweiß", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["hammerschlag", "funkenflug", "anlaufen"]
  },

  // Seit Fassung 13. Halbmetall, hier bei den Nichtmetallen: glänzt
  // schwarz wie ein Metall, leitet aber nicht und splittert – das
  // Gegenstück zum Kohlenstoff, der nicht glänzt und doch leitet.
  // Fast so hart wie Diamant (Mohs 9,3); die Härte zählt höchstens +20.
  bor: {
    name: "Bor", formel: "B", klasse: "Nichtmetall", gruppe: "hg3", bild: "bor", seltenheit: "selten",
    beschreibung: "Schwarz glänzende, sehr harte Kristalle. Leitet kaum Strom. Bor färbt Flammen grün; Borsäure kommt aus heißen Quellen.",
    stoff: { haerte: 9.3, dichte: 2.34, schmelz: 2076 },
    steckbrief: { farbe: "schwarz", glanz: true, magnetisch: false, leitfaehig: false, verformbar: false, brennt: true },
    form: "stueck",
    reaktionen: ["leichtschlag", "gruene_flamme", "standfest"]
  }
};

// ------------------------------------------------------------
//  Grundwerte je Gruppe (seit Fassung 12)
//  Elemente einer Hauptgruppe kämpfen ähnlich; der Stoff gibt den
//  Feinschliff (Härte → Verteidigung, Dichte → Tempo, Schmelzpunkt
//  → LP; siehe KAMPF.grundwerte). Skala wie Basiswerte im Spiel der
//  1. Generation. Faustregel: Die vier Werte ergeben zusammen etwa
//  250–310; wer weniger hat, gleicht über Tempo oder LP aus.
//  Die Gruppen der Elemente aus Kapitel 1 (hg2, hg3, hg4, hg6, nebengruppe)
//  sind gemessen (27.10.2026, siehe LIESMICH.md), die übrigen vorläufig.
// ------------------------------------------------------------
var GRUPPEN = {
  hg1:         { name: "1. Hauptgruppe",  kurz: "Alkalimetall",    angriff: 60, verteidigung: 35,  spAngriff: 110, spVerteidigung: 40 },
  hg2:         { name: "2. Hauptgruppe",  kurz: "Erdalkalimetall", angriff: 80, verteidigung: 55,  spAngriff: 90,  spVerteidigung: 75 },
  hg3:         { name: "3. Hauptgruppe",  kurz: "Borgruppe",       angriff: 65, verteidigung: 60,  spAngriff: 65,  spVerteidigung: 55 },
  hg4:         { name: "4. Hauptgruppe",  kurz: "Kohlenstoffgr.",  angriff: 60, verteidigung: 70,  spAngriff: 70,  spVerteidigung: 60 },
  hg5:         { name: "5. Hauptgruppe",  kurz: "Stickstoffgr.",   angriff: 50, verteidigung: 60,  spAngriff: 100, spVerteidigung: 70 },
  hg6:         { name: "6. Hauptgruppe",  kurz: "Chalkogen",       angriff: 45, verteidigung: 55,  spAngriff: 85,  spVerteidigung: 80 },
  hg7:         { name: "7. Hauptgruppe",  kurz: "Halogen",         angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  hg8:         { name: "8. Hauptgruppe",  kurz: "Edelgas",         angriff: 30, verteidigung: 110, spAngriff: 50,  spVerteidigung: 110 },
  nebengruppe: { name: "Nebengruppe",     kurz: "Übergangsmetall", angriff: 85, verteidigung: 85,  spAngriff: 65,  spVerteidigung: 75 },
  legierung:   { name: "Legierung",       kurz: "Legierung",       angriff: 95, verteidigung: 100, spAngriff: 45,  spVerteidigung: 60 },
  oxid:        { name: "Oxid",            kurz: "Oxid",            angriff: 60, verteidigung: 100, spAngriff: 50,  spVerteidigung: 80 },
  sulfid:      { name: "Sulfid",          kurz: "Sulfid",          angriff: 65, verteidigung: 80,  spAngriff: 60,  spVerteidigung: 75 },
  salz:        { name: "Salz",            kurz: "Salz",            angriff: 55, verteidigung: 90,  spAngriff: 60,  spVerteidigung: 85 },
  saeure:      { name: "Säure",           kurz: "Säure",           angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  lauge:       { name: "Lauge",           kurz: "Lauge",           angriff: 40, verteidigung: 55,  spAngriff: 105, spVerteidigung: 70 },
  molekuel:    { name: "Molekülverbindung", kurz: "Molekül",       angriff: 55, verteidigung: 65,  spAngriff: 80,  spVerteidigung: 80 }
};

// ------------------------------------------------------------
//  Reaktionen und Vorgänge
//
//  typ     Zeile der Typtabelle (daten\typen.js): "schlag" (physisch),
//          "feuer", "reaktion", "waerme" (speziell) – oder "schutz":
//          kein Schaden, nur Wirkung auf sich selbst.
//          Feuer braucht Sauerstoff im Feld und gibt Wärme ab.
//          Wärme nimmt die Wärme des Feldes: Stärke = Feldwärme.
//  staerke Stärke, Skala bis 100 (seit Fassung 12; vorher kraft = staerke/5)
//  genau   Trefferchance in % (fehlt = 100)
//  ae      Aktivierungsenergie, die der Zug kostet
//  o2      Sauerstoff, den der Zug verbraucht (und mindestens braucht)
//  waerme  Wärme, die ins Feld abgegeben wird (exotherm)
//  wirkung beim Gegner, Chance in % nach einem Treffer:
//            { blendung: 50 }    Trefferchance ×0,7 für 2 Angriffe
//            { vergiftung: 30 }  −10 % der LP je Runde, 3 Runden
//          auf sich selbst (immer): schutz, tarnung, abwehrPlus
//  fuer    wer den Angriff ausführen und später lernen kann (seit
//          25.10.2026, siehe kannAngriff unten):
//            {}                         alle
//            { klasse: "Metall" }       eine Stoffklasse (später: "Säure" …)
//            { dichteAb: 5 }            dichte Stoffe (g/cm³)
//            { leitet: true }           gute Leiter für Strom und Wärme
//            { brennbar: true }         brennbare Stoffe (Feld brennbar an der Art)
//            { nur: "schwefel" }        spezieller Angriff einer einzigen Art
//  lernbar true: darf bei Stufe 6/8/10 gelernt werden (KAMPF.kannLernen).
//          Vorerst nur die Grundangriffe – die chemischen erst, wenn das
//          Balancing auf hohen Stufen stimmt (Messung in kern\kampf.js).
//          Angriffe sind allgemein: Name und Text beschreiben, was passiert,
//          nicht, wer es tut. Die internen Schlüssel (hammerschlag …) sind
//          älter als die Namen und bleiben wegen Spielständen und Tests.
// ------------------------------------------------------------
var REAKTIONEN = {

  // Stärken seit Fassung 12 auf der Skala bis 100: die alte Kraft ×5
  // (Schlag 10 → 50, Staubexplosion 20 → 100). Starke Schläge kosten
  // Genauigkeit statt Energie. Danach gemessen (27.10.2026, LIESMICH.md):
  // Wuchtstoß 80 → 70, Funkenflug 4 → 3 E, Blendung 50 → 30 %,
  // Schutzschicht dämpft nur noch halb (vorher 0,2: Zink gewann 78 %).
  hammerschlag: { name: "Schlag", typ: "schlag", staerke: 50, ae: 1, fuer: {}, lernbar: true,
    text: "Harter Schlag mit voller Wucht." },
  leichtschlag: { name: "Rempler", typ: "schlag", staerke: 35, ae: 0, fuer: {}, lernbar: true,
    text: "Schneller, leichter Stoß." },
  blankhieb: { name: "Schwerer Schlag", typ: "schlag", staerke: 65, genau: 95, ae: 1, fuer: { dichteAb: 5 },
    text: "Wuchtiger Schlag – je dichter der Stoff, desto schwerer." },
  wuchtstoss: { name: "Wuchtstoß", typ: "schlag", staerke: 70, genau: 90, ae: 1, fuer: { dichteAb: 5 },
    text: "Stoß mit dem ganzen Gewicht." },

  funkenflug: { name: "Funkenflug", typ: "feuer", staerke: 70, ae: 3, o2: 8, waerme: 10, fuer: { klasse: "Metall" },
    text: "Fein verteiltes Metall verbrennt in sprühenden Funken zum Oxid." },
  aufflammen: { name: "Aufflammen", typ: "feuer", staerke: 65, ae: 4, o2: 10, waerme: 15, fuer: { nur: "magnesium" },
    wirkung: { blendung: 30 },
    text: "Verbrennt mit grellem Licht zum Oxid. Kann den Gegner blenden." },
  glut: { name: "Glut", typ: "feuer", staerke: 65, ae: 3, o2: 10, waerme: 12, fuer: { klasse: "Nichtmetall", brennbar: true },
    text: "Der Stoff glüht und verbrennt." },
  blaue_flamme: { name: "Blaue Flamme", typ: "feuer", staerke: 60, ae: 2, o2: 8, waerme: 8, fuer: { nur: "schwefel" },
    wirkung: { vergiftung: 30 },
    text: "Brennt blau zu giftigem Schwefeldioxid. Kann den Gegner vergiften." },
  // Seit Fassung 13: Bor verbrennt mit grüner Flamme zu Boroxid.
  gruene_flamme: { name: "Grüne Flamme", typ: "feuer", staerke: 65, ae: 3, o2: 10, waerme: 12, fuer: { nur: "bor" },
    text: "Verbrennt mit grüner Flamme zu Boroxid." },
  kohlenstaub: { name: "Staubexplosion", typ: "feuer", staerke: 100, genau: 85, ae: 6, o2: 15, waerme: 20, fuer: { klasse: "Nichtmetall", brennbar: true },
    text: "Feiner Staub verbrennt schlagartig." },

  // Keine Verbrennung, sondern die Reaktion mit dem Ziel selbst:
  // Schwefel bildet mit Metallen Sulfide (Fe + S → FeS, stark exotherm).
  // Mit einem Nichtmetall passiert fast nichts – das regelt die
  // Typtabelle (Reaktion: Metall ×2, Nichtmetall ×½). Bis Fassung 11
  // hieß der Angriff Sulfidbildung und hatte eigene Faktoren je Ziel;
  // „Sulfid bilden“ (Zink gegen Schwefel) ist mit Fassung 12 entfallen.
  sulfurierung: { name: "Sulfurierung", typ: "reaktion", staerke: 65, ae: 4, waerme: 12, fuer: { nur: "schwefel" },
    text: "Bildet mit dem Gegner ein Sulfid. Stark gegen Metalle." },

  waermeleitung: { name: "Wärmeleitung", typ: "waerme", staerke: 0, ae: 2, fuer: { leitet: true },
    text: "Leitet die Wärme des Feldes in den Gegner. Stärke = Wärme + 40." },

  russwolke: { name: "Rußwolke", typ: "schutz", ae: 2, fuer: { nur: "kohlenstoff" },
    wirkung: { tarnung: 1 },
    text: "Feiner Ruß verdeckt die Sicht. Der nächste Treffer wirkt nur halb." },
  standfest: { name: "Standfest", typ: "schutz", ae: 1, fuer: {}, lernbar: true,
    wirkung: { schutz: 0.5 },
    text: "Abwehrhaltung: Der nächste Treffer wirkt nur halb." },
  anlaufen: { name: "Oxidschicht", typ: "schutz", ae: 2, o2: 3, braucht: { waerme: 30 }, fuer: { klasse: "Metall" },
    wirkung: { abwehrPlus: 4 },
    text: "Oxidschicht: Verteidigung +40 % bis Kampfende. Braucht Wärme ab 30." },
  zinkschild: { name: "Schutzschicht", typ: "schutz", ae: 1, fuer: { klasse: "Metall" },
    wirkung: { schutz: 0.5, abwehrPlus: 2 },
    text: "Dichte Schicht: Der nächste Treffer wirkt nur halb, Verteidigung +20 %." }
};

// Alte Schlüssel aus Spielständen bis Fassung 11 (SPIELSTAND.pruefen)
var ALTE_ANGRIFFE = { sulfidbildung: "sulfurierung", zinksulfid: "waermeleitung" };

// Darf diese Art den Angriff ausführen (und später lernen)?
function kannAngriff(artId, angriffId) {
  var a = ARTEN[artId], f = REAKTIONEN[angriffId].fuer;
  if (!f) return false;
  if (f.nur) return f.nur === artId;
  if (f.klasse && a.klasse !== f.klasse) return false;
  if (f.dichteAb && a.stoff.dichte < f.dichteAb) return false;
  if (f.leitet && !a.steckbrief.leitfaehig) return false;
  if (f.brennbar && !a.brennbar) return false;
  return true;
}

// Wer den Angriff kann, in Worten – für die Detailansicht.
function angriffFuerText(angriffId) {
  var f = REAKTIONEN[angriffId].fuer || {};
  if (f.nur) return "nur " + ARTEN[f.nur].name;
  var t = [];
  if (f.brennbar) t.push("brennbare");
  if (f.klasse) t.push(f.klasse === "Metall" ? "Metalle" : f.klasse === "Nichtmetall" ? "Nichtmetalle" : f.klasse);
  if (f.dichteAb) t.push("dichte Stoffe");
  if (f.leitet) t.push("gute Leiter");
  return t.length ? t.join(" ") : "alle";
}

// Genauigkeit unter 100 und Nebenwirkung in Worten, z. B.
// ["Treffer 90 %", "Blendung 50 %"] – für Menü und Detailansicht.
function angriffZusatz(angriffId) {
  var r = REAKTIONEN[angriffId], w = r.wirkung || {}, t = [];
  if (r.genau && r.genau < 100) t.push("Treffer " + r.genau + " %");
  if (w.blendung) t.push("Blendung " + w.blendung + " %");
  if (w.vergiftung) t.push("Vergiftung " + w.vergiftung + " %");
  return t;
}

// ------------------------------------------------------------
//  Untersuchungswerkzeuge (Erkennen im Kampf)
// ------------------------------------------------------------
var WERKZEUGE = {
  lupe:       { name: "Lupe",       prueft: ["farbe", "glanz"] },
  magnet:     { name: "Magnet",     prueft: ["magnetisch"] },
  stromkreis: { name: "Stromkreis", prueft: ["leitfaehig"] },
  hammer:     { name: "Hammer",     prueft: ["verformbar"] },
  // Gegenstände ohne Prüfung – stehen im Gepäck, nicht im Menü „Untersuchen“
  // Seit Fassung 13 auch ein Prüfwerkzeug: die Flammprobe (Magnesium oder Aluminium?)
  // Die id „gasbrenner“ bleibt wegen der Spielstände; seit Fassung 17 heißt er Bunsenbrenner.
  gasbrenner:        { name: "Bunsenbrenner", prueft: ["brennt"], labor: true, text: "Flammprobe: Brennt der Stoff? Im Kampf einmal Energie (+4), heizt das Feld auf." },
  geraetepass:       { name: "Gerätepass des Kolbenwaldes", prueft: [], text: "Unterschrieben von Meisterin Vitra." },
  // Laborgeräte für den Abzug (seit Fassung 17). Man bekommt sie in Quests;
  // mit ihnen entstehen später Verbindungen.
  tiegelzange:       { name: "Tiegelzange", prueft: [], labor: true, text: "Greift heiße Tiegel und Schalen. Vom Köhler." },
  messzylinder:      { name: "Messzylinder", prueft: [], labor: true, text: "Misst Flüssigkeiten genau ab. Von Meisterin Vitra." }
};

// Die Geräte, die der Abzug kennt, in dieser Reihenfolge
var LABORGERAETE = ["gasbrenner", "tiegelzange", "messzylinder"];

// ------------------------------------------------------------
//  Fanggefäße der Grundstufe (seit Fassung 17) – siehe kern\fangen.js
//  faktor  Fangrate      immer  fängt in jedem Fall
//  haelt   zerspringt nicht, wenn ein heftig reagierender Stoff entwischt
//  aus     herstellbar am Labortisch aus Material (braucht den Bunsenbrenner)
// ------------------------------------------------------------
var GEFAESSE = {
  reagenzglas:      { name: "Reagenzglas",      kurz: "Reagenzglas",  faktor: 1,   rate: "×1",
                      text: "Das einfache Standardgefäß, billig und überall erhältlich." },
  erlenmeyerkolben: { name: "Erlenmeyerkolben", kurz: "Erlenmeyer",   faktor: 1.5, rate: "×1,5", aus: { glasbruch: 4 },
                      text: "Mehr Volumen, stabiler Stand, kippt nicht um." },
  rundkolben:       { name: "Rundkolben",       kurz: "Rundkolben",   faktor: 2,   rate: "×2",   aus: { glasbruch: 8 }, haelt: true,
                      text: "Hält Hitze und Druck aus." },
  quarzampulle:     { name: "Quarzampulle",     kurz: "Quarzampulle", immer: true, rate: "sicher", aus: { quarz: 1 }, haelt: true,
                      text: "Wird zugeschmolzen. Extrem selten." }
};

// Weitere Waren im Gepäck: Verbrauchsgüter (in stand.vorrat) und Material (stand.material)
var WAREN = {
  kaeltemischung: { name: "Kältemischung", vorrat: true, text: "Eis und Kochsalz kühlen bis −20 °C. Ein abgekühltes Elemental fängt man doppelt so leicht." },
  glasbruch:      { name: "Glasbruch",     text: "Scherben aus dem Kolbenwald. Verkaufen oder am Labortisch zu neuen Gefäßen schmelzen." },
  quarz:          { name: "Quarz",         text: "Reiner Quarzsand (Siliciumdioxid). Daraus entsteht die Quarzampulle." }
};

// Name einer Sache im Gepäck, egal welcher Sorte
function sachName(id) {
  return (GEFAESSE[id] || WAREN[id] || WERKZEUGE[id] || { name: id }).name;
}
