// ============================================================
//  DIALOGE – Kapitel 1: Der Tag der grauen Reiter
//
//  Grundlage: drehbuch\kapitel-1.md. Schlüssel = "dialog"-Eigenschaft
//  der Objekte in den Karten. Format der Schritte: kern\ereignisse.js.
//
//  Leitlinie (25.10.2026): wenig Text, leicht verständlich. Schüler
//  wollen spielen; was das Spiel erklärt (Untersuchen, passendes
//  Fanggerät, die Flammen), bleibt, alles andere ist kurz. Höchstens
//  zwei, drei Sprechblasen je Besuch, kein Satz über 150 Zeichen
//  (prüft der Prüfstand).
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
//    flammenschein    Ilkas Prüfung (Quest 2b)
// ============================================================

// ---------- Bausteine ----------

var STOFFE_KAP1 = ["kohlenstoff", "kupfer", "zink", "schwefel", "eisen"];

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
    { einblenden: "starterwahl", text: schmiede
      ? "Ein Funke springt vom glühenden Eisen. Er wächst, bekommt Augen – und sieht dich an."
      : "Das Blatt-Amulett deiner Mutter blitzt auf. Etwas Silbriges schwebt vor dir." },
    { geben: { elemental: { art: art, stufe: 3 } } },
    { benennen: true },
    { setze: "starter", wert: art },
    { sag: schmiede ? "Vater" : "Mutter", text: "Dein erstes Elemental begleitet dich ein Leben lang. Lumi wartet auf dem Dorfplatz." }
  ];
}

// Labor: heilen, speichern, eine Zeile
function labor(zeile) {
  return [{ heilen: true }, { speichern: true }, { erzaehl: zeile + " Deine Elementals sind wieder bei Kräften. (Gespeichert.)" }];
}

var DIALOGE = {

  // ============================================================
  //  Stoffingen – Akt A: der Geburtstagsmorgen
  // ============================================================
  einstieg: [
    { erzaehl: "Vor langer Zeit erwachten die Stoffe zum Leben. Aus Stoff wurde Wesen: die Elementals." },
    { erzaehl: "Heute ist dein 12. Geburtstag in Stoffingen. Ab heute lernst du ein Handwerk: Schmiede oder Garten." }
  ],

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
      { sag: "Mutter", text: "Pass auf dich auf. Und komm zum Essen, wenn die Sonne sinkt." }
    ] }
  ],

  lumi: [
    { wennNicht: "starter", dann: [
      { sag: "Lumi", text: "Alles Gute! Schmiede oder Garten? Ich würde den Garten nehmen. Wegen der Erdbeeren." }
    ], sonst: [
      { wennNicht: "tutorial_fertig", dann: [
        { sag: "Lumi", text: "Du hast eins! Guck, ich auch: ein winziges Licht. Es heißt Funzel. Es ist mir einfach gefolgt." },
        { sag: "Lumi", text: "Da hinten im Gras flackert was. Scheuch es auf!" },
        { kampf: { art: "zink", stufe: 2, ort: "steppe", feld: { sauerstoff: 100, waerme: 20, feuchte: 30 } } },
        { wennGleich: ["letzter_kampf", "sieg"], dann: [
          { sag: "Lumi", text: "Weggelaufen! Funzel ist neidisch." }
        ], sonst: [
          { sag: "Lumi", text: "Zäher Brocken. Morgen gewinnst du." }
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
  //  ist Zeile 13, die Mutter kommt aus dem Garten (12, 7) durch die
  //  Lücke im Zaun bei (13, 9).
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
      { einblenden: "reiter_ankunft", text: "Graue Reiter. Niemand kennt sie." },
      { sag: "Anführer", text: "Alle Kinder. Aufsitzen." },
      { gehen: { wer: "reiter1", nach: [[18, 13], [16, 13]], parallel: true } },
      { gehen: { wer: "mutter", nach: [[13, 8], [13, 12], [15, 13]], tempo: 150 } },
      { zeichen: { wer: "mutter", art: "!" } },
      { sag: "Mutter", text: "Nicht mein Kind. Seit heute ist es ein Lehrling." },
      { zeichen: { wer: "anfuehrer", art: "…" } },
      { gehen: { wer: "reiter1", nach: [[18, 13], [20, 12]] } },
      { sag: "Anführer", text: "Die da." },
      { zeichen: { wer: "lumi", art: "!" } },
      { gehen: { wer: "reiter2", nach: [18, 13] } },
      { einblenden: "lumis_kolben", text: "Funzel wird in einen Kolben gesperrt. Versiegelt." },
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
      { einblenden: "leerer_dorfplatz", text: "Zu spät." }
    ], kurz: "Graue Reiter haben Lumi entführt. Hol sie zurück!" },

    // H3: der Abendtisch
    { welt: { zeit: "19:00" } },
    { film: [
      { sag: "Vater", text: "Du bleibst hier. Es ist zu gefährlich." },
      { einblenden: "grossmutters_buch" },
      { sag: "Vater", text: "Das war Großmutters Buch. Eines Tages gehört es dir." }
    ], kurz: "Die Eltern verbieten dir die Reise. Vater zeigt dir Großmutters Buch." },

    // H4: die Nacht. Die beiden Wahlen gelten auch beim Überspringen.
    { welt: { zeit: "23:00" } },
    { film: [
      { erzaehl: "Lumi hat niemanden außer dir." },
      { wahl: "In Mutters Werkstatt stehen saubere Reagenzgläser.", optionen: [
        { text: "Nimm sie mit.", dann: [{ geben: { vorrat: { reagenzglas: 3 } } }, { setze: "glaeser_genommen" }] },
        { text: "Lass sie stehen. Es sind ihre.", dann: [{ geben: { vorrat: { reagenzglas: 1 } } }, { setze: "glaeser_gelassen" }] }
      ] },
      { wahl: "Was schreibst du auf den Zettel für den Küchentisch?", optionen: [
        { text: "„Es tut mir leid. Ich muss Lumi holen …“", dann: [{ setze: "zettel", wert: 1 }] },
        { text: "„Ich bin nicht mehr nur ein Kind.“", dann: [{ setze: "zettel", wert: 2 }] },
        { text: "„Ich komme wieder. Mit Lumi.“", dann: [{ setze: "zettel", wert: 3 }] }
      ] },
      { erzaehl: "Großmutters Buch, erste Seite: „Erste Prüfung: der Markt von Stoffingen.“" },
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
        { sag: "Mara", text: "Alle fünf! Behalt das Werkzeug." },
        { geben: { vorrat: { reagenzglas: 2, spatel: 1 } } },
        { sag: "Mara", text: "Draußen flackern jetzt Lichter: wilde Elementals. Erst prüfen, dann bestimmen. Zum Mitnehmen brauchst du das passende Gerät." },
        { setze: "markt_fertig" },
        { setze: "schemen_frei" },
        { erzaehl: "Lumis Spur führt nach Osten, durch den Kolbenwald." }
      ], sonst: [
        { sag: "Mara", text: "Nach Osten, durch den Kolbenwald. Und iss was unterwegs." }
      ] }
    ] }
  ],

  mara_kisten: [].concat(
    kistenRaetsel("Mara", "Kiste 1: rötlich glänzende Bleche. Sie lassen sich biegen, und das Lämpchen leuchtet hell.", "kupfer", "kiste1",
      "Kupfer. Leitet den Strom wie kein Zweiter – darum sind Drähte aus Kupfer."),
    kistenRaetsel("Mara", "Kiste 2: schwarze, leichte Brocken, matt. Unter dem Hammer zerbröseln sie. Das Lämpchen leuchtet schwach.", "kohlenstoff", "kiste2",
      "Holzkohle, also Kohlenstoff. Leitet – und ist trotzdem kein Metall."),
    kistenRaetsel("Mara", "Kiste 3: zitronengelbes Pulver, ohne Glanz. Das Lämpchen bleibt dunkel.", "schwefel", "kiste3",
      "Schwefel. Ganz sicher kein Metall."),
    kistenRaetsel("Mara", "Kiste 4: graue, glänzende Nägel. Der Magnet hält sie fest.", "eisen", "kiste4",
      "Eisen. Der Einzige hier, den der Magnet festhält."),
    kistenRaetsel("Mara", "Kiste 5: bläulich-graue, glänzende Platten. Sie leiten, der Magnet wirkt nicht, und unter dem Hammer splittern sie.", "zink", "kiste5",
      "Zink. Kalt ist es spröde, warm lässt es sich formen.")
  ),

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
          { geben: { vorrat: { tiegelzange: 1 } } },
          { setze: "koehler_fertig" }
        ], sonst: [
          { sag: "Köhler Brand", text: "Nachts kommen manchmal schwarze Lichter aus dem Meiler. Bring mir eins." }
        ] }
      ] }
    ] }
  ],

  labor_stoffingen: [
    { wennNicht: "aufgebrochen", dann: labor("Mutters Werkstatt. Es riecht nach Salbe."),
      sonst: labor("Leise nimmst du etwas von Mutters Salbe.") }
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

  vitra: [
    { wenn: "geraetepass", dann: [
      { sag: "Meisterin Vitra", text: "Der Wagen nahm die Straße nach Brenner. Geh. Und zerbrich nichts." }
    ], sonst: alleFlags(["g_messzylinder", "g_tiegelzange", "g_reagenzglashalter", "g_reibeschale"], [
      { sag: "Meisterin Vitra", text: "Alle vier! Du kennst deine Werkzeuge." },
      { geben: { werkzeug: ["geraetepass", "erlenmeyerkolben"], vorrat: { tiegelzange: 2 } } },
      { sag: "Meisterin Vitra", text: "Die Tiegelzange ist für Metalle. Heißes greift man nie mit der Hand – auch kein Elemental." },
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
          { geben: { vorrat: { spatel: 2 } } },
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
            { sag: "Gildenmeisterin Ilka", text: "Richtig. Mehr Luft, mehr Sauerstoff, heißere Flamme. Teil drei: ein Kampf gegen mein Kupfer." },
            { kampf: { gegner: [{ art: "kupfer", stufe: 5 }], wild: false, name: "Gildenmeisterin Ilka", ort: "dorf",
                       feld: { sauerstoff: 100, waerme: 45, feuchte: 20 } } },
            { wennGleich: ["letzter_kampf", "sieg"], dann: [
              { sag: "Gildenmeisterin Ilka", text: "Bestanden. Kupfer leitet Wärme – wer mein Feld noch heißer macht, hilft ihm nur." },
              { geben: { werkzeug: ["gasbrenner"] } },
              { sag: "Gildenmeisterin Ilka", text: "Der Gasbrenner gibt deinem Elemental einmal pro Kampf Energie zum Zünden. Der Wagen fuhr durchs Osttor, Richtung Teilchin." },
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

  labor_brenner: labor("Das Labor der Gilde."),

  kind: [
    { wenn: "knopf_zurueck", dann: [
      { sag: "Kind", text: "Knopf schläft auf meinem Kissen. Mama findet das unhygienisch. Ist mir egal." }
    ], sonst: [
      { wenn: "knopf_gefunden", dann: [
        { sag: "Kind", text: "KNOPF! Da bist du ja!" },
        { sag: "Kind", text: "Danke. Mein Bruder ist auch weg – die grauen Reiter. Hier, das brauchst du mehr als ich." },
        { geben: { vorrat: { tiegelzange: 1 } } },
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
