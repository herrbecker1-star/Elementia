// ============================================================
//  DIALOGE – Kapitel 1: Der Tag der grauen Reiter
//
//  Grundlage: drehbuch\kapitel-1.md. Schlüssel = "dialog"-Eigenschaft
//  der Objekte in den Karten. Format der Schritte: kern\ereignisse.js.
//
//  Leitlinie (25.10.2026): leicht verständlich, kein Satz über 150
//  Zeichen (prüft der Prüfstand). Zwei Längen:
//   · Gespräche in der Welt: höchstens zwei, drei Sprechblasen je Besuch.
//   · Erzählszenen (Einstieg, H1–H4): 60–120 Wörter je Szene, der ganze
//     Anfang etwa 330 Wörter (≈ 3 Minuten Lesen). Die erste, stärker
//     gekürzte Fassung erklärte das Grundproblem nicht mehr – wer die
//     Reiter sind, dass sie Lumi gezielt suchen, warum Großmutters Buch
//     zählt. Höchstens 3–4 Blasen am Stück, dann passiert etwas.
//
//  Die harten Szenen H1–H4 (Reiter, Lumi, Abendtisch, Aufbruch) stehen
//  in "reiter_szenen", freigegeben am 25.10.2026. Leitlinie: zeigen statt
//  erzählen – die Figuren spielen die Szene auf der Karte, gesprochen
//  wird wenig, und jede Szene lässt sich überspringen (film/kurz).
//
//  Flags, die den Lauf der Geschichte tragen:
//    starter          "eisen" | "magnesium"
//    tutorial_fertig  Übungskampf mit Lumi
//    reiter_da        die Reiter waren da (Lumi weg)
//    aufgebrochen     heimlich losgegangen (Eltern schlafen)
//    markt_fertig     Maras Kisten (Quest 1) – öffnet den Weg nach Osten
//    schemen_frei     ab jetzt erscheinen Schemen
//    geraetepass      Vitras Prüfung (Quest 2)
//    flammenschein    Ilkas Prüfung (Quest 2b) – danach auch Gefäße herstellen
//    mutter_weiss     Mama hat nach dem Aufbruch in der Werkstatt gewartet
//    besiegt_<id>     Stoffmeister am Weg (Kolja, Rieke) – zahlen nur einmal
// ============================================================

// ---------- Bausteine ----------

var STOFFE_KAP1 = ["kohlenstoff", "kupfer", "zink", "schwefel", "eisen"];

// Ilkas Gruppe (seit Fassung 17), Reihenfolge = Auftritt im Kampf.
// Gemessen 29.10.2026 (200 Kämpfe je Zelle, Halle Wärme 30): Mit Aluminium
// auf Stufe 4 gewann Eisen St. 6 + Zink St. 5 nur 44 %. Mit Stufe 3 gewinnt
// der Starter auf Stufe 6 mit jedem Fang auf Stufe 5 zu 94–100 %, auf gleicher
// Stufe 5 bleibt es offen (Eisen 44–83 %, Magnesium 96–100 %).
var ILKAS_GRUPPE = [{ art: "kohlenstoff", stufe: 4 }, { art: "aluminium", stufe: 3 }, { art: "kupfer", stufe: 5 }];

// Eine Rätselkiste: Befund zeigen, raten lassen. Beim ersten Fehler
// nennt jemand den Widerspruch, beim zweiten die Lösung – ohne Schleife,
// aber auch ohne Sackgasse.
function kistenRaetsel(sprecher, befund, richtig, flag, lob) {
  var name = function (a) { return ARTEN[a].name; };
  function optionen(zweiter) {
    return STOFFE_KAP1.map(function (a) {
      if (a === richtig) return { text: name(a), dann: [{ sag: sprecher, text: lob }, { setze: flag }] };
      var falsch = ARTEN[a], wahr = ARTEN[richtig];
      var unterschied = ["magnetisch", "leitfaehig", "glanz", "verformbar"].filter(function (e) { return falsch.steckbrief[e] !== wahr.steckbrief[e]; })[0];
      var grund = unterschied
        ? name(a) + " wäre anders – " + ({
            magnetisch: falsch.steckbrief.magnetisch ? "der Magnet würde es festhalten." : "kein Magnet hält es fest.",
            leitfaehig: falsch.steckbrief.leitfaehig ? "es leitet den Strom." : "es leitet keinen Strom.",
            glanz: falsch.steckbrief.glanz ? "es glänzt metallisch." : "es ist matt.",
            verformbar: falsch.steckbrief.verformbar ? "es lässt sich hämmern, ohne zu brechen." : "es splittert unter dem Hammer."
          })[unterschied]
        : name(a) + " hat eine andere Farbe: " + falsch.steckbrief.farbe + ".";
      return { text: name(a), dann: zweiter
        ? [{ sag: sprecher, text: "Wieder nicht. " + grund + " Es ist " + name(richtig) + "." }, { setze: flag }]
        : [{ sag: sprecher, text: "Nein. " + grund }, { wahl: "Welcher Stoff ist es?", optionen: optionen(true) }] };
    });
  }
  return [{ erzaehl: befund }, { wahl: "Welcher Stoff ist es?", optionen: optionen(false) }];
}

// Eine Gerätefrage im Kolbenwald: drei Antworten, eine stimmt.
function geraetFrage(flag, geraet, richtig, falsch1, falsch2, erklaerung) {
  return [
    { wenn: flag, dann: [{ erzaehl: geraet + ": kennst du schon." }], sonst: [
      { wahl: geraet + " – wofür braucht man das?", optionen: [
        { text: falsch1, dann: [{ erzaehl: "Falsch. " + erklaerung }] },
        { text: richtig, dann: [{ erzaehl: "Richtig. " + erklaerung }, { setze: flag }] },
        { text: falsch2, dann: [{ erzaehl: "Falsch. " + erklaerung }] }
      ] }
    ] }
  ];
}

// Alle Flags gesetzt? Verschachtelt, weil Abläufe nur einzelne Flags prüfen.
function alleFlags(flags, dann, sonst) {
  var ablauf = dann;
  for (var i = flags.length - 1; i >= 0; i--) ablauf = [{ wenn: flags[i], dann: ablauf, sonst: sonst }];
  return ablauf;
}

// Die Starterwahl – aus Schmiede oder Garten
function starterWahl(art) {
  var schmiede = art === "eisen";
  return [
    { einblenden: schmiede ? "starterwahl_eisen" : "starterwahl_magnesium", text: schmiede
      ? "Ein Funke springt vom glühenden Eisen. Er wächst, bekommt Augen – und sieht dich an."
      : "Das Blatt-Amulett deiner Mutter blitzt auf. Etwas Silbriges schwebt vor dir." },
    // Seit Fassung 18 Stufe 4 (vorher 3): Dort lernt das Lernset den ersten
    // Angriff des eigenen Stoffs (Funkenflug, Aufflammen). Auf Stufe 3
    // verlor der Starter allein gegen Kolja immer (Messung 29.10.2026).
    { geben: { elemental: { art: art, stufe: 4, starter: true } } },
    { benennen: true },
    { setze: "starter", wert: art },
    { sag: schmiede ? "Vater" : "Mutter", text: "Dein erstes Elemental begleitet dich ein Leben lang. Lumi wartet auf dem Dorfplatz." }
  ];
}

// Seit Fassung 18: Neben jedem Elternteil steht sein Elemental. Spricht man
// es an, sieht man sein Bild – und kann es gleich wählen.
function starterAnsehen(art) {
  var a = ARTEN[art];
  return [
    { einblenden: "el-" + art, text: a.name + " · " + a.formel + " – " + (art === "eisen"
      ? "hart und schwer. Der Magnet hält es fest."
      : "leicht und silbrig. Es brennt heller als hundert Kerzen.") },
    { wahl: "Nimmst du " + a.name + "?", optionen: [
      { text: "Ja", dann: starterWahl(art) },
      { text: "Noch nicht", dann: [{ erzaehl: "Es sieht dir nach." }] }
    ] }
  ];
}

// Labor: heilen, speichern, eine Zeile
function labor(zeile) {
  return [{ heilen: true }, { speichern: true }, { erzaehl: zeile + " Deine Elementals sind wieder bei Kräften. (Gespeichert.)" }];
}

// Seit Fassung 17: Am Labortisch schmilzt man Glasbruch zu neuen Gefäßen –
// sobald man von Ilka den Bunsenbrenner hat (Flag flammenschein).
var GEFAESS_HERSTELLEN = [
  { wenn: "flammenschein", dann: [
    { wahl: "Gefäße aus Glasbruch herstellen?", optionen: [
      { text: "Ja", dann: [{ herstellen: true }] },
      { text: "Nein", dann: [] }
    ] }
  ] }
];

// Ein Stoffmeister am Wegrand: Man spricht ihn an, dann wird gekämpft.
// Nach dem Sieg zahlt er einmal und hat danach nur noch eine Zeile.
function stoffmeister(o) {
  var flag = "besiegt_" + o.id;
  return [
    { wenn: flag, dann: [{ sag: o.name, text: o.danach }], sonst: [
      { sag: o.name, text: o.gruss },
      { kampf: { gegner: o.gegner, wild: false, name: o.name, ort: o.ort || "wald" } },
      { wennGleich: ["letzter_kampf", "sieg"], dann: [
        { sag: o.name, text: o.sieg },
        { geben: { geld: o.geld } },
        { setze: flag }
      ], sonst: [
        { sag: o.name, text: "Komm wieder, wenn deine Elementals ausgeruht sind." }
      ] }
    ] }
  ];
}

// Glasbruch-Fundstelle im Kolbenwald
function glasbruch(id, menge) {
  return [{ fund: { id: id, ware: "glasbruch", menge: menge } }];
}

var DIALOGE = {

  // ============================================================
  //  Stoffingen – Akt A: der Geburtstagsmorgen
  // ============================================================
  einstieg: [
    // Seit Fassung 14 mit drei Bildern: Hadronenwolke → Erwachen → Elementia.
    { einblenden: "hadronenwolke", text: "Vor langer Zeit traf eine Hadronenwolke die Erde." },
    { einblenden: "erwachen", text: "Wo ihre Funken niedergingen, erwachten die Stoffe zum Leben: die Elementals." },
    { einblenden: "elementia", text: "Erst hatten die Menschen Angst. Dann lernten sie, in ganz Elementia mit ihnen zu leben. Wer sie versteht, heißt Stoffmeister." },
    { erzaehl: "Du lebst in Stoffingen, einem armen Dorf in den Feuerlanden. „Wer nichts hat, den lässt man in Ruhe“, sagt deine Mutter." },
    { erzaehl: "Heute ist dein 12. Geburtstag. Ab heute lernst du ein Handwerk: in Vaters Schmiede oder in Mutters Garten. Lumi wartet auf dem Dorfplatz." }
  ],

  starter_eisen: starterAnsehen("eisen"),
  starter_magnesium: starterAnsehen("magnesium"),

  vater: [
    { wennNicht: "starter", dann: [
      { sag: "Vater", text: "Eisen ist hart, stark und treu – der beste Stoff der Feuerlande." },
      { wahl: "Lernst du bei deinem Vater in der Schmiede?", optionen: [
        { text: "Ja – die Schmiede.", dann: starterWahl("eisen") },
        { text: "Ich schau mich noch um.", dann: [{ sag: "Vater", text: "Lass dir Zeit. Das Eisen läuft nicht weg. Dafür ist es zu schwer." }] }
      ] }
    ], sonst: [
      { wennGleich: ["starter", "eisen"], dann: [
        { sag: "Vater", text: "Pass auf dein Elemental auf. Und auf deine Finger." }
      ], sonst: [
        { sag: "Vater", text: "Der Garten also. Magnesium ist übrigens ein Metall, sagt deine Mutter. Ich hab nicht widersprochen." }
      ] }
    ] }
  ],

  mutter: [
    { wennNicht: "starter", dann: [
      { sag: "Mutter", text: "Alles Gute zum Zwölften! In jeder grünen Pflanze steckt ein Metall: Magnesium. Es brennt heller als hundert Kerzen." },
      { wahl: "Lernst du bei deiner Mutter im Garten?", optionen: [
        { text: "Ja – der Garten.", dann: starterWahl("magnesium") },
        { text: "Ich schau mich noch um.", dann: [{ sag: "Mutter", text: "Lass dir Zeit. Die Kräuter laufen nicht weg." }] }
      ] }
    ], sonst: [
      // Seit Fassung 17 heilt Mama die Elementals – vor dem Aufbruch im Garten.
      { sag: "Mutter", text: "Zeig mal her. So, alle wieder bei Kräften. Und komm zum Essen, wenn die Sonne sinkt." },
      { heilen: true }, { speichern: true }
    ] }
  ],

  // Nach dem heimlichen Aufbruch steht Mama in ihrer Werkstatt (Labor).
  // Sie hält dich nicht auf, aber sie heilt (Vorschlag A, 29.10.2026).
  mutter_werkstatt: [
    { wennNicht: "mutter_weiss", dann: [
      { sag: "Mutter", text: "Ich habe deinen Zettel gelesen. Ich halte dich nicht auf. Aber verletzt gehst du nicht." },
      { setze: "mutter_weiss" }
    ], sonst: [
      { sag: "Mutter", text: "Halt still. So. Und pass auf Lumi auf, wenn du sie findest." }
    ] },
    { heilen: true }, { speichern: true },
    { erzaehl: "Deine Elementals sind wieder bei Kräften. (Gespeichert.)" }
  ],

  lumi: [
    { wennNicht: "starter", dann: [
      { sag: "Lumi", text: "Alles Gute! Schmiede oder Garten? Ich würde den Garten nehmen. Wegen der Erdbeeren." }
    ], sonst: [
      { wennNicht: "tutorial_fertig", dann: [
        { erzaehl: "Lumi hat keine Eltern mehr. Du passt auf sie auf, seit du denken kannst. Ihr seid nicht verwandt, aber beste Freunde." },
        { sag: "Lumi", text: "Du hast eins! Ich hab das andere bekommen. Und Funzel, das kleine Licht hier, ist mir einfach gefolgt." },
        { sag: "Lumi", text: "Übungskampf? Meins gegen deins!" },
        // Lumi hat den Starter, den man nicht gewählt hat – Stufe 3 gegen deine 4,
        // ohne Starterbonus (Wunsch des Nutzers, Fassung 19). Bis Fassung 18
        // Stufe 1; Messung siehe Prüfstand 2d.
        { wennGleich: ["starter", "eisen"], dann: [
          { kampf: { gegner: [{ art: "magnesium", stufe: 3 }], wild: false, name: "Lumi", ort: "dorf" } }
        ], sonst: [
          { kampf: { gegner: [{ art: "eisen", stufe: 3 }], wild: false, name: "Lumi", ort: "dorf" } }
        ] },
        { wennGleich: ["letzter_kampf", "sieg"], dann: [
          { sag: "Lumi", text: "Gut! Funzel flackert vor Freude." }
        ], sonst: [
          { sag: "Lumi", text: "Ha! Morgen gewinnst du." }
        ] },
        { sag: "Lumi", text: "Tipp: Mit „Untersuchen“ findest du heraus, WAS es ist – Farbe, Glanz, Magnet, Strom." },
        { setze: "tutorial_fertig" },
        { ablauf: "reiter_szenen" }
      ], sonst: [
        { sag: "Lumi", text: "Funzel mag dich. Glaub ich. Es flackert immer, wenn du kommst." }
      ] }
    ] }
  ],

  // ============================================================
  //  Akt B – Die grauen Reiter (H1–H4)
  //  Gespielt statt erzählt: Die Figuren bewegen sich auf der Karte,
  //  gesprochen werden sieben kurze Sätze. Die Positionen sind Kacheln
  //  der Karte Stoffingen: Lumi steht auf (17, 12), der Weg nach Osten
  //  ist Zeile 13. Die Mutter steht seit Fassung 18 neben dem Vater
  //  (10, 5) und kommt an der Gartenecke vorbei über Spalte 9.
  // ============================================================
  reiter_szenen: [
    { welt: { zeit: "15:00" } },

    // H1 und H2: Die Reiter kommen und nehmen Lumi mit.
    { film: [
      { gehen: { wer: "held", nach: [14, 13] } },
      { erscheinen: { name: "anfuehrer", figur: 10, bei: [29, 13] } },
      { erscheinen: { name: "reiter1", figur: 9, bei: [30, 12] } },
      { erscheinen: { name: "reiter2", figur: 9, bei: [30, 14] } },
      { erscheinen: { name: "reiter3", figur: 9, bei: [31, 12] } },
      { erscheinen: { name: "wagen", bild: "wagen", bei: [33, 13] } },
      { gehen: { wer: "reiter1", nach: [20, 12], tempo: 120, parallel: true } },
      { gehen: { wer: "reiter2", nach: [19, 14], tempo: 120, parallel: true } },
      { gehen: { wer: "reiter3", nach: [22, 12], tempo: 120, parallel: true } },
      { gehen: { wer: "wagen", nach: [25, 13], tempo: 120, parallel: true } },
      { gehen: { wer: "anfuehrer", nach: [[22, 13], [21, 14]], tempo: 120 } },
      { zeichen: { wer: "held", art: "!" } },
      { zeichen: { wer: "lumi", art: "!" } },
      { einblenden: "reiter_ankunft", text: "Graue Reiter. Auf den Schilden ein grauer Reiher. Niemand kennt sie." },
      { erzaehl: "Der Anführer mustert die Kinder. Ruhig und langsam, als suche er etwas ganz Bestimmtes." },
      { sag: "Anführer", text: "Alle Kinder des Dorfes. Aufsitzen." },
      { erzaehl: "Sie sind nicht grob. Sie haken ab wie auf einer Liste. Der Sohn des Köhlers. Die Mädchen vom Kerzenzieher." },
      { gehen: { wer: "reiter1", nach: [[18, 13], [16, 13]], parallel: true } },
      { gehen: { wer: "mutter", nach: [[9, 5], [9, 13], [15, 13]], tempo: 150 } },
      { zeichen: { wer: "mutter", art: "!" } },
      { sag: "Mutter", text: "Nicht mein Kind. Zwölf Jahre, seit heute früh. Das ist kein Kind mehr, das ist ein Lehrling." },
      { zeichen: { wer: "anfuehrer", art: "…" } },
      { erzaehl: "Der Anführer nickt knapp, als striche er eine Zeile durch." },
      { gehen: { wer: "reiter1", nach: [[18, 13], [20, 12]] } },
      { sag: "Anführer", text: "Die da. Die vor allen anderen." },
      { zeichen: { wer: "lumi", art: "!" } },
      { gehen: { wer: "reiter2", nach: [18, 13] } },
      { einblenden: "lumis_kolben", text: "Funzel kommt in einen Kolben. Versiegelt." },
      { sag: "Anführer", text: "Sie kommt mit uns. Zu ihrem eigenen Besten." },
      { gehen: { wer: "lumi", nach: [[17, 13], [24, 13]], parallel: true } },
      { gehen: { wer: "reiter2", nach: [23, 13] } },
      { verschwinden: "lumi" },
      { setze: "reiter_da" },
      // Der Fehlschlag zum Selberspielen: Man rennt hinterher und kommt nie an.
      { gehen: { wer: "anfuehrer", nach: [[22, 13], [44, 13]], tempo: 140, parallel: true } },
      { gehen: { wer: "reiter1", nach: [[23, 12], [44, 12]], tempo: 140, parallel: true } },
      { gehen: { wer: "reiter2", nach: [[23, 14], [44, 14]], tempo: 140, parallel: true } },
      { gehen: { wer: "reiter3", nach: [44, 12], tempo: 140, parallel: true } },
      { verfolgen: { wer: "wagen", nach: [41, 13] } },
      { einblenden: "leerer_dorfplatz", text: "Du greifst nach Lumis Hand. Du bekommst nur Luft zu fassen." }
    ], kurz: "Graue Reiter haben die Kinder mitgenommen, und Lumi haben sie gezielt gesucht. Niemand weiß, warum. Hol sie zurück!" },

    // H3: der Abendtisch
    { welt: { zeit: "19:00" } },
    { film: [
      { erzaehl: "In halb Stoffingen fehlt heute ein Kind. Niemand versteht, was die Reiter wollen. Und warum gerade Lumi?" },
      { erzaehl: "„Ich hole sie zurück“, sagst du." },
      { sag: "Mutter", text: "Nein. Zwölf Reiter mit Waffen, und du bist heute zwölf geworden. Du bleibst hier." },
      { sag: "Vater", text: "Es ist zu gefährlich. Kein Wort mehr davon." },
      { einblenden: "grossmutters_buch", text: "Dann legt Vater ein altes Buch auf den Tisch." },
      { sag: "Vater", text: "Großmutters Buch. Sie war Stoffmeisterin. Sie sagte: Wer die Stoffe versteht, den kann niemand täuschen." },
      { sag: "Vater", text: "Eines Tages, wenn du älter bist, gehört es dir." }
    ], kurz: "Deine Eltern verbieten dir die Reise. Vater zeigt dir Großmutters Buch. Sie war Stoffmeisterin." },

    // H4: die Nacht. Die beiden Wahlen gelten auch beim Überspringen.
    { welt: { zeit: "23:00" } },
    { film: [
      { erzaehl: "Du liegst wach. Lumi hat niemanden außer dir. Und „eines Tages“ ist zu spät." },
      { wahl: "In Mutters Werkstatt stehen saubere Reagenzgläser.", optionen: [
        { text: "Nimm sie mit.", dann: [{ geben: { vorrat: { reagenzglas: 3 } } }, { setze: "glaeser_genommen" }] },
        { text: "Lass sie stehen. Es sind ihre.", dann: [{ geben: { vorrat: { reagenzglas: 1 } } }, { setze: "glaeser_gelassen" }] }
      ] },
      { wahl: "Was schreibst du auf den Zettel für den Küchentisch?", optionen: [
        { text: "„Es tut mir leid. Ich muss Lumi holen …“", dann: [{ setze: "zettel", wert: 1 }] },
        { text: "„Ich bin nicht mehr nur ein Kind.“", dann: [{ setze: "zettel", wert: 2 }] },
        { text: "„Ich komme wieder. Mit Lumi.“", dann: [{ setze: "zettel", wert: 3 }] }
      ] },
      { erzaehl: "Großmutters Buch, erste Seite: „Willst du einen Stoff besiegen, dann lerne ihn erst kennen.“" },
      { erzaehl: "Darunter in alter Tinte: „Erste Prüfung: der Markt von Stoffingen.“" },
      { welt: { zeit: "05:30", wetter: "nebel" } },
      { setze: "aufgebrochen" }
    ], kurz: "Du brichst heimlich auf. Erstes Ziel: der Markt." }
  ],

  // ============================================================
  //  Stoffingen – Akt C: der Markt (Quest 1) und der Köhler
  // ============================================================
  mara: [
    { wennNicht: "reiter_da", dann: [
      { sag: "Mara", text: "Kupfer, Zink, Holzkohle, Schwefel – alles beschriftet. Finger weg vom gelben Pulver: Es stinkt beim Anzünden." }
    ], sonst: [
      { wennNicht: "markt_fertig", dann: [
        { sag: "Mara", text: "Die Reiter haben meine Kisten durchwühlt. Jetzt fehlen alle Schilder. Hilf mir sortieren!" },
        { sag: "Mara", text: "Hier: Lupe, Magnet, Lämpchen, Hammer. Damit erkennst du jeden Stoff an seinen Eigenschaften." },
        { geben: { werkzeug: ["lupe", "magnet", "stromkreis", "hammer"] } },
        { ablauf: "mara_kisten" },
        { sag: "Mara", text: "Alle fünf! Behalt das Werkzeug. Und hier, dein Lohn." },
        { geben: { vorrat: { reagenzglas: 3 }, geld: 30 } },
        { sag: "Mara", text: "Draußen flackern jetzt Lichter: wilde Elementals. Erst prüfen, dann bestimmen. Mitnehmen kannst du sie im Reagenzglas." },
        { setze: "markt_fertig" },
        { setze: "schemen_frei" },
        { erzaehl: "Lumis Spur führt nach Osten, durch den Kolbenwald." }
      ], sonst: [
        // Seit Fassung 17 Marktstand: Gläser und Kältemischung, Ankauf von Glasbruch
        { sag: "Mara", text: "Reagenzgläser, Kältemischung – und Glasbruch kaufe ich dir ab. Der Kolbenwald ist voll davon." },
        { handel: "stoffingen" },
        { sag: "Mara", text: "Nach Osten, durch den Kolbenwald. Und iss was unterwegs." }
      ] }
    ] }
  ],

  // Seit 25.10.2026 ein Minispiel (Werkbank, kern\werkbank.js): prüfen
  // mit Lupe, Magnet, Lämpchen und Hammer, dann zum Stoff legen.
  mara_kisten: [
    { minispiel: "werkbank", sprecher: "Mara", proben: [
      { stoff: "kupfer", flag: "kiste1", lob: "Kupfer. Leitet den Strom wie kein Zweiter – darum sind Drähte aus Kupfer." },
      { stoff: "kohlenstoff", flag: "kiste2", lob: "Holzkohle, also Kohlenstoff. Leitet – und ist trotzdem kein Metall." },
      { stoff: "schwefel", flag: "kiste3", lob: "Schwefel. Ganz sicher kein Metall." },
      { stoff: "eisen", flag: "kiste4", lob: "Eisen. Der Einzige hier, den der Magnet festhält." },
      { stoff: "zink", flag: "kiste5", lob: "Zink. Kalt ist es spröde, warm lässt es sich formen." }
    ] }
  ],

  koehler: [
    { wennNicht: "reiter_da", dann: [
      { sag: "Köhler Brand", text: "Holz rein, Luft raus. Wer den Meiler zu früh öffnet, hat Asche statt Kohle." }
    ], sonst: [
      { wenn: "koehler_fertig", dann: [
        { sag: "Köhler Brand", text: "Die Glut hält. Danke." }
      ], sonst: [
        { sag: "Köhler Brand", text: "Sie haben meinen Jungen mitgenommen. Er hat nachts die Glut bewacht. Jetzt schläft sie mir ein." },
        { wennElemental: "kohlenstoff", dann: [
          { erzaehl: "Dein Kohlenstoff-Elemental schwebt zum Meiler. Die Glut wacht auf." },
          { sag: "Köhler Brand", text: "Es kennt seinen Ort. Holzkohle entsteht, wenn Holz ohne Luft erhitzt wird. Hier, für dein Buch." },
          { erzaehl: "Buchseite „Verkohlung“: Holz ohne Luft erhitzt wird zu Holzkohle. Mit Luft verbrennt es zu Asche." },
          { sag: "Köhler Brand", text: "Und nimm meine alte Tiegelzange. Im Labor wirst du sie brauchen." },
          { geben: { werkzeug: ["tiegelzange"] } },
          { setze: "koehler_fertig" }
        ], sonst: [
          { sag: "Köhler Brand", text: "Nachts kommen manchmal schwarze Lichter aus dem Meiler. Bring mir eins." }
        ] }
      ] }
    ] }
  ],

  // ---------- Das Labor von Stoffingen: Mutters Werkstatt (seit Fassung 17 ein Raum) ----------
  // Heilen tut hier Mama (mutter / mutter_werkstatt). Der Tisch dient dem Glas.
  labortisch_stoffingen: [
    { erzaehl: "Mutters Labortisch. Es riecht nach Salbe. Heilen tut hier Mama." }
  ].concat(GEFAESS_HERSTELLEN),

  abzug: [{ abzug: true }],

  regal: [
    { erzaehl: "Ein Regal voller Gläser, jedes beschriftet. Ordnung ist die halbe Chemie." }
  ],

  schild_ost: [
    { erzaehl: "Ein Schild: „Nach Osten – Kolbenwald.“" }
  ],

  meiler: [
    { erzaehl: "Der Meiler qualmt. Darin wird Holz ohne Luft erhitzt, bis Holzkohle übrig bleibt." }
  ],

  ausgang_gesperrt_stoffingen: [
    { wennNicht: "reiter_da", dann: [
      { erzaehl: "Heute ist dein Geburtstag. Erst ein Handwerk wählen, dann Lumi finden." }
    ], sonst: [
      { erzaehl: "Großmutters Buch sagt: Erste Prüfung ist der Markt. Mara steht am Dorfplatz." }
    ] }
  ],

  // ============================================================
  //  Kolbenwald – Akt D (Quest 2) und die Rätselkiste
  // ============================================================
  kolbenwald_ankunft: [
    { erzaehl: "Der Kolbenwald: Gläserne Kolben hängen wie Früchte in den Bäumen. Weiter östlich wacht Meisterin Vitra." }
  ],

  // Seit Fassung 17: zwei Stoffmeister am Weg und vier Stellen mit Glasbruch
  kolja: stoffmeister({ id: "kolja", name: "Geselle Kolja",
    gruss: "Ich bin Geselle bei der Gerätemacher-Gilde. Zeig mal, was deine Elementals können!",
    gegner: [{ art: "zink", stufe: 3 }, { art: "kohlenstoff", stufe: 4 }],
    sieg: "Nicht schlecht. Hier, dein Preisgeld.",
    danach: "Glasbruch liegt hier überall. Mara in Stoffingen kauft ihn dir ab.",
    geld: 60 }),

  rieke: stoffmeister({ id: "rieke", name: "Sammlerin Rieke",
    gruss: "Ich sammle, was an der warmen Quelle wächst. Mal sehen, ob du mithältst!",
    gegner: [{ art: "schwefel", stufe: 4 }, { art: "bor", stufe: 5 }],
    sieg: "Du hast Fleiß. Das hier hast du dir verdient.",
    danach: "An der Quelle riecht es nach faulen Eiern. Das ist Schwefelwasserstoff.",
    geld: 80 }),

  glasbruch_1: glasbruch("kw1", 2),
  glasbruch_2: glasbruch("kw2", 1),
  glasbruch_3: glasbruch("kw3", 2),
  glasbruch_4: glasbruch("kw4", 1),

  vitra: [
    { wenn: "geraetepass", dann: [
      { sag: "Meisterin Vitra", text: "Der Wagen nahm die Straße nach Brenner. Geh. Und zerbrich nichts." }
    ], sonst: alleFlags(["g_messzylinder", "g_tiegelzange", "g_reagenzglashalter", "g_reibeschale"], [
      { sag: "Meisterin Vitra", text: "Alle vier! Du kennst deine Werkzeuge." },
      { geben: { werkzeug: ["geraetepass", "messzylinder"], vorrat: { erlenmeyerkolben: 2 } } },
      { sag: "Meisterin Vitra", text: "Ein Erlenmeyerkolben steht fest und fängt besser als ein Reagenzglas. Den Messzylinder brauchst du im Labor." },
      { setze: "geraetepass" },
      { sag: "Meisterin Vitra", text: "Der Wagen der Reiter fuhr nach Brenner. Mit einem leuchtenden Kolben an Bord." }
    ], [
      { sag: "Meisterin Vitra", text: "Vier Geräte hängen in meinem Wald, jedes mit einer Frage. Beantworte alle vier, dann darfst du durch." }
    ]) }
  ],

  geraet_messzylinder: geraetFrage("g_messzylinder", "Messzylinder",
    "Eine Flüssigkeit genau abmessen", "Einen Stoff zu Pulver zerreiben", "Ein heißes Gefäß greifen",
    "Der Messzylinder misst Flüssigkeiten. Abgelesen wird in Augenhöhe, am unteren Rand der Wölbung."),
  geraet_tiegelzange: geraetFrage("g_tiegelzange", "Tiegelzange",
    "Ein heißes Gefäß oder einen Tiegel greifen", "Ein Reagenzglas beim Erhitzen halten", "Eine Flüssigkeit umfüllen",
    "Die Tiegelzange greift heiße Tiegel und Schalen. Für Reagenzgläser gibt es den Halter."),
  geraet_reagenzglashalter: geraetFrage("g_reagenzglashalter", "Reagenzglashalter",
    "Ein heißes Reagenzglas festhalten", "Einen heißen Tiegel greifen", "Pulver portionieren",
    "Ein Reagenzglas hält man beim Erhitzen nie mit den Fingern."),
  geraet_reibeschale: geraetFrage("g_reibeschale", "Reibeschale mit Pistill",
    "Einen festen Stoff zu Pulver zerreiben", "Eine Lösung eindampfen", "Eine Flüssigkeit genau abmessen",
    "Mit dem Pistill zerreibt man feste Stoffe zu Pulver."),

  raetselkiste: [
    { wenn: "kiste_offen", dann: [
      { erzaehl: "Die leere Kiste der Reiter." }
    ], sonst: [
      { erzaehl: "Eine verlorene Kiste der Reiter. Ein Zettel: „Nur wer die Stoffe erkennt, darf sie öffnen.“ Vier Säcke, keine Schilder." },
      { ablauf: "kiste_saecke" },
      { wahl: "Letzte Frage: Welcher Stoff darf nicht achtlos ins Lagerfeuer?", optionen: [
        { text: "Kupfer", dann: [{ erzaehl: "Das Schloss bleibt zu. Kupfer glüht nur und läuft schwarz an." }] },
        { text: "Schwefel", dann: [
          { erzaehl: "Klick! Brennender Schwefel bildet stechendes Schwefeldioxid." },
          { erzaehl: "In der Kiste: eine Kinderzeichnung mit einem kleinen „L“. Und ein Befehl: „Kommandant Bonardt verlangt: alle Kinder nach Osten.“" },
          { geben: { geld: 50 } },
          { setze: "kiste_offen" }, { setze: "bonardt_bekannt" }
        ] },
        { text: "Eisen", dann: [{ erzaehl: "Das Schloss bleibt zu. Eisen glüht nur." }] }
      ] }
    ] }
  ],

  kiste_saecke: [].concat(
    kistenRaetsel("Die Kiste", "Sack A: rötlich glänzend, gut verformbar, leitet den Strom hervorragend.", "kupfer", "sack_a", "Das Schloss klickt einmal."),
    kistenRaetsel("Die Kiste", "Sack B: schwarz, leicht, brüchig. Riecht nach Lagerfeuer.", "kohlenstoff", "sack_b", "Das Schloss klickt zweimal."),
    kistenRaetsel("Die Kiste", "Sack C: zitronengelbes Pulver, leitet keinen Strom.", "schwefel", "sack_c", "Das Schloss klickt dreimal."),
    kistenRaetsel("Die Kiste", "Sack D: grau glänzend – ein Magnet zieht es an.", "eisen", "sack_d", "Das Schloss klickt ein viertes Mal.")
  ),

  ausgang_gesperrt_kolbenwald: [
    { sag: "Meisterin Vitra", text: "Halt! Ohne Gerätepass kommt hier niemand durch. Vier Geräte, vier Fragen." }
  ],

  // ============================================================
  //  Brenner – Akt E (Quest 2b) und das verirrte Elemental
  // ============================================================
  brenner_ankunft: [
    { erzaehl: "Die Stadt Brenner. Hier sitzt die Gilde der Flammenwächter." }
  ],

  ilka: [
    { wenn: "flammenschein", dann: [
      { sag: "Gildenmeisterin Ilka", text: "Der Wagen fuhr durchs Osttor, Richtung Teilchin. Und jetzt raus, bevor du hier etwas anzündest." }
    ], sonst: [
      { sag: "Gildenmeisterin Ilka", text: "Mit einem Feuerwesen durch die Feuerlande? Erst den Flammenschein! Teil eins: die Reihenfolge." },
      { ablauf: "ilka_reihenfolge" },
      { wenn: "brenner_teil1", dann: [
        { wahl: "Teil zwei: Welche Flamme nimmt man zum Arbeiten?", optionen: [
          { text: "Die leuchtende – sie ist heller.", dann: [{ sag: "Gildenmeisterin Ilka", text: "Hell heißt nicht heiß. Die leuchtende ist die Sparflamme: Luft zu, gelb, rußig. Komm wieder." }] },
          { text: "Die rauschende – Luftzufuhr offen.", dann: [
            { sag: "Gildenmeisterin Ilka", text: "Richtig. Mehr Luft, mehr Sauerstoff, heißere Flamme. Teil drei: ein Kampf gegen meine drei." },
            // Seit Fassung 17 drei Elementals (Vorgabe des Autors): Kohlenstoff
            // (Kristall), Aluminium (Leichtmetall), Kupfer (Stahl) zuletzt.
            // Kupfer und Aluminium sieht man hier zum ersten Mal – fangen kann
            // man sie erst in den Clans der Erzhügel. Stufen gemessen, siehe LIESMICH.
            { kampf: { gegner: ILKAS_GRUPPE, wild: false, name: "Gildenmeisterin Ilka", ort: "dorf" } },
            { wennGleich: ["letzter_kampf", "sieg"], dann: [
              { sag: "Gildenmeisterin Ilka", text: "Bestanden. Kristall, Leichtmetall, Stahl – du hast alle drei bezwungen." },
              { geben: { werkzeug: ["gasbrenner"], geld: 150 } },
              { sag: "Gildenmeisterin Ilka", text: "Der Bunsenbrenner gibt deinem Elemental einmal pro Kampf Energie. Im Labor schmilzt du damit Glas." },
              { sag: "Gildenmeisterin Ilka", text: "Der Wagen fuhr durchs Osttor, Richtung Teilchin." },
              { setze: "flammenschein" }
            ], sonst: [
              { sag: "Gildenmeisterin Ilka", text: "Nicht bestanden. Ruh dich aus und komm wieder." }
            ] }
          ] }
        ] }
      ] }
    ] }
  ],

  // Die Schritte zum Entzünden, einer nach dem anderen. Ein Fehler, und Ilka
  // schickt dich zurück – pedantisch, aber sie hat recht.
  ilka_reihenfolge: [
    { wahl: "Was kommt zuerst?", optionen: [
      { text: "Gashahn am Tisch öffnen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Erst Brille auf, Haare zurück, Platz frei. Noch mal von vorn." }] },
      { text: "Schutzbrille auf, Haare zurück, Platz frei", dann: [
        { wahl: "Und dann?", optionen: [
          { text: "Luftzufuhr am Brenner schließen", dann: [
            { wahl: "Dann?", optionen: [
              { text: "Streichholz an den Brenner halten", dann: [{ sag: "Gildenmeisterin Ilka", text: "Es kommt ja noch kein Gas. Erst der Gashahn. Von vorn." }] },
              { text: "Gashahn am Tisch öffnen", dann: [
                { wahl: "Dann?", optionen: [
                  { text: "Streichholz entzünden, seitlich an den Brennerrand halten", dann: [
                    { wahl: "Und zuletzt?", optionen: [
                      { text: "Gaszufuhr am Brenner langsam öffnen", dann: [
                        { sag: "Gildenmeisterin Ilka", text: "Richtig. Die Flamme brennt – leuchtend, weil die Luftzufuhr noch zu ist." },
                        { setze: "brenner_teil1" }
                      ] },
                      { text: "Luftzufuhr ganz aufdrehen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Ohne Gas brennt nichts. Erst die Gaszufuhr. Von vorn." }] }
                    ] }
                  ] },
                  { text: "Gaszufuhr am Brenner öffnen und warten", dann: [{ sag: "Gildenmeisterin Ilka", text: "Dann strömt Gas aus, während du suchst. Erst die Flamme bereithalten. Von vorn." }] }
                ] }
              ] }
            ] }
          ] },
          { text: "Luftzufuhr ganz öffnen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Dann schlägt die Flamme beim Zünden zurück. Erst schließen. Von vorn." }] }
        ] }
      ] }
    ] }
  ],

  // Seit Fassung 17 ein Raum mit Labortisch und Abzug
  labortisch_brenner: labor("Der Labortisch der Gilde.").concat(GEFAESS_HERSTELLEN),

  // Der Händler auf dem Marktplatz von Brenner
  funke: [
    { sag: "Händler Funke", text: "Gläser für Stoffmeister! Und wer Scherben hat, bekommt bei mir Geld dafür." },
    { handel: "brenner" }
  ],

  kind: [
    { wenn: "knopf_zurueck", dann: [
      { sag: "Kind", text: "Knopf schläft auf meinem Kissen. Mama findet das unhygienisch. Ist mir egal." }
    ], sonst: [
      { wenn: "knopf_gefunden", dann: [
        { sag: "Kind", text: "KNOPF! Da bist du ja!" },
        { sag: "Kind", text: "Danke. Mein Bruder ist auch weg – die grauen Reiter. Hier, das brauchst du mehr als ich." },
        { geben: { vorrat: { rundkolben: 1 } } },
        { setze: "knopf_zurueck" }
      ], sonst: [
        { sag: "Kind", text: "Hast du Knopf gesehen? Mein Elemental. Klein, bläulich, ein bisschen feige. Er ist zum Brunnen gelaufen." },
        { setze: "knopf_gesucht" }
      ] }
    ] }
  ],

  brunnen: [
    { wennNicht: "knopf_gesucht", dann: [
      { erzaehl: "Der Brunnen von Brenner. Das Wasser ist kühl und klar." }
    ], sonst: [
      { wenn: "knopf_gefunden", dann: [{ erzaehl: "Knopf ist bei seinem Kind." }], sonst: [
        { erzaehl: "Hinter dem Brunnen zittert ein kleines Licht. Du prüfst es: glänzend, bläulich-grau. Magnet: nichts. Das Lämpchen leuchtet." },
        { wahl: "Welcher Stoff ist Knopf?", optionen: [
          { text: "Eisen", dann: [{ erzaehl: "Das Licht weicht zurück. Eisen hätte der Magnet gepackt." }] },
          { text: "Zink", dann: [
            { erzaehl: "„Knopf?“ Das Licht hört auf zu zittern und kommt zu dir." },
            { setze: "knopf_gefunden" }
          ] },
          { text: "Kupfer", dann: [{ erzaehl: "Das Licht weicht zurück. Kupfer wäre rötlich." }] }
        ] }
      ] }
    ] }
  ],

  ausgang_gesperrt_brenner: [
    { erzaehl: "Die Torwache: „Ohne Flammenschein lässt dich niemand mit einem Feuerwesen hinaus. Frag Gildenmeisterin Ilka.“" }
  ],

  abspann_kapitel1: [
    { wenn: "bonardt_bekannt",
      dann: [{ einblenden: "aufbruch", text: "Irgendwo dort im Osten ist Lumi. Und ein Mann, der Bonardt heißt." }],
      sonst: [{ einblenden: "aufbruch", text: "Irgendwo dort im Osten ist Lumi. Und der Anführer mit dem grauen Reiher auf dem Schild." }] },
    { setze: "kapitel1_fertig" },
    { erzaehl: "Ende von Kapitel 1. Fortsetzung: Teilchin." },
    { speichern: true }
  ]
};
