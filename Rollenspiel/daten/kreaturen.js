// ============================================================
//  KREATUREN – erzeugt von werkzeug\kreaturensammler-import.py
//  aus drehbuch\Chemie-Kreaturensammler.xlsx. NICHT VON HAND ÄNDERN:
//  Die Tabelle des Nutzers ist maßgeblich; nach jeder Änderung neu
//  laufen lassen.
// ============================================================

var KTYPEN = {
 "knall": {
  "name": "Knall",
  "gruppe": "1. Hauptgruppe (Alkalimetalle + Wasserstoff)",
  "physisch": false,
  "idee": "reagiert explosiv: Knallgas, Natrium in Wasser"
 },
 "erde": {
  "name": "Erde",
  "gruppe": "2. Hauptgruppe (Erdalkalimetalle)",
  "physisch": true,
  "idee": "Kalk, Knochen, Gestein"
 },
 "leichtmetall": {
  "name": "Leichtmetall",
  "gruppe": "3. Hauptgruppe (Borgruppe)",
  "physisch": true,
  "idee": "leicht wie Alufolie"
 },
 "kristall": {
  "name": "Kristall",
  "gruppe": "4. Hauptgruppe (Kohlenstoffgruppe)",
  "physisch": true,
  "idee": "Diamant, Silizium-Chips, Blei"
 },
 "frost": {
  "name": "Frost",
  "gruppe": "5. Hauptgruppe (Stickstoffgruppe)",
  "physisch": false,
  "idee": "flüssiger Stickstoff, eiskalt"
 },
 "feuer": {
  "name": "Feuer",
  "gruppe": "6. Hauptgruppe (Chalkogene / Sauerstoffgruppe)",
  "physisch": false,
  "idee": "ohne Sauerstoff kein Feuer, Schwefel im Streichholz"
 },
 "aetz": {
  "name": "Ätz",
  "gruppe": "7. Hauptgruppe (Halogene)",
  "physisch": false,
  "idee": "Chlor ätzt, z. B. im Schwimmbad"
 },
 "geist": {
  "name": "Geist",
  "gruppe": "8. Hauptgruppe (Edelgase)",
  "physisch": false,
  "idee": "unsichtbar, reagiert kaum, leuchtet in Neonröhren"
 },
 "stahl": {
  "name": "Stahl",
  "gruppe": "Nebengruppen (4. Periode und Gruppe 12)",
  "physisch": true,
  "idee": "Alltagsmetalle: Werkzeug, Kabel, Münzen"
 },
 "hartmetall": {
  "name": "Hartmetall",
  "gruppe": "Nebengruppen (Gruppe 4–7 ab 5. Periode)",
  "physisch": true,
  "idee": "extrem hart, schmilzt kaum: Glühdraht, Bohrer, Raketendüsen"
 },
 "edelmetall": {
  "name": "Edelmetall",
  "gruppe": "Nebengruppen (Edelmetalle, Gruppe 8–11 ab 5. Periode)",
  "physisch": true,
  "idee": "Gold, Silber, Platin – glänzen und rosten nie"
 },
 "magnet": {
  "name": "Magnet",
  "gruppe": "Seltene Erden (Sc, Y, Lanthanoide)",
  "physisch": true,
  "idee": "Neodym-Supermagnete"
 },
 "strahlung": {
  "name": "Strahlung",
  "gruppe": "Actinoide",
  "physisch": false,
  "idee": "radioaktiv, selten und mächtig"
 },
 "normal": {
  "name": "Normal",
  "gruppe": "kein Element – nur Attacken-Typ",
  "physisch": true,
  "idee": "Kratzen, Beißen, Zuschlagen – kann jedes Element lernen"
 }
};

var TYPENTABELLE = {
 "knall": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 0.5,
  "frost": 1.0,
  "feuer": 2.0,
  "aetz": 2.0,
  "geist": 0.5,
  "stahl": 1.0,
  "hartmetall": 1.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "erde": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 2.0,
  "geist": 0.5,
  "stahl": 0.5,
  "hartmetall": 1.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "leichtmetall": {
  "knall": 1.0,
  "erde": 0.5,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 2.0,
  "hartmetall": 1.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "kristall": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 2.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 0.5,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 1.0,
  "hartmetall": 1.0,
  "edelmetall": 2.0,
  "magnet": 1.0,
  "strahlung": 2.0
 },
 "frost": {
  "knall": 2.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 2.0,
  "aetz": 1.0,
  "geist": 2.0,
  "stahl": 0.5,
  "hartmetall": 2.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "feuer": {
  "knall": 1.0,
  "erde": 0.5,
  "leichtmetall": 1.0,
  "kristall": 2.0,
  "frost": 2.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 2.0,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 2.0,
  "strahlung": 1.0
 },
 "aetz": {
  "knall": 1.0,
  "erde": 0.5,
  "leichtmetall": 2.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 2.0,
  "hartmetall": 1.0,
  "edelmetall": 0.5,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "geist": {
  "knall": 0.5,
  "erde": 0.5,
  "leichtmetall": 0.5,
  "kristall": 0.5,
  "frost": 0.5,
  "feuer": 0.5,
  "aetz": 0.5,
  "geist": 1.0,
  "stahl": 0.5,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 0.5,
  "strahlung": 0.5
 },
 "stahl": {
  "knall": 1.0,
  "erde": 2.0,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 0.5,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "hartmetall": {
  "knall": 1.0,
  "erde": 2.0,
  "leichtmetall": 1.0,
  "kristall": 2.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 2.0,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "edelmetall": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 2.0,
  "stahl": 0.5,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "magnet": {
  "knall": 1.0,
  "erde": 0.5,
  "leichtmetall": 1.0,
  "kristall": 0.5,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 2.0,
  "hartmetall": 0.5,
  "edelmetall": 0.5,
  "magnet": 1.0,
  "strahlung": 1.0
 },
 "strahlung": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 0.5,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.5,
  "stahl": 1.0,
  "hartmetall": 1.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 2.0
 },
 "normal": {
  "knall": 1.0,
  "erde": 1.0,
  "leichtmetall": 1.0,
  "kristall": 1.0,
  "frost": 1.0,
  "feuer": 1.0,
  "aetz": 1.0,
  "geist": 0.0,
  "stahl": 1.0,
  "hartmetall": 1.0,
  "edelmetall": 1.0,
  "magnet": 1.0,
  "strahlung": 1.0
 }
};

var TYPEN_BEGRUENDUNG = {
 "knall": "Natrium + Chlor reagieren heftig, Wasserstoff + Sauerstoff knallt",
 "erde": "Kalk macht Ätzendes unschädlich",
 "leichtmetall": "Thermit: Aluminium bringt Eisen zum Schmelzen",
 "kristall": "Diamant ritzt fast alles (auch weiches Gold), Blei hält Strahlung ab",
 "frost": "Kälte löscht Feuer, bremst Reaktionen, verflüssigt Gase und macht Hartmetall spröde",
 "feuer": "Eisen rostet, Kohle brennt, Eis schmilzt, Hitze entmagnetisiert – aber Gold rostet nie und Wolfram schmilzt kaum",
 "aetz": "Chlor greift Metalle an – Edelmetalle halten stand",
 "geist": "Edelgase reagieren kaum – vor allem Statusattacken",
 "stahl": "Spitzhacke gegen Fels – gegen Hartmetall stumpf",
 "hartmetall": "Bohrer aus Hartmetall bohren durch Stein, Kristall und Stahl",
 "edelmetall": "Silber gegen Geister – wie im Märchen",
 "magnet": "Magnete ziehen Eisen an – Gold, Silber und Wolfram nicht",
 "strahlung": "Kettenreaktion – aber Blei schirmt ab",
 "normal": "rein körperlicher Angriff – geht durch Gas einfach hindurch"
};

var KSTATUS = [
 {
  "id": "verbrannt",
  "name": "verbrannt",
  "vorbild": "Verbrennung",
  "wirkung": "verliert jede Runde KP, physischer Schaden halbiert",
  "quelle": "Feuer, Leichtmetall"
 },
 {
  "id": "gefroren",
  "name": "gefroren",
  "vorbild": "Gefroren",
  "wirkung": "kann nicht angreifen, bis es auftaut",
  "quelle": "Frost"
 },
 {
  "id": "geladen",
  "name": "geladen",
  "vorbild": "Paralyse",
  "wirkung": "Initiative sinkt, setzt manchmal aus",
  "quelle": "Magnet"
 },
 {
  "id": "korrodiert",
  "name": "korrodiert",
  "vorbild": "Vergiftung",
  "wirkung": "verliert jede Runde KP",
  "quelle": "Ätz, Feuer"
 },
 {
  "id": "inert",
  "name": "inert",
  "vorbild": "Schlaf",
  "wirkung": "setzt einige Runden aus",
  "quelle": "Geist"
 },
 {
  "id": "verstrahlt",
  "name": "verstrahlt",
  "vorbild": "Verwirrung",
  "wirkung": "greift manchmal sich selbst an",
  "quelle": "Strahlung"
 }
];

var ATTACKEN = {
 "schnellreaktion": {
  "id": "schnellreaktion",
  "name": "Schnellreaktion",
  "vorbild": "Ruckzuckhieb",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 40,
  "genau": 100,
  "effekt": "greift immer zuerst an",
  "e": {
   "zuerst": true
  },
  "text": "Alkalimetalle reagieren blitzschnell",
  "ae": 0
 },
 "natriumspritzer": {
  "id": "natriumspritzer",
  "name": "Natriumspritzer",
  "vorbild": "Aquaknarre",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 40,
  "genau": 100,
  "effekt": "",
  "e": {},
  "text": "Natrium flitzt zischend über Wasser",
  "ae": 0
 },
 "verpuffung": {
  "id": "verpuffung",
  "name": "Verpuffung",
  "vorbild": "Kopfnuss",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 70,
  "genau": 100,
  "effekt": "30 % schreckt zurück",
  "e": {
   "schreck": 30
  },
  "text": "kleiner Knall erschreckt den Gegner",
  "ae": 1
 },
 "heftige_reaktion": {
  "id": "heftige_reaktion",
  "name": "Heftige Reaktion",
  "vorbild": "Hydropumpe",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 120,
  "genau": 80,
  "effekt": "",
  "e": {},
  "text": "Kalium reagiert mit Wasser sogar mit Flamme",
  "ae": 3
 },
 "knallgasreaktion": {
  "id": "knallgasreaktion",
  "name": "Knallgasreaktion",
  "vorbild": "Explosion",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 250,
  "genau": 100,
  "effekt": "Anwender wird kampfunfähig",
  "e": {
   "selbstKO": true
  },
  "text": "Wasserstoff + Sauerstoff = lauter Knall",
  "ae": 4
 },
 "lithiumakku": {
  "id": "lithiumakku",
  "name": "Lithiumakku",
  "vorbild": "Donnerblitz",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 95,
  "genau": 100,
  "effekt": "10 % geladen",
  "e": {
   "status": "geladen",
   "chance": 10
  },
  "text": "Lithium steckt in jedem Handy-Akku",
  "ae": 2
 },
 "kaliumflamme": {
  "id": "kaliumflamme",
  "name": "Kaliumflamme",
  "vorbild": "Flammenrad",
  "typ": "knall",
  "kategorie": "speziell",
  "staerke": 60,
  "genau": 100,
  "effekt": "10 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 10
  },
  "text": "Kalium brennt mit violetter Flamme",
  "ae": 1
 },
 "kalkbeben": {
  "id": "kalkbeben",
  "name": "Kalkbeben",
  "vorbild": "Erdbeben",
  "typ": "erde",
  "kategorie": "physisch",
  "staerke": 100,
  "genau": 100,
  "effekt": "trifft alle Gegner",
  "e": {
   "alle": true
  },
  "text": "Kalkstein bildet ganze Gebirge",
  "ae": 2
 },
 "ausfaellung": {
  "id": "ausfaellung",
  "name": "Ausfällung",
  "vorbild": "Schaufler",
  "typ": "erde",
  "kategorie": "physisch",
  "staerke": 60,
  "genau": 100,
  "effekt": "verschwindet eine Runde, greift dann an",
  "e": {
   "zweirundig": "weg"
  },
  "text": "Kalk fällt als fester Stoff aus",
  "ae": 1
 },
 "knochenkeule": {
  "id": "knochenkeule",
  "name": "Knochenkeule",
  "vorbild": "Knochenkeule",
  "typ": "erde",
  "kategorie": "physisch",
  "staerke": 65,
  "genau": 85,
  "effekt": "10 % schreckt zurück",
  "e": {
   "schreck": 10
  },
  "text": "Knochen bestehen aus Calcium",
  "ae": 1
 },
 "magnesiumblitz": {
  "id": "magnesiumblitz",
  "name": "Magnesiumblitz",
  "vorbild": "Sandwirbel",
  "typ": "erde",
  "kategorie": "status",
  "staerke": null,
  "genau": 100,
  "effekt": "Genauigkeit des Gegners −1",
  "e": {
   "gegner": {
    "genau": -1
   }
  },
  "text": "Magnesium verbrennt grell weiß",
  "ae": 1
 },
 "kalkpanzer": {
  "id": "kalkpanzer",
  "name": "Kalkpanzer",
  "vorbild": "Panzerschutz",
  "typ": "erde",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Verteidigung +1",
  "e": {
   "selbst": {
    "vert": 1
   }
  },
  "text": "Muschelschalen sind aus Kalk",
  "ae": 1
 },
 "neutralisieren": {
  "id": "neutralisieren",
  "name": "Neutralisieren",
  "vorbild": "Dunkelnebel",
  "typ": "erde",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "setzt alle Statuswert-Änderungen zurück",
  "e": {
   "neutral": true
  },
  "text": "Kalk neutralisiert Säure",
  "ae": 1
 },
 "kalkstaubsturm": {
  "id": "kalkstaubsturm",
  "name": "Kalkstaubsturm",
  "vorbild": "Sandsturm",
  "typ": "erde",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "5 Runden Schaden für alle außer Erde, Kristall, Stahl und Hartmetall",
  "e": {
   "kampfwetter": "staub"
  },
  "text": "Kalkstaub weht über den Steinbruch",
  "ae": 1
 },
 "alu_fluegel": {
  "id": "alu_fluegel",
  "name": "Alu-Flügel",
  "vorbild": "Flügelschlag",
  "typ": "leichtmetall",
  "kategorie": "physisch",
  "staerke": 60,
  "genau": 100,
  "effekt": "",
  "e": {},
  "text": "Flugzeuge sind aus Aluminium",
  "ae": 1
 },
 "thermitschlag": {
  "id": "thermitschlag",
  "name": "Thermitschlag",
  "vorbild": "Feuerschlag",
  "typ": "leichtmetall",
  "kategorie": "physisch",
  "staerke": 75,
  "genau": 100,
  "effekt": "10 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 10
  },
  "text": "Thermit: Aluminium schmilzt Eisen",
  "ae": 1
 },
 "fluessigmetall": {
  "id": "fluessigmetall",
  "name": "Flüssigmetall",
  "vorbild": "Bodycheck",
  "typ": "leichtmetall",
  "kategorie": "physisch",
  "staerke": 90,
  "genau": 85,
  "effekt": "Anwender erleidet ¼ des Schadens",
  "e": {
   "rueckstoss": 0.25
  },
  "text": "Gallium schmilzt schon in der Hand",
  "ae": 2
 },
 "alufolie": {
  "id": "alufolie",
  "name": "Alufolie",
  "vorbild": "Reflektor",
  "typ": "leichtmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "halbiert physischen Schaden für 5 Runden",
  "e": {
   "wand": "physisch"
  },
  "text": "Alufolie wirft Licht und Wärme zurück",
  "ae": 1
 },
 "leichtbau": {
  "id": "leichtbau",
  "name": "Leichtbau",
  "vorbild": "Agilität",
  "typ": "leichtmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Initiative +2",
  "e": {
   "selbst": {
    "init": 2
   }
  },
  "text": "leicht = schnell",
  "ae": 1
 },
 "dosenstampfer": {
  "id": "dosenstampfer",
  "name": "Dosenstampfer",
  "vorbild": "Stampfer",
  "typ": "leichtmetall",
  "kategorie": "physisch",
  "staerke": 65,
  "genau": 100,
  "effekt": "30 % schreckt zurück",
  "e": {
   "schreck": 30
  },
  "text": "Getränkedosen sind aus Aluminium",
  "ae": 1
 },
 "alu_jet": {
  "id": "alu_jet",
  "name": "Alu-Jet",
  "vorbild": "Himmelsfeger",
  "typ": "leichtmetall",
  "kategorie": "physisch",
  "staerke": 140,
  "genau": 90,
  "effekt": "lädt eine Runde auf, greift dann an",
  "e": {
   "zweirundig": "laden"
  },
  "text": "Flugzeuge sind aus Aluminium gebaut",
  "ae": 3
 },
 "kristallsplitter": {
  "id": "kristallsplitter",
  "name": "Kristallsplitter",
  "vorbild": "Steinwurf",
  "typ": "kristall",
  "kategorie": "physisch",
  "staerke": 50,
  "genau": 90,
  "effekt": "",
  "e": {},
  "text": "scharfe Kristallkanten",
  "ae": 1
 },
 "kohlenstoffklinge": {
  "id": "kohlenstoffklinge",
  "name": "Kohlenstoffklinge",
  "vorbild": "Rasierblatt",
  "typ": "kristall",
  "kategorie": "physisch",
  "staerke": 55,
  "genau": 95,
  "effekt": "hohe Volltrefferchance",
  "e": {
   "volltreffer": true
  },
  "text": "Graphit und Kohle",
  "ae": 1
 },
 "diamantschnitt": {
  "id": "diamantschnitt",
  "name": "Diamantschnitt",
  "vorbild": "Schlitzer",
  "typ": "kristall",
  "kategorie": "physisch",
  "staerke": 70,
  "genau": 100,
  "effekt": "hohe Volltrefferchance",
  "e": {
   "volltreffer": true
  },
  "text": "Diamant ist das härteste Material",
  "ae": 1
 },
 "quarzlawine": {
  "id": "quarzlawine",
  "name": "Quarzlawine",
  "vorbild": "Steinhagel",
  "typ": "kristall",
  "kategorie": "physisch",
  "staerke": 75,
  "genau": 90,
  "effekt": "30 % schreckt zurück",
  "e": {
   "schreck": 30
  },
  "text": "Quarz (Silicium) steckt in Sand und Fels",
  "ae": 1
 },
 "kristallgitter": {
  "id": "kristallgitter",
  "name": "Kristallgitter",
  "vorbild": "Härtner",
  "typ": "kristall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Verteidigung +1",
  "e": {
   "selbst": {
    "vert": 1
   }
  },
  "text": "Atome ordnen sich zu einem festen Gitter",
  "ae": 1
 },
 "bleimantel": {
  "id": "bleimantel",
  "name": "Bleimantel",
  "vorbild": "Barriere",
  "typ": "kristall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Verteidigung +2",
  "e": {
   "selbst": {
    "vert": 2
   }
  },
  "text": "Blei schützt beim Röntgen",
  "ae": 1
 },
 "siliziumchip": {
  "id": "siliziumchip",
  "name": "Siliziumchip",
  "vorbild": "Zielschuss",
  "typ": "kristall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "die nächste Attacke trifft sicher",
  "e": {
   "zielen": true
  },
  "text": "Computerchips aus Silizium rechnen alles aus",
  "ae": 1
 },
 "schockfrost": {
  "id": "schockfrost",
  "name": "Schockfrost",
  "vorbild": "Pulverschnee",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 40,
  "genau": 100,
  "effekt": "10 % gefroren",
  "e": {
   "status": "gefroren",
   "chance": 10
  },
  "text": "flüssiger Stickstoff friert sofort ein",
  "ae": 0
 },
 "kaeltewelle": {
  "id": "kaeltewelle",
  "name": "Kältewelle",
  "vorbild": "Eissturm",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 55,
  "genau": 95,
  "effekt": "Initiative des Gegners −1",
  "e": {
   "gegner": {
    "init": -1
   }
  },
  "text": "Kälte macht langsam",
  "ae": 1
 },
 "kondensation": {
  "id": "kondensation",
  "name": "Kondensation",
  "vorbild": "Eisstrahl",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 95,
  "genau": 100,
  "effekt": "10 % gefroren",
  "e": {
   "status": "gefroren",
   "chance": 10
  },
  "text": "Gas wird zu Flüssigkeit",
  "ae": 2
 },
 "fluessigstickstoff": {
  "id": "fluessigstickstoff",
  "name": "Flüssigstickstoff",
  "vorbild": "Blizzard",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 120,
  "genau": 70,
  "effekt": "10 % gefroren",
  "e": {
   "status": "gefroren",
   "chance": 10
  },
  "text": "−196 °C kalt",
  "ae": 3
 },
 "stickstoffnebel": {
  "id": "stickstoffnebel",
  "name": "Stickstoffnebel",
  "vorbild": "Weißnebel",
  "typ": "frost",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "schützt 5 Runden vor Statuswert-Senkung",
  "e": {
   "nebel": 5
  },
  "text": "Stickstoff ist reaktionsträge",
  "ae": 1
 },
 "polarlicht": {
  "id": "polarlicht",
  "name": "Polarlicht",
  "vorbild": "Aurorastrahl",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 65,
  "genau": 100,
  "effekt": "10 % Angriff des Gegners −1",
  "e": {
   "gegner": {
    "ang": -1
   },
   "chance": 10
  },
  "text": "Stickstoff in der Luft leuchtet im Polarlicht",
  "ae": 1
 },
 "frostfaust": {
  "id": "frostfaust",
  "name": "Frostfaust",
  "vorbild": "Eishieb",
  "typ": "frost",
  "kategorie": "speziell",
  "staerke": 75,
  "genau": 100,
  "effekt": "10 % gefroren",
  "e": {
   "status": "gefroren",
   "chance": 10
  },
  "text": "eiskalter Schlag",
  "ae": 1
 },
 "funkenflug": {
  "id": "funkenflug",
  "name": "Funkenflug",
  "vorbild": "Glut",
  "typ": "feuer",
  "kategorie": "speziell",
  "staerke": 40,
  "genau": 100,
  "effekt": "10 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 10
  },
  "text": "Schwefel im Streichholzkopf",
  "ae": 0
 },
 "stinkwolke": {
  "id": "stinkwolke",
  "name": "Stinkwolke",
  "vorbild": "Smog",
  "typ": "feuer",
  "kategorie": "speziell",
  "staerke": 20,
  "genau": 70,
  "effekt": "40 % korrodiert",
  "e": {
   "status": "korrodiert",
   "chance": 40
  },
  "text": "Schwefel riecht nach faulen Eiern",
  "ae": 0
 },
 "flammenoxidation": {
  "id": "flammenoxidation",
  "name": "Flammenoxidation",
  "vorbild": "Flammenwurf",
  "typ": "feuer",
  "kategorie": "speziell",
  "staerke": 95,
  "genau": 100,
  "effekt": "10 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 10
  },
  "text": "Sauerstoff lässt Stoffe verbrennen",
  "ae": 2
 },
 "grossbrand": {
  "id": "grossbrand",
  "name": "Großbrand",
  "vorbild": "Feuersturm",
  "typ": "feuer",
  "kategorie": "speziell",
  "staerke": 120,
  "genau": 85,
  "effekt": "10 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 10
  },
  "text": "viel Sauerstoff = großes Feuer",
  "ae": 3
 },
 "rostfrass": {
  "id": "rostfrass",
  "name": "Rostfraß",
  "vorbild": "Toxin",
  "typ": "feuer",
  "kategorie": "status",
  "staerke": null,
  "genau": 85,
  "effekt": "schwer korrodiert, Schaden steigt jede Runde",
  "e": {
   "status": "schwer_korrodiert",
   "chance": 100
  },
  "text": "Sauerstoff lässt Eisen rosten",
  "ae": 1
 },
 "sauerstoffschub": {
  "id": "sauerstoffschub",
  "name": "Sauerstoffschub",
  "vorbild": "Sonnentag",
  "typ": "feuer",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "Feuer-Attacken 5 Runden ×1,5",
  "e": {
   "kampfwetter": "sauerstoff"
  },
  "text": "mehr Sauerstoff, mehr Feuer",
  "ae": 1
 },
 "schwefelfeuer": {
  "id": "schwefelfeuer",
  "name": "Schwefelfeuer",
  "vorbild": "Läuterfeuer",
  "typ": "feuer",
  "kategorie": "speziell",
  "staerke": 100,
  "genau": 95,
  "effekt": "50 % verbrannt",
  "e": {
   "status": "verbrannt",
   "chance": 50
  },
  "text": "Schwefel brennt mit blauer Flamme",
  "ae": 2
 },
 "saeurespritzer": {
  "id": "saeurespritzer",
  "name": "Säurespritzer",
  "vorbild": "Säure",
  "typ": "aetz",
  "kategorie": "speziell",
  "staerke": 40,
  "genau": 100,
  "effekt": "10 % Verteidigung des Gegners −1",
  "e": {
   "gegner": {
    "vert": -1
   },
   "chance": 10
  },
  "text": "Salzsäure enthält Chlor",
  "ae": 0
 },
 "chlorgaswolke": {
  "id": "chlorgaswolke",
  "name": "Chlorgaswolke",
  "vorbild": "Matschbombe",
  "typ": "aetz",
  "kategorie": "speziell",
  "staerke": 90,
  "genau": 100,
  "effekt": "30 % korrodiert",
  "e": {
   "status": "korrodiert",
   "chance": 30
  },
  "text": "Chlorgas ist giftig und gelbgrün",
  "ae": 2
 },
 "fluorsturm": {
  "id": "fluorsturm",
  "name": "Fluorsturm",
  "vorbild": "Donner",
  "typ": "aetz",
  "kategorie": "speziell",
  "staerke": 120,
  "genau": 70,
  "effekt": "30 % korrodiert",
  "e": {
   "status": "korrodiert",
   "chance": 30
  },
  "text": "Fluor ist das reaktivste Element",
  "ae": 3
 },
 "bromdampf": {
  "id": "bromdampf",
  "name": "Bromdampf",
  "vorbild": "Rauchwolke",
  "typ": "aetz",
  "kategorie": "status",
  "staerke": null,
  "genau": 100,
  "effekt": "Genauigkeit des Gegners −1",
  "e": {
   "gegner": {
    "genau": -1
   }
  },
  "text": "Brom bildet braune Dämpfe",
  "ae": 1
 },
 "iodtinktur": {
  "id": "iodtinktur",
  "name": "Iodtinktur",
  "vorbild": "Genesung",
  "typ": "aetz",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "heilt 50 % der eigenen KP",
  "e": {
   "heilen": 0.5
  },
  "text": "Iod desinfiziert Wunden",
  "ae": 1
 },
 "chlorgestank": {
  "id": "chlorgestank",
  "name": "Chlorgestank",
  "vorbild": "Kreideschrei",
  "typ": "aetz",
  "kategorie": "status",
  "staerke": null,
  "genau": 85,
  "effekt": "Verteidigung des Gegners −2",
  "e": {
   "gegner": {
    "vert": -2
   }
  },
  "text": "Chlor riecht stechend wie im Hallenbad",
  "ae": 1
 },
 "saeureflut": {
  "id": "saeureflut",
  "name": "Säureflut",
  "vorbild": "Surfer",
  "typ": "aetz",
  "kategorie": "speziell",
  "staerke": 95,
  "genau": 100,
  "effekt": "trifft alle Gegner",
  "e": {
   "alle": true
  },
  "text": "Salzsäure aus Chlor",
  "ae": 2
 },
 "geisterleuchten": {
  "id": "geisterleuchten",
  "name": "Geisterleuchten",
  "vorbild": "Nachtnebel",
  "typ": "geist",
  "kategorie": "speziell",
  "staerke": null,
  "genau": 100,
  "effekt": "Schaden immer so hoch wie das eigene Level",
  "e": {
   "festLevel": true
  },
  "text": "Edelgase leuchten in Reklameröhren",
  "ae": 1
 },
 "heliumballon": {
  "id": "heliumballon",
  "name": "Heliumballon",
  "vorbild": "Fliegen",
  "typ": "geist",
  "kategorie": "speziell",
  "staerke": 70,
  "genau": 95,
  "effekt": "steigt eine Runde auf, greift dann an",
  "e": {
   "zweirundig": "weg"
  },
  "text": "Helium ist leichter als Luft",
  "ae": 1
 },
 "neonlicht": {
  "id": "neonlicht",
  "name": "Neonlicht",
  "vorbild": "Blitz",
  "typ": "geist",
  "kategorie": "status",
  "staerke": null,
  "genau": 70,
  "effekt": "Genauigkeit des Gegners −1",
  "e": {
   "gegner": {
    "genau": -1
   }
  },
  "text": "Neon leuchtet rot-orange",
  "ae": 1
 },
 "schutzgas": {
  "id": "schutzgas",
  "name": "Schutzgas",
  "vorbild": "Schutzschild",
  "typ": "geist",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "blockiert alle Angriffe für eine Runde",
  "e": {
   "schutzRunde": true
  },
  "text": "Argon schützt beim Schweißen",
  "ae": 1
 },
 "edelgasruhe": {
  "id": "edelgasruhe",
  "name": "Edelgasruhe",
  "vorbild": "Erholung",
  "typ": "geist",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "heilt alle KP, danach 2 Runden inert",
  "e": {
   "erholung": true
  },
  "text": "Edelgase sind die Ruhe selbst",
  "ae": 1
 },
 "plasmakugel": {
  "id": "plasmakugel",
  "name": "Plasmakugel",
  "vorbild": "Spukball",
  "typ": "geist",
  "kategorie": "speziell",
  "staerke": 80,
  "genau": 100,
  "effekt": "20 % Spezial-Verteidigung des Gegners −1",
  "e": {
   "gegner": {
    "spVert": -1
   },
   "chance": 20
  },
  "text": "Plasmalampen sind mit Edelgas gefüllt",
  "ae": 2
 },
 "xenon_narkose": {
  "id": "xenon_narkose",
  "name": "Xenon-Narkose",
  "vorbild": "Hypnose",
  "typ": "geist",
  "kategorie": "status",
  "staerke": null,
  "genau": 60,
  "effekt": "Gegner wird inert",
  "e": {
   "status": "inert",
   "chance": 100
  },
  "text": "Xenon wird als Narkosegas genutzt",
  "ae": 1
 },
 "stahlschlag": {
  "id": "stahlschlag",
  "name": "Stahlschlag",
  "vorbild": "Stahlflügel",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": 70,
  "genau": 90,
  "effekt": "10 % eigene Verteidigung +1",
  "e": {
   "selbst": {
    "vert": 1
   },
   "chance": 10
  },
  "text": "Stahl ist hart und zäh",
  "ae": 1
 },
 "eisenschweif": {
  "id": "eisenschweif",
  "name": "Eisenschweif",
  "vorbild": "Eisenschweif",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": 100,
  "genau": 75,
  "effekt": "30 % Verteidigung des Gegners −1",
  "e": {
   "gegner": {
    "vert": -1
   },
   "chance": 30
  },
  "text": "Eisen ist schwer",
  "ae": 2
 },
 "titanhammer": {
  "id": "titanhammer",
  "name": "Titanhammer",
  "vorbild": "Megakick",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": 120,
  "genau": 75,
  "effekt": "",
  "e": {},
  "text": "Titan ist leicht und extrem fest",
  "ae": 3
 },
 "kupferspule": {
  "id": "kupferspule",
  "name": "Kupferspule",
  "vorbild": "Wickel",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": 15,
  "genau": 85,
  "effekt": "hält Gegner 2–5 Runden fest",
  "e": {
   "festhalten": true
  },
  "text": "Kupferdraht in jeder Spule",
  "ae": 0
 },
 "zinkschicht": {
  "id": "zinkschicht",
  "name": "Zinkschicht",
  "vorbild": "Einigler",
  "typ": "stahl",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Verteidigung +1",
  "e": {
   "selbst": {
    "vert": 1
   }
  },
  "text": "Zink schützt Eisen vor Rost (verzinkt)",
  "ae": 1
 },
 "eisenkralle": {
  "id": "eisenkralle",
  "name": "Eisenkralle",
  "vorbild": "Metallklaue",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": 50,
  "genau": 95,
  "effekt": "10 % eigener Angriff +1",
  "e": {
   "selbst": {
    "ang": 1
   },
   "chance": 10
  },
  "text": "Krallen aus Eisen",
  "ae": 1
 },
 "federstahl": {
  "id": "federstahl",
  "name": "Federstahl",
  "vorbild": "Konter",
  "typ": "stahl",
  "kategorie": "physisch",
  "staerke": null,
  "genau": 100,
  "effekt": "gibt physischen Schaden doppelt zurück",
  "e": {
   "konter": "physisch"
  },
  "text": "eine Stahlfeder federt zurück",
  "ae": 1
 },
 "hartmetallspitze": {
  "id": "hartmetallspitze",
  "name": "Hartmetallspitze",
  "vorbild": "Hornattacke",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": 65,
  "genau": 100,
  "effekt": "",
  "e": {},
  "text": "Werkzeugspitzen aus Hartmetall",
  "ae": 1
 },
 "bohrhagel": {
  "id": "bohrhagel",
  "name": "Bohrhagel",
  "vorbild": "Furienschlag",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": 15,
  "genau": 85,
  "effekt": "trifft 2–5 Mal",
  "e": {
   "mehrfach": [
    2,
    5
   ]
  },
  "text": "ein Bohrhammer schlägt immer wieder zu",
  "ae": 0
 },
 "gluehdraht": {
  "id": "gluehdraht",
  "name": "Glühdraht",
  "vorbild": "Feuerwirbel",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": 15,
  "genau": 70,
  "effekt": "hält Gegner 2–5 Runden fest, Schaden jede Runde",
  "e": {
   "festhalten": true
  },
  "text": "Wolframdraht glüht in alten Glühbirnen",
  "ae": 0
 },
 "raketenstart": {
  "id": "raketenstart",
  "name": "Raketenstart",
  "vorbild": "Schädelwumme",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": 100,
  "genau": 100,
  "effekt": "lädt eine Runde auf (Verteidigung +1), greift dann an",
  "e": {
   "zweirundig": "laden",
   "selbst": {
    "vert": 1
   }
  },
  "text": "Raketendüsen aus Niob und Tantal halten die Hitze aus",
  "ae": 2
 },
 "wolframbohrer": {
  "id": "wolframbohrer",
  "name": "Wolframbohrer",
  "vorbild": "Hornbohrer",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": null,
  "genau": 30,
  "effekt": "besiegt den Gegner sofort, wenn er trifft",
  "e": {
   "ohko": true
  },
  "text": "Bohrer haben Spitzen aus Wolfram",
  "ae": 4
 },
 "unschmelzbar": {
  "id": "unschmelzbar",
  "name": "Unschmelzbar",
  "vorbild": "Ausdauer",
  "typ": "hartmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "übersteht den nächsten Angriff mit mindestens 1 KP",
  "e": {
   "ausdauer": true
  },
  "text": "Wolfram schmilzt erst bei 3422 °C",
  "ae": 1
 },
 "fraeskopf": {
  "id": "fraeskopf",
  "name": "Fräskopf",
  "vorbild": "Doppelkick",
  "typ": "hartmetall",
  "kategorie": "physisch",
  "staerke": 30,
  "genau": 100,
  "effekt": "trifft 2 Mal",
  "e": {
   "mehrfach": [
    2,
    2
   ]
  },
  "text": "Fräsen aus Hartmetall schneiden Metall",
  "ae": 0
 },
 "goldregen": {
  "id": "goldregen",
  "name": "Goldregen",
  "vorbild": "Kometenhieb",
  "typ": "edelmetall",
  "kategorie": "physisch",
  "staerke": 18,
  "genau": 85,
  "effekt": "trifft 2–5 Mal",
  "e": {
   "mehrfach": [
    2,
    5
   ]
  },
  "text": "Goldmünzen prasseln auf den Gegner",
  "ae": 0
 },
 "goldglanz": {
  "id": "goldglanz",
  "name": "Goldglanz",
  "vorbild": "Zahltag",
  "typ": "edelmetall",
  "kategorie": "physisch",
  "staerke": 40,
  "genau": 100,
  "effekt": "bringt nach dem Kampf Geld",
  "e": {
   "zahltag": true
  },
  "text": "Gold war schon immer Geld",
  "offen": true,
  "ae": 0
 },
 "silberstern": {
  "id": "silberstern",
  "name": "Silberstern",
  "vorbild": "Sternschauer",
  "typ": "edelmetall",
  "kategorie": "physisch",
  "staerke": 60,
  "genau": null,
  "effekt": "trifft immer",
  "e": {},
  "text": "Silber glänzt wie ein Stern",
  "ae": 1
 },
 "spiegelglanz": {
  "id": "spiegelglanz",
  "name": "Spiegelglanz",
  "vorbild": "Spiegelcape",
  "typ": "edelmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": 100,
  "effekt": "gibt speziellen Schaden doppelt zurück",
  "e": {
   "konter": "speziell"
  },
  "text": "Spiegel sind mit Silber beschichtet",
  "ae": 1
 },
 "edelruestung": {
  "id": "edelruestung",
  "name": "Edelrüstung",
  "vorbild": "Säurepanzer",
  "typ": "edelmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigene Verteidigung +2",
  "e": {
   "selbst": {
    "vert": 2
   }
  },
  "text": "Gold rostet und korrodiert nie",
  "ae": 1
 },
 "katalysator": {
  "id": "katalysator",
  "name": "Katalysator",
  "vorbild": "Schwerttanz",
  "typ": "edelmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "eigener Angriff +2",
  "e": {
   "selbst": {
    "ang": 2
   }
  },
  "text": "Platin beschleunigt Reaktionen (Autokatalysator)",
  "ae": 1
 },
 "silberglocke": {
  "id": "silberglocke",
  "name": "Silberglocke",
  "vorbild": "Vitalglocke",
  "typ": "edelmetall",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "heilt die Statusprobleme des ganzen Teams",
  "e": {
   "heilStatus": true
  },
  "text": "Silber tötet Keime ab",
  "ae": 1
 },
 "magnetstoss": {
  "id": "magnetstoss",
  "name": "Magnetstoß",
  "vorbild": "Donnerschock",
  "typ": "magnet",
  "kategorie": "physisch",
  "staerke": 40,
  "genau": 100,
  "effekt": "10 % geladen",
  "e": {
   "status": "geladen",
   "chance": 10
  },
  "text": "Magnetismus und Strom gehören zusammen",
  "ae": 0
 },
 "anziehung": {
  "id": "anziehung",
  "name": "Anziehung",
  "vorbild": "Klammer",
  "typ": "magnet",
  "kategorie": "physisch",
  "staerke": 15,
  "genau": 75,
  "effekt": "hält Gegner 2–5 Runden fest",
  "e": {
   "festhalten": true
  },
  "text": "Magnete halten fest",
  "ae": 0
 },
 "neodymhammer": {
  "id": "neodymhammer",
  "name": "Neodymhammer",
  "vorbild": "Bodyslam",
  "typ": "magnet",
  "kategorie": "physisch",
  "staerke": 85,
  "genau": 100,
  "effekt": "30 % geladen",
  "e": {
   "status": "geladen",
   "chance": 30
  },
  "text": "Neodym-Magnete sind extrem stark",
  "ae": 2
 },
 "abstossung": {
  "id": "abstossung",
  "name": "Abstoßung",
  "vorbild": "Wirbelwind",
  "typ": "magnet",
  "kategorie": "status",
  "staerke": null,
  "genau": 100,
  "effekt": "Gegner muss auswechseln",
  "e": {
   "wirbel": true
  },
  "text": "gleiche Pole stoßen sich ab",
  "offen": true,
  "ae": 1
 },
 "magnetfeld": {
  "id": "magnetfeld",
  "name": "Magnetfeld",
  "vorbild": "Lichtschild",
  "typ": "magnet",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "halbiert speziellen Schaden für 5 Runden",
  "e": {
   "wand": "speziell"
  },
  "text": "Magnetfeld der Erde schützt vor Sonnenwind",
  "ae": 1
 },
 "elektromagnet": {
  "id": "elektromagnet",
  "name": "Elektromagnet",
  "vorbild": "Blitzkanone",
  "typ": "magnet",
  "kategorie": "physisch",
  "staerke": 100,
  "genau": 50,
  "effekt": "100 % geladen",
  "e": {
   "status": "geladen",
   "chance": 100
  },
  "text": "Strom macht einen Magneten noch stärker",
  "ae": 2
 },
 "magnetfalle": {
  "id": "magnetfalle",
  "name": "Magnetfalle",
  "vorbild": "Spinnennetz",
  "typ": "magnet",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "Gegner kann nicht fliehen oder wechseln",
  "e": {
   "falle": true
  },
  "text": "Magnete lassen nicht mehr los",
  "offen": true,
  "ae": 1
 },
 "alphastrahlung": {
  "id": "alphastrahlung",
  "name": "Alphastrahlung",
  "vorbild": "Drachenwut",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": null,
  "genau": 100,
  "effekt": "richtet immer genau 40 Schaden an",
  "e": {
   "fest": 40
  },
  "text": "Alphastrahlung hat kurze Reichweite",
  "ae": 0
 },
 "betastrahl": {
  "id": "betastrahl",
  "name": "Betastrahl",
  "vorbild": "Psystrahl",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": 65,
  "genau": 100,
  "effekt": "10 % verstrahlt",
  "e": {
   "status": "verstrahlt",
   "chance": 10
  },
  "text": "Betastrahlung dringt tiefer ein",
  "ae": 1
 },
 "gammastrahl": {
  "id": "gammastrahl",
  "name": "Gammastrahl",
  "vorbild": "Psychokinese",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": 90,
  "genau": 100,
  "effekt": "10 % Spezial-Verteidigung des Gegners −1",
  "e": {
   "gegner": {
    "spVert": -1
   },
   "chance": 10
  },
  "text": "Gammastrahlung durchdringt fast alles",
  "ae": 2
 },
 "kernspaltung": {
  "id": "kernspaltung",
  "name": "Kernspaltung",
  "vorbild": "Hyperstrahl",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": 150,
  "genau": 90,
  "effekt": "Anwender muss eine Runde aussetzen",
  "e": {
   "aussetzen": true
  },
  "text": "Uran-Kerne zerfallen im Kraftwerk",
  "ae": 4
 },
 "halbwertszeit": {
  "id": "halbwertszeit",
  "name": "Halbwertszeit",
  "vorbild": "Abgesang",
  "typ": "strahlung",
  "kategorie": "status",
  "staerke": null,
  "genau": null,
  "effekt": "beide Kämpfer werden nach 3 Runden kampfunfähig",
  "e": {
   "abgesang": 3
  },
  "text": "radioaktive Stoffe zerfallen mit der Zeit",
  "offen": true,
  "ae": 1
 },
 "verzoegerter_zerfall": {
  "id": "verzoegerter_zerfall",
  "name": "Verzögerter Zerfall",
  "vorbild": "Seher",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": 80,
  "genau": 90,
  "effekt": "trifft erst 2 Runden später",
  "e": {
   "seher": 2
  },
  "text": "radioaktive Kerne zerfallen irgendwann",
  "offen": true,
  "ae": 2
 },
 "neutronenbeschuss": {
  "id": "neutronenbeschuss",
  "name": "Neutronenbeschuss",
  "vorbild": "Kreuzhieb",
  "typ": "strahlung",
  "kategorie": "speziell",
  "staerke": 100,
  "genau": 80,
  "effekt": "hohe Volltrefferchance",
  "e": {
   "volltreffer": true
  },
  "text": "Neutronen spalten Atomkerne",
  "ae": 2
 },
 "kratzer": {
  "id": "kratzer",
  "name": "Kratzer",
  "vorbild": "Kratzer",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 40,
  "genau": 100,
  "effekt": "",
  "e": {},
  "text": "einfacher körperlicher Angriff",
  "ae": 0
 },
 "anstossen": {
  "id": "anstossen",
  "name": "Anstoßen",
  "vorbild": "Tackle",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 35,
  "genau": 95,
  "effekt": "",
  "e": {},
  "text": "einfacher körperlicher Angriff",
  "ae": 0
 },
 "biss": {
  "id": "biss",
  "name": "Biss",
  "vorbild": "Biss",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 60,
  "genau": 100,
  "effekt": "30 % schreckt zurück",
  "e": {
   "schreck": 30
  },
  "text": "einfacher körperlicher Angriff",
  "ae": 1
 },
 "hammerfaust": {
  "id": "hammerfaust",
  "name": "Hammerfaust",
  "vorbild": "Megahieb",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 80,
  "genau": 85,
  "effekt": "",
  "e": {},
  "text": "einfacher körperlicher Angriff",
  "ae": 2
 },
 "schwanzschlag": {
  "id": "schwanzschlag",
  "name": "Schwanzschlag",
  "vorbild": "Slam",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 80,
  "genau": 75,
  "effekt": "",
  "e": {},
  "text": "einfacher körperlicher Angriff",
  "ae": 2
 },
 "klaps": {
  "id": "klaps",
  "name": "Klaps",
  "vorbild": "Pfund",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 40,
  "genau": 100,
  "effekt": "",
  "e": {},
  "text": "einfacher körperlicher Angriff",
  "ae": 0
 },
 "tritt": {
  "id": "tritt",
  "name": "Tritt",
  "vorbild": "Fußkick",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 50,
  "genau": 90,
  "effekt": "30 % schreckt zurück",
  "e": {
   "schreck": 30
  },
  "text": "einfacher körperlicher Angriff",
  "ae": 1
 },
 "doppelklaps": {
  "id": "doppelklaps",
  "name": "Doppelklaps",
  "vorbild": "Duplexhieb",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 15,
  "genau": 85,
  "effekt": "trifft 2–5 Mal",
  "e": {
   "mehrfach": [
    2,
    5
   ]
  },
  "text": "einfacher körperlicher Angriff",
  "ae": 0
 },
 "rammen": {
  "id": "rammen",
  "name": "Rammen",
  "vorbild": "Risikotackle",
  "typ": "normal",
  "kategorie": "physisch",
  "staerke": 120,
  "genau": 100,
  "effekt": "Anwender erleidet ¼ des Schadens",
  "e": {
   "rueckstoss": 0.25
  },
  "text": "einfacher körperlicher Angriff",
  "ae": 3
 }
};

var ELEMENTE = {
 "H": {
  "z": 1,
  "name": "Wasserstoff",
  "typ1": "knall",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "knallgasreaktion"
  ]
 },
 "He": {
  "z": 2,
  "name": "Helium",
  "typ1": "geist",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "heliumballon"
  ]
 },
 "Li": {
  "z": 3,
  "name": "Lithium",
  "typ1": "knall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "lithiumakku"
  ]
 },
 "Be": {
  "z": 4,
  "name": "Beryllium",
  "typ1": "erde",
  "typ2": null,
  "zustand": "fest"
 },
 "B": {
  "z": 5,
  "name": "Bor",
  "typ1": "leichtmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "C": {
  "z": 6,
  "name": "Kohlenstoff",
  "typ1": "kristall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "kohlenstoffklinge"
  ]
 },
 "N": {
  "z": 7,
  "name": "Stickstoff",
  "typ1": "frost",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "schockfrost",
   "stickstoffnebel",
   "polarlicht"
  ]
 },
 "O": {
  "z": 8,
  "name": "Sauerstoff",
  "typ1": "feuer",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "rostfrass",
   "sauerstoffschub",
   "flammenoxidation",
   "grossbrand"
  ]
 },
 "F": {
  "z": 9,
  "name": "Fluor",
  "typ1": "aetz",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "fluorsturm"
  ]
 },
 "Ne": {
  "z": 10,
  "name": "Neon",
  "typ1": "geist",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "neonlicht"
  ]
 },
 "Na": {
  "z": 11,
  "name": "Natrium",
  "typ1": "knall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "natriumspritzer"
  ]
 },
 "Mg": {
  "z": 12,
  "name": "Magnesium",
  "typ1": "erde",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "magnesiumblitz"
  ]
 },
 "Al": {
  "z": 13,
  "name": "Aluminium",
  "typ1": "leichtmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "alu_fluegel",
   "dosenstampfer",
   "thermitschlag",
   "alu_jet"
  ]
 },
 "Si": {
  "z": 14,
  "name": "Silicium",
  "typ1": "kristall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "siliziumchip",
   "quarzlawine"
  ]
 },
 "P": {
  "z": 15,
  "name": "Phosphor",
  "typ1": "frost",
  "typ2": null,
  "zustand": "fest"
 },
 "S": {
  "z": 16,
  "name": "Schwefel",
  "typ1": "feuer",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "stinkwolke",
   "funkenflug",
   "schwefelfeuer"
  ]
 },
 "Cl": {
  "z": 17,
  "name": "Chlor",
  "typ1": "aetz",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "chlorgestank",
   "saeurespritzer",
   "chlorgaswolke",
   "saeureflut"
  ]
 },
 "Ar": {
  "z": 18,
  "name": "Argon",
  "typ1": "geist",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "schutzgas"
  ]
 },
 "K": {
  "z": 19,
  "name": "Kalium",
  "typ1": "knall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "kaliumflamme",
   "heftige_reaktion"
  ]
 },
 "Ca": {
  "z": 20,
  "name": "Calcium",
  "typ1": "erde",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "knochenkeule"
  ]
 },
 "Sc": {
  "z": 21,
  "name": "Scandium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Ti": {
  "z": 22,
  "name": "Titan",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "titanhammer"
  ]
 },
 "V": {
  "z": 23,
  "name": "Vanadium",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "Cr": {
  "z": 24,
  "name": "Chrom",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "Mn": {
  "z": 25,
  "name": "Mangan",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "Fe": {
  "z": 26,
  "name": "Eisen",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "zinkschicht",
   "eisenkralle",
   "eisenschweif"
  ]
 },
 "Co": {
  "z": 27,
  "name": "Cobalt",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "Ni": {
  "z": 28,
  "name": "Nickel",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "Cu": {
  "z": 29,
  "name": "Kupfer",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "kupferspule"
  ]
 },
 "Zn": {
  "z": 30,
  "name": "Zink",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "zinkschicht"
  ]
 },
 "Ga": {
  "z": 31,
  "name": "Gallium",
  "typ1": "leichtmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "fluessigmetall"
  ]
 },
 "Ge": {
  "z": 32,
  "name": "Germanium",
  "typ1": "kristall",
  "typ2": null,
  "zustand": "fest"
 },
 "As": {
  "z": 33,
  "name": "Arsen",
  "typ1": "frost",
  "typ2": null,
  "zustand": "fest"
 },
 "Se": {
  "z": 34,
  "name": "Selen",
  "typ1": "feuer",
  "typ2": null,
  "zustand": "fest"
 },
 "Br": {
  "z": 35,
  "name": "Brom",
  "typ1": "aetz",
  "typ2": null,
  "zustand": "flüssig",
  "signatur": [
   "bromdampf"
  ]
 },
 "Kr": {
  "z": 36,
  "name": "Krypton",
  "typ1": "geist",
  "typ2": null,
  "zustand": "gasförmig"
 },
 "Rb": {
  "z": 37,
  "name": "Rubidium",
  "typ1": "knall",
  "typ2": null,
  "zustand": "fest"
 },
 "Sr": {
  "z": 38,
  "name": "Strontium",
  "typ1": "erde",
  "typ2": null,
  "zustand": "fest"
 },
 "Y": {
  "z": 39,
  "name": "Yttrium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Zr": {
  "z": 40,
  "name": "Zirconium",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Nb": {
  "z": 41,
  "name": "Niob",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "raketenstart"
  ]
 },
 "Mo": {
  "z": 42,
  "name": "Molybdän",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Tc": {
  "z": 43,
  "name": "Technetium",
  "typ1": "hartmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Ru": {
  "z": 44,
  "name": "Ruthenium",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Rh": {
  "z": 45,
  "name": "Rhodium",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Pd": {
  "z": 46,
  "name": "Palladium",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Ag": {
  "z": 47,
  "name": "Silber",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "silberstern",
   "silberglocke",
   "spiegelglanz"
  ]
 },
 "Cd": {
  "z": 48,
  "name": "Cadmium",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "fest"
 },
 "In": {
  "z": 49,
  "name": "Indium",
  "typ1": "leichtmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Sn": {
  "z": 50,
  "name": "Zinn",
  "typ1": "kristall",
  "typ2": null,
  "zustand": "fest"
 },
 "Sb": {
  "z": 51,
  "name": "Antimon",
  "typ1": "frost",
  "typ2": null,
  "zustand": "fest"
 },
 "Te": {
  "z": 52,
  "name": "Tellur",
  "typ1": "feuer",
  "typ2": null,
  "zustand": "fest"
 },
 "I": {
  "z": 53,
  "name": "Iod",
  "typ1": "aetz",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "iodtinktur"
  ]
 },
 "Xe": {
  "z": 54,
  "name": "Xenon",
  "typ1": "geist",
  "typ2": null,
  "zustand": "gasförmig",
  "signatur": [
   "xenon_narkose"
  ]
 },
 "Cs": {
  "z": 55,
  "name": "Caesium",
  "typ1": "knall",
  "typ2": null,
  "zustand": "fest"
 },
 "Ba": {
  "z": 56,
  "name": "Barium",
  "typ1": "erde",
  "typ2": null,
  "zustand": "fest"
 },
 "La": {
  "z": 57,
  "name": "Lanthan",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Ce": {
  "z": 58,
  "name": "Cer",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Pr": {
  "z": 59,
  "name": "Praseodym",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Nd": {
  "z": 60,
  "name": "Neodym",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "neodymhammer"
  ]
 },
 "Sm": {
  "z": 62,
  "name": "Samarium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Eu": {
  "z": 63,
  "name": "Europium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Gd": {
  "z": 64,
  "name": "Gadolinium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Tb": {
  "z": 65,
  "name": "Terbium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Dy": {
  "z": 66,
  "name": "Dysprosium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Er": {
  "z": 68,
  "name": "Erbium",
  "typ1": "magnet",
  "typ2": null,
  "zustand": "fest"
 },
 "Hf": {
  "z": 72,
  "name": "Hafnium",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Ta": {
  "z": 73,
  "name": "Tantal",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "raketenstart"
  ]
 },
 "W": {
  "z": 74,
  "name": "Wolfram",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "gluehdraht",
   "unschmelzbar",
   "wolframbohrer"
  ]
 },
 "Re": {
  "z": 75,
  "name": "Rhenium",
  "typ1": "hartmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Os": {
  "z": 76,
  "name": "Osmium",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Ir": {
  "z": 77,
  "name": "Iridium",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Pt": {
  "z": 78,
  "name": "Platin",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "katalysator"
  ]
 },
 "Au": {
  "z": 79,
  "name": "Gold",
  "typ1": "edelmetall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "goldglanz",
   "edelruestung",
   "goldregen"
  ]
 },
 "Hg": {
  "z": 80,
  "name": "Quecksilber",
  "typ1": "stahl",
  "typ2": null,
  "zustand": "flüssig"
 },
 "Tl": {
  "z": 81,
  "name": "Thallium",
  "typ1": "leichtmetall",
  "typ2": null,
  "zustand": "fest"
 },
 "Pb": {
  "z": 82,
  "name": "Blei",
  "typ1": "kristall",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "bleimantel"
  ]
 },
 "Bi": {
  "z": 83,
  "name": "Bismut",
  "typ1": "frost",
  "typ2": null,
  "zustand": "fest"
 },
 "Po": {
  "z": 84,
  "name": "Polonium",
  "typ1": "feuer",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "At": {
  "z": 85,
  "name": "Astat",
  "typ1": "aetz",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Rn": {
  "z": 86,
  "name": "Radon",
  "typ1": "geist",
  "typ2": "strahlung",
  "zustand": "gasförmig"
 },
 "Fr": {
  "z": 87,
  "name": "Francium",
  "typ1": "knall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Ra": {
  "z": 88,
  "name": "Radium",
  "typ1": "erde",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Ac": {
  "z": 89,
  "name": "Actinium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Th": {
  "z": 90,
  "name": "Thorium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Pa": {
  "z": 91,
  "name": "Protactinium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "U": {
  "z": 92,
  "name": "Uran",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest",
  "signatur": [
   "kernspaltung"
  ]
 },
 "Np": {
  "z": 93,
  "name": "Neptunium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Pu": {
  "z": 94,
  "name": "Plutonium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Am": {
  "z": 95,
  "name": "Americium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Cm": {
  "z": 96,
  "name": "Curium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Cf": {
  "z": 98,
  "name": "Californium",
  "typ1": "strahlung",
  "typ2": null,
  "zustand": "fest"
 },
 "Rf": {
  "z": 104,
  "name": "Rutherfordium",
  "typ1": "hartmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Db": {
  "z": 105,
  "name": "Dubnium",
  "typ1": "hartmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Sg": {
  "z": 106,
  "name": "Seaborgium",
  "typ1": "hartmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Bh": {
  "z": 107,
  "name": "Bohrium",
  "typ1": "hartmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Hs": {
  "z": 108,
  "name": "Hassium",
  "typ1": "edelmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Mt": {
  "z": 109,
  "name": "Meitnerium",
  "typ1": "edelmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Ds": {
  "z": 110,
  "name": "Darmstadtium",
  "typ1": "edelmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 },
 "Rg": {
  "z": 111,
  "name": "Roentgenium",
  "typ1": "edelmetall",
  "typ2": "strahlung",
  "zustand": "fest"
 }
};

var LERNSETS = {
 "H": {
  "1": [
   "anstossen"
  ],
  "6": [
   "schnellreaktion"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "kaliumflamme"
  ],
  "27": [
   "verpuffung"
  ],
  "35": [
   "lithiumakku"
  ],
  "42": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "He": {
  "1": [
   "klaps"
  ],
  "7": [
   "neonlicht"
  ],
  "14": [
   "geisterleuchten"
  ],
  "21": [
   "doppelklaps"
  ],
  "28": [
   "xenon_narkose"
  ],
  "36": [
   "heliumballon"
  ],
  "43": [
   "edelgasruhe"
  ],
  "48": [
   "plasmakugel"
  ]
 },
 "Li": {
  "1": [
   "kratzer"
  ],
  "5": [
   "schnellreaktion"
  ],
  "12": [
   "kaliumflamme"
  ],
  "19": [
   "biss"
  ],
  "26": [
   "verpuffung"
  ],
  "34": [
   "lithiumakku"
  ],
  "41": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Be": {
  "1": [
   "anstossen"
  ],
  "6": [
   "kalkpanzer"
  ],
  "12": [
   "neutralisieren"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "kalkstaubsturm"
  ],
  "31": [
   "ausfaellung"
  ],
  "37": [
   "knochenkeule"
  ],
  "43": [
   "schwanzschlag"
  ],
  "48": [
   "kalkbeben"
  ]
 },
 "B": {
  "1": [
   "klaps"
  ],
  "7": [
   "leichtbau"
  ],
  "13": [
   "alufolie"
  ],
  "19": [
   "doppelklaps"
  ],
  "25": [
   "dosenstampfer"
  ],
  "32": [
   "thermitschlag"
  ],
  "38": [
   "fluessigmetall"
  ],
  "44": [
   "rammen"
  ],
  "48": [
   "alu_jet"
  ]
 },
 "C": {
  "1": [
   "kratzer"
  ],
  "5": [
   "kristallgitter"
  ],
  "11": [
   "kohlenstoffklinge"
  ],
  "17": [
   "kristallsplitter"
  ],
  "23": [
   "bleimantel"
  ],
  "30": [
   "biss"
  ],
  "36": [
   "diamantschnitt"
  ],
  "42": [
   "quarzlawine"
  ],
  "48": [
   "hammerfaust"
  ]
 },
 "N": {
  "1": [
   "anstossen"
  ],
  "6": [
   "schockfrost"
  ],
  "13": [
   "stickstoffnebel"
  ],
  "20": [
   "tritt"
  ],
  "27": [
   "polarlicht"
  ],
  "35": [
   "kaeltewelle"
  ],
  "42": [
   "frostfaust"
  ],
  "48": [
   "kondensation"
  ]
 },
 "O": {
  "1": [
   "klaps"
  ],
  "7": [
   "stinkwolke"
  ],
  "14": [
   "rostfrass"
  ],
  "21": [
   "doppelklaps"
  ],
  "28": [
   "sauerstoffschub"
  ],
  "36": [
   "flammenoxidation"
  ],
  "43": [
   "schwefelfeuer"
  ],
  "48": [
   "grossbrand"
  ]
 },
 "F": {
  "1": [
   "kratzer"
  ],
  "5": [
   "bromdampf"
  ],
  "12": [
   "saeurespritzer"
  ],
  "19": [
   "iodtinktur"
  ],
  "26": [
   "biss"
  ],
  "34": [
   "chlorgaswolke"
  ],
  "41": [
   "saeureflut"
  ],
  "48": [
   "fluorsturm"
  ]
 },
 "Ne": {
  "1": [
   "anstossen"
  ],
  "6": [
   "neonlicht"
  ],
  "13": [
   "geisterleuchten"
  ],
  "20": [
   "xenon_narkose"
  ],
  "27": [
   "tritt"
  ],
  "35": [
   "edelgasruhe"
  ],
  "42": [
   "heliumballon"
  ],
  "48": [
   "plasmakugel"
  ]
 },
 "Na": {
  "1": [
   "klaps"
  ],
  "7": [
   "natriumspritzer"
  ],
  "14": [
   "schnellreaktion"
  ],
  "21": [
   "doppelklaps"
  ],
  "28": [
   "verpuffung"
  ],
  "36": [
   "lithiumakku"
  ],
  "43": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Mg": {
  "1": [
   "kratzer"
  ],
  "5": [
   "magnesiumblitz"
  ],
  "11": [
   "kalkpanzer"
  ],
  "17": [
   "neutralisieren"
  ],
  "23": [
   "kalkstaubsturm"
  ],
  "30": [
   "ausfaellung"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "kalkbeben"
  ]
 },
 "Al": {
  "1": [
   "anstossen"
  ],
  "6": [
   "leichtbau"
  ],
  "12": [
   "alufolie"
  ],
  "18": [
   "alu_fluegel"
  ],
  "24": [
   "tritt"
  ],
  "31": [
   "dosenstampfer"
  ],
  "37": [
   "thermitschlag"
  ],
  "43": [
   "schwanzschlag"
  ],
  "48": [
   "alu_jet"
  ]
 },
 "Si": {
  "1": [
   "klaps"
  ],
  "7": [
   "kristallgitter"
  ],
  "13": [
   "siliziumchip"
  ],
  "19": [
   "doppelklaps"
  ],
  "25": [
   "kristallsplitter"
  ],
  "32": [
   "bleimantel"
  ],
  "38": [
   "quarzlawine"
  ],
  "44": [
   "diamantschnitt"
  ],
  "48": [
   "rammen"
  ]
 },
 "P": {
  "1": [
   "kratzer"
  ],
  "5": [
   "schockfrost"
  ],
  "12": [
   "kaeltewelle"
  ],
  "19": [
   "biss"
  ],
  "26": [
   "polarlicht"
  ],
  "34": [
   "frostfaust"
  ],
  "41": [
   "kondensation"
  ],
  "48": [
   "fluessigstickstoff"
  ]
 },
 "S": {
  "1": [
   "anstossen"
  ],
  "6": [
   "stinkwolke"
  ],
  "13": [
   "funkenflug"
  ],
  "20": [
   "tritt"
  ],
  "27": [
   "sauerstoffschub"
  ],
  "35": [
   "schwefelfeuer"
  ],
  "42": [
   "flammenoxidation"
  ],
  "48": [
   "grossbrand"
  ]
 },
 "Cl": {
  "1": [
   "klaps"
  ],
  "7": [
   "chlorgestank"
  ],
  "14": [
   "bromdampf"
  ],
  "21": [
   "saeurespritzer"
  ],
  "28": [
   "doppelklaps"
  ],
  "36": [
   "chlorgaswolke"
  ],
  "43": [
   "saeureflut"
  ],
  "48": [
   "fluorsturm"
  ]
 },
 "Ar": {
  "1": [
   "kratzer"
  ],
  "5": [
   "neonlicht"
  ],
  "12": [
   "schutzgas"
  ],
  "19": [
   "geisterleuchten"
  ],
  "26": [
   "edelgasruhe"
  ],
  "34": [
   "biss"
  ],
  "41": [
   "heliumballon"
  ],
  "48": [
   "plasmakugel"
  ]
 },
 "K": {
  "1": [
   "anstossen"
  ],
  "6": [
   "schnellreaktion"
  ],
  "13": [
   "kaliumflamme"
  ],
  "20": [
   "tritt"
  ],
  "27": [
   "verpuffung"
  ],
  "35": [
   "lithiumakku"
  ],
  "42": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Ca": {
  "1": [
   "klaps"
  ],
  "7": [
   "kalkpanzer"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "neutralisieren"
  ],
  "25": [
   "knochenkeule"
  ],
  "32": [
   "kalkstaubsturm"
  ],
  "38": [
   "ausfaellung"
  ],
  "44": [
   "kalkbeben"
  ],
  "48": [
   "rammen"
  ]
 },
 "Sc": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetfalle"
  ],
  "17": [
   "magnetstoss"
  ],
  "23": [
   "abstossung"
  ],
  "30": [
   "magnetfeld"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Ti": {
  "1": [
   "anstossen"
  ],
  "6": [
   "zinkschicht"
  ],
  "12": [
   "eisenkralle"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "federstahl"
  ],
  "31": [
   "stahlschlag"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "V": {
  "1": [
   "klaps"
  ],
  "7": [
   "zinkschicht"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "eisenkralle"
  ],
  "25": [
   "federstahl"
  ],
  "32": [
   "stahlschlag"
  ],
  "38": [
   "eisenschweif"
  ],
  "44": [
   "titanhammer"
  ],
  "48": [
   "rammen"
  ]
 },
 "Cr": {
  "1": [
   "kratzer"
  ],
  "5": [
   "zinkschicht"
  ],
  "11": [
   "eisenkralle"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "federstahl"
  ],
  "30": [
   "stahlschlag"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "Mn": {
  "1": [
   "anstossen"
  ],
  "6": [
   "zinkschicht"
  ],
  "12": [
   "eisenkralle"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "federstahl"
  ],
  "31": [
   "stahlschlag"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "Fe": {
  "1": [
   "klaps"
  ],
  "7": [
   "zinkschicht"
  ],
  "13": [
   "eisenkralle"
  ],
  "19": [
   "doppelklaps"
  ],
  "25": [
   "federstahl"
  ],
  "32": [
   "stahlschlag"
  ],
  "38": [
   "eisenschweif"
  ],
  "44": [
   "titanhammer"
  ],
  "48": [
   "rammen"
  ]
 },
 "Co": {
  "1": [
   "kratzer"
  ],
  "5": [
   "zinkschicht"
  ],
  "11": [
   "eisenkralle"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "federstahl"
  ],
  "30": [
   "stahlschlag"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "Ni": {
  "1": [
   "anstossen"
  ],
  "6": [
   "zinkschicht"
  ],
  "12": [
   "eisenkralle"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "federstahl"
  ],
  "31": [
   "stahlschlag"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "Cu": {
  "1": [
   "klaps"
  ],
  "7": [
   "zinkschicht"
  ],
  "13": [
   "kupferspule"
  ],
  "19": [
   "doppelklaps"
  ],
  "25": [
   "federstahl"
  ],
  "32": [
   "stahlschlag"
  ],
  "38": [
   "eisenschweif"
  ],
  "44": [
   "titanhammer"
  ],
  "48": [
   "rammen"
  ]
 },
 "Zn": {
  "1": [
   "kratzer"
  ],
  "5": [
   "zinkschicht"
  ],
  "11": [
   "eisenkralle"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "federstahl"
  ],
  "30": [
   "stahlschlag"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "Ga": {
  "1": [
   "anstossen"
  ],
  "6": [
   "leichtbau"
  ],
  "12": [
   "alufolie"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "dosenstampfer"
  ],
  "31": [
   "thermitschlag"
  ],
  "37": [
   "fluessigmetall"
  ],
  "43": [
   "schwanzschlag"
  ],
  "48": [
   "alu_jet"
  ]
 },
 "Ge": {
  "1": [
   "klaps"
  ],
  "7": [
   "kristallgitter"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "kristallsplitter"
  ],
  "25": [
   "kohlenstoffklinge"
  ],
  "32": [
   "bleimantel"
  ],
  "38": [
   "diamantschnitt"
  ],
  "44": [
   "quarzlawine"
  ],
  "48": [
   "rammen"
  ]
 },
 "As": {
  "1": [
   "kratzer"
  ],
  "5": [
   "schockfrost"
  ],
  "12": [
   "kaeltewelle"
  ],
  "19": [
   "biss"
  ],
  "26": [
   "polarlicht"
  ],
  "34": [
   "frostfaust"
  ],
  "41": [
   "kondensation"
  ],
  "48": [
   "fluessigstickstoff"
  ]
 },
 "Se": {
  "1": [
   "anstossen"
  ],
  "6": [
   "stinkwolke"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "rostfrass"
  ],
  "27": [
   "sauerstoffschub"
  ],
  "35": [
   "flammenoxidation"
  ],
  "42": [
   "schwefelfeuer"
  ],
  "48": [
   "grossbrand"
  ]
 },
 "Br": {
  "1": [
   "klaps"
  ],
  "7": [
   "bromdampf"
  ],
  "14": [
   "saeurespritzer"
  ],
  "21": [
   "doppelklaps"
  ],
  "28": [
   "iodtinktur"
  ],
  "36": [
   "chlorgaswolke"
  ],
  "43": [
   "saeureflut"
  ],
  "48": [
   "fluorsturm"
  ]
 },
 "Kr": {
  "1": [
   "kratzer"
  ],
  "5": [
   "neonlicht"
  ],
  "12": [
   "geisterleuchten"
  ],
  "19": [
   "xenon_narkose"
  ],
  "26": [
   "edelgasruhe"
  ],
  "34": [
   "biss"
  ],
  "41": [
   "heliumballon"
  ],
  "48": [
   "plasmakugel"
  ]
 },
 "Rb": {
  "1": [
   "anstossen"
  ],
  "6": [
   "schnellreaktion"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "kaliumflamme"
  ],
  "27": [
   "verpuffung"
  ],
  "35": [
   "lithiumakku"
  ],
  "42": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Sr": {
  "1": [
   "klaps"
  ],
  "7": [
   "kalkpanzer"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "neutralisieren"
  ],
  "25": [
   "kalkstaubsturm"
  ],
  "32": [
   "ausfaellung"
  ],
  "38": [
   "knochenkeule"
  ],
  "44": [
   "kalkbeben"
  ],
  "48": [
   "rammen"
  ]
 },
 "Y": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetfalle"
  ],
  "17": [
   "magnetstoss"
  ],
  "23": [
   "abstossung"
  ],
  "30": [
   "magnetfeld"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Zr": {
  "1": [
   "anstossen"
  ],
  "6": [
   "gluehdraht"
  ],
  "12": [
   "bohrhagel"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "fraeskopf"
  ],
  "31": [
   "hartmetallspitze"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "raketenstart"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Nb": {
  "1": [
   "klaps"
  ],
  "7": [
   "gluehdraht"
  ],
  "13": [
   "bohrhagel"
  ],
  "19": [
   "doppelklaps"
  ],
  "25": [
   "fraeskopf"
  ],
  "32": [
   "hartmetallspitze"
  ],
  "38": [
   "raketenstart"
  ],
  "44": [
   "rammen"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Mo": {
  "1": [
   "kratzer"
  ],
  "5": [
   "gluehdraht"
  ],
  "11": [
   "bohrhagel"
  ],
  "17": [
   "fraeskopf"
  ],
  "23": [
   "biss"
  ],
  "30": [
   "hartmetallspitze"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "raketenstart"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Tc": {
  "1": [
   "anstossen"
  ],
  "6": [
   "gluehdraht"
  ],
  "11": [
   "alphastrahlung"
  ],
  "17": [
   "bohrhagel"
  ],
  "22": [
   "tritt"
  ],
  "27": [
   "fraeskopf"
  ],
  "33": [
   "hartmetallspitze"
  ],
  "38": [
   "verzoegerter_zerfall"
  ],
  "44": [
   "schwanzschlag"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Ru": {
  "1": [
   "klaps"
  ],
  "7": [
   "goldglanz"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "goldregen"
  ],
  "25": [
   "katalysator"
  ],
  "32": [
   "silberstern"
  ],
  "38": [
   "silberglocke"
  ],
  "44": [
   "spiegelglanz"
  ],
  "48": [
   "rammen"
  ]
 },
 "Rh": {
  "1": [
   "kratzer"
  ],
  "5": [
   "goldglanz"
  ],
  "11": [
   "goldregen"
  ],
  "17": [
   "katalysator"
  ],
  "23": [
   "silberstern"
  ],
  "30": [
   "silberglocke"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "spiegelglanz"
  ],
  "48": [
   "hammerfaust"
  ]
 },
 "Pd": {
  "1": [
   "anstossen"
  ],
  "6": [
   "goldglanz"
  ],
  "12": [
   "tritt"
  ],
  "18": [
   "goldregen"
  ],
  "24": [
   "katalysator"
  ],
  "31": [
   "silberstern"
  ],
  "37": [
   "silberglocke"
  ],
  "43": [
   "spiegelglanz"
  ],
  "48": [
   "schwanzschlag"
  ]
 },
 "Ag": {
  "1": [
   "klaps"
  ],
  "7": [
   "goldglanz"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "silberstern"
  ],
  "25": [
   "silberglocke"
  ],
  "32": [
   "spiegelglanz"
  ],
  "38": [
   "goldregen"
  ],
  "44": [
   "katalysator"
  ],
  "48": [
   "rammen"
  ]
 },
 "Cd": {
  "1": [
   "kratzer"
  ],
  "5": [
   "zinkschicht"
  ],
  "11": [
   "eisenkralle"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "federstahl"
  ],
  "30": [
   "stahlschlag"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "eisenschweif"
  ],
  "48": [
   "titanhammer"
  ]
 },
 "In": {
  "1": [
   "anstossen"
  ],
  "6": [
   "leichtbau"
  ],
  "12": [
   "alufolie"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "dosenstampfer"
  ],
  "31": [
   "thermitschlag"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "fluessigmetall"
  ],
  "48": [
   "alu_jet"
  ]
 },
 "Sn": {
  "1": [
   "klaps"
  ],
  "7": [
   "kristallgitter"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "kristallsplitter"
  ],
  "25": [
   "kohlenstoffklinge"
  ],
  "32": [
   "bleimantel"
  ],
  "38": [
   "diamantschnitt"
  ],
  "44": [
   "quarzlawine"
  ],
  "48": [
   "rammen"
  ]
 },
 "Sb": {
  "1": [
   "kratzer"
  ],
  "5": [
   "schockfrost"
  ],
  "12": [
   "kaeltewelle"
  ],
  "19": [
   "biss"
  ],
  "26": [
   "polarlicht"
  ],
  "34": [
   "frostfaust"
  ],
  "41": [
   "kondensation"
  ],
  "48": [
   "fluessigstickstoff"
  ]
 },
 "Te": {
  "1": [
   "anstossen"
  ],
  "6": [
   "stinkwolke"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "rostfrass"
  ],
  "27": [
   "sauerstoffschub"
  ],
  "35": [
   "flammenoxidation"
  ],
  "42": [
   "schwefelfeuer"
  ],
  "48": [
   "grossbrand"
  ]
 },
 "I": {
  "1": [
   "klaps"
  ],
  "7": [
   "bromdampf"
  ],
  "14": [
   "iodtinktur"
  ],
  "21": [
   "saeurespritzer"
  ],
  "28": [
   "doppelklaps"
  ],
  "36": [
   "chlorgaswolke"
  ],
  "43": [
   "saeureflut"
  ],
  "48": [
   "fluorsturm"
  ]
 },
 "Xe": {
  "1": [
   "kratzer"
  ],
  "5": [
   "neonlicht"
  ],
  "12": [
   "xenon_narkose"
  ],
  "19": [
   "geisterleuchten"
  ],
  "26": [
   "edelgasruhe"
  ],
  "34": [
   "biss"
  ],
  "41": [
   "heliumballon"
  ],
  "48": [
   "plasmakugel"
  ]
 },
 "Cs": {
  "1": [
   "anstossen"
  ],
  "6": [
   "schnellreaktion"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "kaliumflamme"
  ],
  "27": [
   "verpuffung"
  ],
  "35": [
   "lithiumakku"
  ],
  "42": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Ba": {
  "1": [
   "klaps"
  ],
  "7": [
   "kalkpanzer"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "neutralisieren"
  ],
  "25": [
   "kalkstaubsturm"
  ],
  "32": [
   "ausfaellung"
  ],
  "38": [
   "knochenkeule"
  ],
  "44": [
   "kalkbeben"
  ],
  "48": [
   "rammen"
  ]
 },
 "La": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetfalle"
  ],
  "17": [
   "magnetstoss"
  ],
  "23": [
   "abstossung"
  ],
  "30": [
   "magnetfeld"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Ce": {
  "1": [
   "anstossen"
  ],
  "6": [
   "anziehung"
  ],
  "12": [
   "magnetfalle"
  ],
  "18": [
   "magnetstoss"
  ],
  "24": [
   "abstossung"
  ],
  "31": [
   "magnetfeld"
  ],
  "37": [
   "tritt"
  ],
  "43": [
   "schwanzschlag"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Pr": {
  "1": [
   "klaps"
  ],
  "7": [
   "anziehung"
  ],
  "13": [
   "magnetfalle"
  ],
  "19": [
   "magnetstoss"
  ],
  "25": [
   "abstossung"
  ],
  "32": [
   "doppelklaps"
  ],
  "38": [
   "magnetfeld"
  ],
  "44": [
   "elektromagnet"
  ],
  "48": [
   "rammen"
  ]
 },
 "Nd": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetstoss"
  ],
  "17": [
   "abstossung"
  ],
  "23": [
   "magnetfeld"
  ],
  "30": [
   "biss"
  ],
  "36": [
   "neodymhammer"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Sm": {
  "1": [
   "klaps"
  ],
  "7": [
   "anziehung"
  ],
  "13": [
   "magnetfalle"
  ],
  "19": [
   "magnetstoss"
  ],
  "25": [
   "abstossung"
  ],
  "32": [
   "doppelklaps"
  ],
  "38": [
   "magnetfeld"
  ],
  "44": [
   "elektromagnet"
  ],
  "48": [
   "rammen"
  ]
 },
 "Eu": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetfalle"
  ],
  "17": [
   "magnetstoss"
  ],
  "23": [
   "abstossung"
  ],
  "30": [
   "magnetfeld"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Gd": {
  "1": [
   "anstossen"
  ],
  "6": [
   "anziehung"
  ],
  "12": [
   "magnetfalle"
  ],
  "18": [
   "magnetstoss"
  ],
  "24": [
   "abstossung"
  ],
  "31": [
   "magnetfeld"
  ],
  "37": [
   "tritt"
  ],
  "43": [
   "schwanzschlag"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Tb": {
  "1": [
   "klaps"
  ],
  "7": [
   "anziehung"
  ],
  "13": [
   "magnetfalle"
  ],
  "19": [
   "magnetstoss"
  ],
  "25": [
   "abstossung"
  ],
  "32": [
   "doppelklaps"
  ],
  "38": [
   "magnetfeld"
  ],
  "44": [
   "elektromagnet"
  ],
  "48": [
   "rammen"
  ]
 },
 "Dy": {
  "1": [
   "kratzer"
  ],
  "5": [
   "anziehung"
  ],
  "11": [
   "magnetfalle"
  ],
  "17": [
   "magnetstoss"
  ],
  "23": [
   "abstossung"
  ],
  "30": [
   "magnetfeld"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "hammerfaust"
  ],
  "48": [
   "elektromagnet"
  ]
 },
 "Er": {
  "1": [
   "klaps"
  ],
  "7": [
   "anziehung"
  ],
  "13": [
   "magnetfalle"
  ],
  "19": [
   "magnetstoss"
  ],
  "25": [
   "abstossung"
  ],
  "32": [
   "doppelklaps"
  ],
  "38": [
   "magnetfeld"
  ],
  "44": [
   "elektromagnet"
  ],
  "48": [
   "rammen"
  ]
 },
 "Hf": {
  "1": [
   "kratzer"
  ],
  "5": [
   "gluehdraht"
  ],
  "11": [
   "bohrhagel"
  ],
  "17": [
   "fraeskopf"
  ],
  "23": [
   "biss"
  ],
  "30": [
   "hartmetallspitze"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "raketenstart"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Ta": {
  "1": [
   "anstossen"
  ],
  "6": [
   "gluehdraht"
  ],
  "12": [
   "bohrhagel"
  ],
  "18": [
   "tritt"
  ],
  "24": [
   "fraeskopf"
  ],
  "31": [
   "hartmetallspitze"
  ],
  "37": [
   "schwanzschlag"
  ],
  "43": [
   "raketenstart"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "W": {
  "1": [
   "klaps"
  ],
  "7": [
   "gluehdraht"
  ],
  "13": [
   "unschmelzbar"
  ],
  "19": [
   "bohrhagel"
  ],
  "25": [
   "doppelklaps"
  ],
  "32": [
   "fraeskopf"
  ],
  "38": [
   "hartmetallspitze"
  ],
  "44": [
   "rammen"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Re": {
  "1": [
   "kratzer"
  ],
  "5": [
   "gluehdraht"
  ],
  "11": [
   "bohrhagel"
  ],
  "17": [
   "fraeskopf"
  ],
  "23": [
   "biss"
  ],
  "30": [
   "hartmetallspitze"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "raketenstart"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Os": {
  "1": [
   "anstossen"
  ],
  "6": [
   "goldglanz"
  ],
  "12": [
   "tritt"
  ],
  "18": [
   "goldregen"
  ],
  "24": [
   "katalysator"
  ],
  "31": [
   "silberstern"
  ],
  "37": [
   "silberglocke"
  ],
  "43": [
   "spiegelglanz"
  ],
  "48": [
   "schwanzschlag"
  ]
 },
 "Ir": {
  "1": [
   "klaps"
  ],
  "7": [
   "goldglanz"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "goldregen"
  ],
  "25": [
   "katalysator"
  ],
  "32": [
   "silberstern"
  ],
  "38": [
   "silberglocke"
  ],
  "44": [
   "spiegelglanz"
  ],
  "48": [
   "rammen"
  ]
 },
 "Pt": {
  "1": [
   "kratzer"
  ],
  "5": [
   "goldglanz"
  ],
  "11": [
   "katalysator"
  ],
  "17": [
   "goldregen"
  ],
  "23": [
   "silberstern"
  ],
  "30": [
   "silberglocke"
  ],
  "36": [
   "biss"
  ],
  "42": [
   "spiegelglanz"
  ],
  "48": [
   "hammerfaust"
  ]
 },
 "Au": {
  "1": [
   "anstossen"
  ],
  "6": [
   "goldglanz"
  ],
  "12": [
   "edelruestung"
  ],
  "18": [
   "goldregen"
  ],
  "24": [
   "tritt"
  ],
  "31": [
   "silberstern"
  ],
  "37": [
   "silberglocke"
  ],
  "43": [
   "spiegelglanz"
  ],
  "48": [
   "schwanzschlag"
  ]
 },
 "Hg": {
  "1": [
   "klaps"
  ],
  "7": [
   "zinkschicht"
  ],
  "13": [
   "doppelklaps"
  ],
  "19": [
   "eisenkralle"
  ],
  "25": [
   "federstahl"
  ],
  "32": [
   "stahlschlag"
  ],
  "38": [
   "eisenschweif"
  ],
  "44": [
   "titanhammer"
  ],
  "48": [
   "rammen"
  ]
 },
 "Tl": {
  "1": [
   "kratzer"
  ],
  "5": [
   "leichtbau"
  ],
  "11": [
   "alufolie"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "dosenstampfer"
  ],
  "30": [
   "thermitschlag"
  ],
  "36": [
   "hammerfaust"
  ],
  "42": [
   "fluessigmetall"
  ],
  "48": [
   "alu_jet"
  ]
 },
 "Pb": {
  "1": [
   "anstossen"
  ],
  "6": [
   "kristallgitter"
  ],
  "12": [
   "bleimantel"
  ],
  "18": [
   "kristallsplitter"
  ],
  "24": [
   "tritt"
  ],
  "31": [
   "kohlenstoffklinge"
  ],
  "37": [
   "diamantschnitt"
  ],
  "43": [
   "quarzlawine"
  ],
  "48": [
   "schwanzschlag"
  ]
 },
 "Bi": {
  "1": [
   "klaps"
  ],
  "7": [
   "schockfrost"
  ],
  "14": [
   "doppelklaps"
  ],
  "21": [
   "kaeltewelle"
  ],
  "28": [
   "polarlicht"
  ],
  "36": [
   "frostfaust"
  ],
  "43": [
   "kondensation"
  ],
  "48": [
   "fluessigstickstoff"
  ]
 },
 "Po": {
  "1": [
   "kratzer"
  ],
  "5": [
   "stinkwolke"
  ],
  "11": [
   "alphastrahlung"
  ],
  "17": [
   "sauerstoffschub"
  ],
  "23": [
   "biss"
  ],
  "30": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "flammenoxidation"
  ],
  "42": [
   "schwefelfeuer"
  ],
  "48": [
   "grossbrand"
  ]
 },
 "At": {
  "1": [
   "anstossen"
  ],
  "6": [
   "bromdampf"
  ],
  "12": [
   "alphastrahlung"
  ],
  "18": [
   "iodtinktur"
  ],
  "24": [
   "tritt"
  ],
  "31": [
   "verzoegerter_zerfall"
  ],
  "37": [
   "chlorgaswolke"
  ],
  "43": [
   "saeureflut"
  ],
  "48": [
   "fluorsturm"
  ]
 },
 "Rn": {
  "1": [
   "klaps"
  ],
  "7": [
   "neonlicht"
  ],
  "13": [
   "alphastrahlung"
  ],
  "19": [
   "geisterleuchten"
  ],
  "25": [
   "doppelklaps"
  ],
  "32": [
   "edelgasruhe"
  ],
  "38": [
   "heliumballon"
  ],
  "44": [
   "plasmakugel"
  ],
  "48": [
   "verzoegerter_zerfall"
  ]
 },
 "Fr": {
  "1": [
   "kratzer"
  ],
  "5": [
   "schnellreaktion"
  ],
  "11": [
   "alphastrahlung"
  ],
  "17": [
   "biss"
  ],
  "23": [
   "verpuffung"
  ],
  "30": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "lithiumakku"
  ],
  "42": [
   "heftige_reaktion"
  ],
  "48": [
   "knallgasreaktion"
  ]
 },
 "Ra": {
  "1": [
   "anstossen"
  ],
  "6": [
   "kalkpanzer"
  ],
  "11": [
   "alphastrahlung"
  ],
  "17": [
   "neutralisieren"
  ],
  "22": [
   "tritt"
  ],
  "27": [
   "kalkstaubsturm"
  ],
  "33": [
   "ausfaellung"
  ],
  "38": [
   "verzoegerter_zerfall"
  ],
  "44": [
   "schwanzschlag"
  ],
  "48": [
   "kalkbeben"
  ]
 },
 "Ac": {
  "1": [
   "klaps"
  ],
  "7": [
   "alphastrahlung"
  ],
  "14": [
   "doppelklaps"
  ],
  "21": [
   "betastrahl"
  ],
  "28": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "gammastrahl"
  ],
  "43": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Th": {
  "1": [
   "kratzer"
  ],
  "5": [
   "alphastrahlung"
  ],
  "12": [
   "biss"
  ],
  "19": [
   "betastrahl"
  ],
  "26": [
   "verzoegerter_zerfall"
  ],
  "34": [
   "gammastrahl"
  ],
  "41": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Pa": {
  "1": [
   "anstossen"
  ],
  "6": [
   "alphastrahlung"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "betastrahl"
  ],
  "27": [
   "verzoegerter_zerfall"
  ],
  "35": [
   "gammastrahl"
  ],
  "42": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "U": {
  "1": [
   "klaps"
  ],
  "7": [
   "alphastrahlung"
  ],
  "14": [
   "doppelklaps"
  ],
  "21": [
   "betastrahl"
  ],
  "28": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "halbwertszeit"
  ],
  "43": [
   "neutronenbeschuss"
  ],
  "48": [
   "kernspaltung"
  ]
 },
 "Np": {
  "1": [
   "kratzer"
  ],
  "5": [
   "alphastrahlung"
  ],
  "12": [
   "biss"
  ],
  "19": [
   "betastrahl"
  ],
  "26": [
   "verzoegerter_zerfall"
  ],
  "34": [
   "gammastrahl"
  ],
  "41": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Pu": {
  "1": [
   "anstossen"
  ],
  "6": [
   "alphastrahlung"
  ],
  "13": [
   "tritt"
  ],
  "20": [
   "betastrahl"
  ],
  "27": [
   "verzoegerter_zerfall"
  ],
  "35": [
   "gammastrahl"
  ],
  "42": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Am": {
  "1": [
   "klaps"
  ],
  "7": [
   "alphastrahlung"
  ],
  "14": [
   "doppelklaps"
  ],
  "21": [
   "betastrahl"
  ],
  "28": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "gammastrahl"
  ],
  "43": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Cm": {
  "1": [
   "kratzer"
  ],
  "5": [
   "alphastrahlung"
  ],
  "12": [
   "biss"
  ],
  "19": [
   "betastrahl"
  ],
  "26": [
   "verzoegerter_zerfall"
  ],
  "34": [
   "gammastrahl"
  ],
  "41": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Cf": {
  "1": [
   "klaps"
  ],
  "7": [
   "alphastrahlung"
  ],
  "14": [
   "doppelklaps"
  ],
  "21": [
   "betastrahl"
  ],
  "28": [
   "verzoegerter_zerfall"
  ],
  "36": [
   "gammastrahl"
  ],
  "43": [
   "halbwertszeit"
  ],
  "48": [
   "neutronenbeschuss"
  ]
 },
 "Rf": {
  "1": [
   "klaps"
  ],
  "7": [
   "gluehdraht"
  ],
  "12": [
   "bohrhagel"
  ],
  "18": [
   "doppelklaps"
  ],
  "23": [
   "fraeskopf"
  ],
  "28": [
   "hartmetallspitze"
  ],
  "34": [
   "verzoegerter_zerfall"
  ],
  "39": [
   "halbwertszeit"
  ],
  "45": [
   "rammen"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Db": {
  "1": [
   "kratzer"
  ],
  "5": [
   "gluehdraht"
  ],
  "10": [
   "bohrhagel"
  ],
  "16": [
   "fraeskopf"
  ],
  "21": [
   "biss"
  ],
  "26": [
   "hartmetallspitze"
  ],
  "32": [
   "verzoegerter_zerfall"
  ],
  "37": [
   "hammerfaust"
  ],
  "43": [
   "halbwertszeit"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Sg": {
  "1": [
   "anstossen"
  ],
  "6": [
   "gluehdraht"
  ],
  "11": [
   "bohrhagel"
  ],
  "17": [
   "tritt"
  ],
  "22": [
   "fraeskopf"
  ],
  "27": [
   "hartmetallspitze"
  ],
  "33": [
   "verzoegerter_zerfall"
  ],
  "38": [
   "schwanzschlag"
  ],
  "44": [
   "halbwertszeit"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Bh": {
  "1": [
   "klaps"
  ],
  "7": [
   "gluehdraht"
  ],
  "12": [
   "bohrhagel"
  ],
  "18": [
   "doppelklaps"
  ],
  "23": [
   "fraeskopf"
  ],
  "28": [
   "hartmetallspitze"
  ],
  "34": [
   "verzoegerter_zerfall"
  ],
  "39": [
   "halbwertszeit"
  ],
  "45": [
   "rammen"
  ],
  "48": [
   "wolframbohrer"
  ]
 },
 "Hs": {
  "1": [
   "kratzer"
  ],
  "5": [
   "goldglanz"
  ],
  "10": [
   "katalysator"
  ],
  "16": [
   "silberstern"
  ],
  "21": [
   "silberglocke"
  ],
  "26": [
   "biss"
  ],
  "32": [
   "spiegelglanz"
  ],
  "37": [
   "verzoegerter_zerfall"
  ],
  "43": [
   "hammerfaust"
  ],
  "48": [
   "halbwertszeit"
  ]
 },
 "Mt": {
  "1": [
   "anstossen"
  ],
  "6": [
   "goldglanz"
  ],
  "11": [
   "tritt"
  ],
  "17": [
   "katalysator"
  ],
  "22": [
   "silberstern"
  ],
  "27": [
   "silberglocke"
  ],
  "33": [
   "spiegelglanz"
  ],
  "38": [
   "verzoegerter_zerfall"
  ],
  "44": [
   "schwanzschlag"
  ],
  "48": [
   "halbwertszeit"
  ]
 },
 "Ds": {
  "1": [
   "klaps"
  ],
  "7": [
   "goldglanz"
  ],
  "12": [
   "doppelklaps"
  ],
  "18": [
   "katalysator"
  ],
  "23": [
   "silberstern"
  ],
  "28": [
   "silberglocke"
  ],
  "34": [
   "spiegelglanz"
  ],
  "39": [
   "verzoegerter_zerfall"
  ],
  "45": [
   "halbwertszeit"
  ],
  "48": [
   "rammen"
  ]
 },
 "Rg": {
  "1": [
   "kratzer"
  ],
  "5": [
   "goldglanz"
  ],
  "10": [
   "katalysator"
  ],
  "16": [
   "silberstern"
  ],
  "21": [
   "silberglocke"
  ],
  "26": [
   "biss"
  ],
  "32": [
   "spiegelglanz"
  ],
  "37": [
   "verzoegerter_zerfall"
  ],
  "43": [
   "hammerfaust"
  ],
  "48": [
   "halbwertszeit"
  ]
 }
};

