// ============================================================
//  ELEMENTALS – Stoffdaten, Steckbriefe, Reaktionen (Kapitel 1)
//
//  Eigene Daten des Rollenspiels, NICHT aus Karten\karten-daten.js:
//  Das Kartenspiel rechnet mit festen Lebenspunkten, hier entstehen
//  die Werte aus echten Stoffeigenschaften (siehe kern\kampf.js,
//  Funktion grundwerte). Wer eine Zahl ändern will, ändert den
//  Stoffwert – und der muss dann im Lehrbuch stimmen.
//
//  stoff.haerte   Mohshärte                        → Abwehr
//  stoff.dichte   g/cm³                            → Tempo (leicht = schnell)
//  stoff.schmelz  Schmelz-/Sublimationstemp. in °C → Zusammenhalt,
//                                                    und Hitzeempfindlichkeit
//  steckbrief     was man mit Lupe, Magnet, Stromkreis und Hammer
//                 herausfindet (Quest 1, Maras Stoffkisten)
//  form           "stueck" | "pulver"  – entscheidet mit über das Fanggerät
//
//  Quellen: Tafelwerk / Blickpunkt Chemie 7/8, S. 16–17.
// ============================================================

var ARTEN = {

  eisen: {
    name: "Eisen", formel: "Fe", klasse: "Metall", bild: "eisen", seltenheit: "haeufig",
    stoff: { haerte: 4, dichte: 7.87, schmelz: 1538 },
    steckbrief: { farbe: "grau", glanz: true, magnetisch: true, leitfaehig: true, verformbar: true },
    form: "stueck",
    reaktionen: ["hammerschlag", "funkenflug", "standfest"]
  },

  magnesium: {
    name: "Magnesium", formel: "Mg", klasse: "Metall", bild: "magnesium", seltenheit: "haeufig",
    stoff: { haerte: 2.5, dichte: 1.74, schmelz: 650 },
    steckbrief: { farbe: "silbrig", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true },
    form: "stueck",
    reaktionen: ["leichtschlag", "aufflammen", "standfest"]
  },

  kohlenstoff: {
    // Holzkohle aus dem Meiler. Leitet den Strom – als einziges
    // Nichtmetall in Maras Kisten. Genau diese Ausnahme macht den
    // Steckbrief lehrreich: Leitfähigkeit allein heißt nicht Metall.
    name: "Kohlenstoff", formel: "C", klasse: "Nichtmetall", bild: "kohlenstoff", seltenheit: "haeufig",
    stoff: { haerte: 1.5, dichte: 2.26, schmelz: 3640 },   // Grafit, sublimiert
    steckbrief: { farbe: "schwarz", glanz: false, magnetisch: false, leitfaehig: true, verformbar: false },
    form: "stueck",
    reaktionen: ["glut", "russwolke", "kohlenstaub"]
  },

  kupfer: {
    name: "Kupfer", formel: "Cu", klasse: "Metall", bild: "kupfer", seltenheit: "selten",
    stoff: { haerte: 3, dichte: 8.96, schmelz: 1085 },
    steckbrief: { farbe: "rötlich", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true },
    form: "stueck",
    reaktionen: ["blankhieb", "waermeleitung", "anlaufen"]
  },

  zink: {
    // Bei Raumtemperatur spröde; gut verformbar erst zwischen 100 und
    // 150 °C. Darum hier "verformbar: false".
    name: "Zink", formel: "Zn", klasse: "Metall", bild: "zink", seltenheit: "haeufig",
    stoff: { haerte: 2.5, dichte: 7.14, schmelz: 420 },
    steckbrief: { farbe: "bläulich-grau", glanz: true, magnetisch: false, leitfaehig: true, verformbar: false },
    warmVerformbar: true,
    form: "stueck",
    reaktionen: ["wuchtstoss", "zinksulfid", "zinkschild"]
  },

  schwefel: {
    name: "Schwefel", formel: "S", klasse: "Nichtmetall", bild: "schwefel", seltenheit: "selten",
    stoff: { haerte: 2, dichte: 2.07, schmelz: 115 },
    steckbrief: { farbe: "gelb", glanz: false, magnetisch: false, leitfaehig: false, verformbar: false },
    form: "pulver",
    reaktionen: ["blaue_flamme", "sulfidbildung", "leichtschlag"]
  }
};

// ------------------------------------------------------------
//  Reaktionen und Vorgänge
//
//  art     "wucht"     mechanisch; spröde Ziele leiden mehr, verformbare weniger
//          "hitze"     Verbrennung; braucht Sauerstoff im Feld, gibt Wärme ab;
//                      Ziele mit niedriger Schmelztemperatur leiden mehr
//          "leitung"   nimmt die Wärme des Feldes und leitet sie ins Ziel
//          "schutz"    kein Schaden, nur Wirkung auf sich selbst
//          "reaktion"  Reaktion mit dem Ziel selbst; gegenMetall /
//                      gegenNichtmetall, oder gegen: { art: Faktor }
//  kraft   Grundschaden
//  ae      Aktivierungsenergie, die der Zug kostet
//  o2      Sauerstoff, den der Zug verbraucht (und mindestens braucht)
//  waerme  Wärme, die ins Feld abgegeben wird (exotherm)
//  wirkung Zusatz, siehe kern\kampf.js
// ------------------------------------------------------------
var REAKTIONEN = {

  hammerschlag: { name: "Hammerschlag", art: "wucht", kraft: 10, ae: 1,
    text: "Hart und ehrlich wie auf dem Amboss." },
  leichtschlag: { name: "Rempler", art: "wucht", kraft: 7, ae: 0,
    text: "Ein schneller, leichter Stoß." },
  // 12 → 13 am 25.10.2026 (Kupfer war mit 37 % am schwächsten). 14 wäre
  // zu viel: Kupfer gewönne dann 92 % gegen Kohlenstoff.
  blankhieb: { name: "Blankhieb", art: "wucht", kraft: 13, ae: 1,
    text: "Kupfer ist weich, aber schwer – das Gewicht macht den Schlag." },
  // 13 → 16 am 25.10.2026: Zink ist als einziger Stoff gegen Hitze UND
  // Wucht empfindlich (schmilzt bei 420 °C, kalt spröde) und gewann nur
  // 7 % seiner Paarungen (mit korrigierter KI gemessen). Mit 16 und der
  // Zinksulfid-Reaktion sind es 42 %; die Stoffwerte bleiben.
  wuchtstoss: { name: "Wuchtstoß", art: "wucht", kraft: 16, ae: 1,
    text: "Mit den schweren Zinkplatten voran." },

  funkenflug: { name: "Funkenflug", art: "hitze", kraft: 14, ae: 4, o2: 8, waerme: 10,
    text: "Fein verteiltes Eisen verbrennt in Funken zu Eisenoxid – wie Eisenwolle in der Flamme." },
  aufflammen: { name: "Aufflammen", art: "hitze", kraft: 13, ae: 5, o2: 10, waerme: 15,
    wirkung: { geblendet: 1 },
    text: "Magnesium verbrennt mit gleißend weißem Licht zu Magnesiumoxid. Wer hineinsieht, ist geblendet." },
  glut: { name: "Glut", art: "hitze", kraft: 13, ae: 3, o2: 10, waerme: 12,
    text: "Holzkohle entzündet sich leicht, glüht und verbrennt zu Kohlenstoffdioxid." },
  blaue_flamme: { name: "Blaue Flamme", art: "hitze", kraft: 12, ae: 2, o2: 8, waerme: 8,
    wirkung: { reizgas: 3, dauer: 2 },
    text: "Schwefel entzündet sich leicht und brennt mit blauer Flamme. Es entsteht stechendes Schwefeldioxid." },

  kohlenstaub: { name: "Kohlenstaub", art: "hitze", kraft: 20, ae: 6, o2: 15, waerme: 20,
    text: "Fein verteilter Kohlenstaub in der Luft verbrennt schlagartig – eine Staubexplosion." },

  // Keine Verbrennung, sondern die Reaktion mit dem Ziel selbst:
  // Schwefel bildet mit Metallen Sulfide (Fe + S → FeS, stark exotherm).
  // Mit einem Nichtmetall passiert fast nichts.
  // Je unedler das Metall, desto heftiger die Reaktion mit Schwefel:
  // Magnesium 2,4 > Eisen und Zink 1,5 > Kupfer 1,1. Dazu Kohlenstoff
  // 1,5: Schwefeldampf über glühender Holzkohle gibt Schwefelkohlenstoff
  // (CS₂) – so wird er technisch hergestellt. Alle drei Ausnahmen seit
  // 25.10.2026, gemessen gegen Einbahnstraßen (Siege für den Gegner):
  //   Magnesium 2,0 → 78 %, 2,4 → 44 % (vorher 99 %)
  //   Kohlenstoff 1,4 → 73 %, 1,5 → 57 %, 1,8 → 15 % (vorher 100 %)
  //   Kupfer 1,1 mit Blankhieb 13 → 48 % (vorher 8 %)
  sulfidbildung: { name: "Sulfidbildung", art: "reaktion", kraft: 13, ae: 4, waerme: 12,
    gegenMetall: 1.5, gegenNichtmetall: 0.4, gegen: { magnesium: 2.4, kohlenstoff: 1.5, kupfer: 1.1 },
    text: "Schwefel greift das Metall selbst an und bildet ein Sulfid – wie Eisen und Schwefel zu Eisensulfid." },

  // Zink und Schwefel reagieren heftig und stark exotherm zu Zinksulfid
  // (Zn + S → ZnS) – mit anderen Stoffen passiert dabei nichts. Ersetzt
  // am 25.10.2026 die Zinkflamme, die die KI nie gewählt hat. Faktor 1,6
  // gemessen: 1,4 → 16 %, 1,6 → 38 %, 2,0 → 98 % Siege gegen Schwefel –
  // die Kurve ist steil, kleine Änderungen hier kippen die Paarung.
  zinksulfid: { name: "Zinksulfid", art: "reaktion", kraft: 14, ae: 3, waerme: 15,
    gegen: { schwefel: 1.6 }, gegenMetall: 0.3, gegenNichtmetall: 0.3,
    text: "Zink und Schwefel reagieren heftig zu Zinksulfid. Mit anderen Stoffen geschieht fast nichts." },

  waermeleitung: { name: "Wärmeleitung", art: "leitung", kraft: 0, ae: 2,
    text: "Kupfer leitet Wärme besser als fast jeder andere Stoff – es nimmt die Hitze des Feldes auf und gibt sie weiter." },

  russwolke: { name: "Rußwolke", art: "schutz", kraft: 0, ae: 2,
    wirkung: { tarnung: 1 },
    text: "Feiner Ruß – auch das ist Kohlenstoff. Der nächste Angriff geht halb ins Leere." },
  standfest: { name: "Standfest", art: "schutz", kraft: 0, ae: 1,
    wirkung: { schutz: 0.5 },
    text: "Sammeln statt schlagen. Der nächste Treffer wirkt nur halb." },
  anlaufen: { name: "Anlaufen", art: "schutz", kraft: 0, ae: 2, o2: 3, braucht: { waerme: 30 },
    wirkung: { abwehrPlus: 4 },
    text: "Heißes Kupfer überzieht sich mit schwarzem Kupferoxid. Die Schicht hält – dauerhaft für diesen Kampf." },
  zinkschild: { name: "Zinkschild", art: "schutz", kraft: 0, ae: 1,
    wirkung: { schutz: 0.2, abwehrPlus: 2 },
    text: "An der Luft überzieht sich Zink mit einer dichten Schutzschicht – darum rostet verzinktes Eisen nicht. Der nächste Treffer prallt fast ganz ab, und die Schicht bleibt." }
};

// ------------------------------------------------------------
//  Untersuchungswerkzeuge (Erkennen im Kampf)
// ------------------------------------------------------------
var WERKZEUGE = {
  lupe:       { name: "Lupe",       prueft: ["farbe", "glanz"] },
  magnet:     { name: "Magnet",     prueft: ["magnetisch"] },
  stromkreis: { name: "Stromkreis", prueft: ["leitfaehig"] },
  hammer:     { name: "Hammer",     prueft: ["verformbar"] },
  // Gegenstände ohne Prüfung – stehen im Gepäck, nicht im Menü „Untersuchen“
  gasbrenner:        { name: "Gasbrenner", prueft: [], text: "Liefert im Kampf einmal Aktivierungsenergie (+4) und heizt das Feld auf." },
  erlenmeyerkolben:  { name: "Erlenmeyerkolben", prueft: [], text: "Dein erstes eigenes Laborglas. Für Flüssigkeiten – später." },
  geraetepass:       { name: "Gerätepass des Kolbenwaldes", prueft: [], text: "Unterschrieben von Meisterin Vitra." }
};

// ------------------------------------------------------------
//  Fanggeräte – Eignung siehe kern\fangen.js
// ------------------------------------------------------------
var FANGGERAETE = {
  reagenzglas: { name: "Reagenzglas",              kurz: "Reagenzglas" },
  tiegelzange: { name: "Tiegelzange mit Tiegel",   kurz: "Tiegelzange" },
  spatel:      { name: "Spatellöffel mit Uhrglas", kurz: "Spatel" }
};
