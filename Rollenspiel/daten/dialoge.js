// ============================================================
//  DIALOGE – Kapitel 1: Der Tag der grauen Reiter
//
//  Grundlage: drehbuch\kapitel-1.md. Schlüssel = "dialog"-Eigenschaft
//  der Objekte in den Karten. Format der Schritte: kern\ereignisse.js.
//
//  Die harten Szenen H1–H4 (Reiter, Lumi, Abendtisch, Aufbruch) stehen
//  in "reiter_szenen" nur als Platzhalter – sie werden erst nach der
//  Freigabe durch den Autor eingesetzt.
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
        ? name(a) + " würde sich anders verhalten – " + ({
            magnetisch: falsch.steckbrief.magnetisch ? "der Magnet würde es festhalten." : "kein Magnet hält es fest.",
            leitfaehig: falsch.steckbrief.leitfaehig ? "es leitet den Strom." : "es leitet keinen Strom.",
            glanz: falsch.steckbrief.glanz ? "es glänzt metallisch." : "es ist matt.",
            verformbar: falsch.steckbrief.verformbar ? "es lässt sich hämmern, ohne zu brechen." : "es splittert unter dem Hammer."
          })[unterschied]
        : name(a) + " hat eine andere Farbe: " + falsch.steckbrief.farbe + ".";
      return { text: name(a), dann: zweiter
        ? [{ sag: sprecher, text: "Wieder nicht. " + grund + " Es ist " + name(richtig) + ". Merk's dir – das nächste Mal fragt dich keiner." }, { setze: flag }]
        : [{ sag: sprecher, text: "Nein. " + grund + " Schau noch mal hin." }, { wahl: "Welcher Stoff ist es?", optionen: optionen(true) }] };
    });
  }
  return [{ erzaehl: befund }, { wahl: "Welcher Stoff ist es?", optionen: optionen(false) }];
}

// Eine Gerätefrage im Kolbenwald: drei Antworten, eine stimmt.
function geraetFrage(flag, geraet, frage, richtig, falsch1, falsch2, erklaerung) {
  return [
    { wenn: flag, dann: [{ erzaehl: "Der " + geraet + " klingt leise im Wind. Den kennst du jetzt." }], sonst: [
      { erzaehl: "An einem Ast hängt ein " + geraet + ". Ein Schild von Meisterin Vitra: „" + frage + "“" },
      { wahl: frage, optionen: [
        { text: falsch1, dann: [{ erzaehl: "Das Glas klirrt missbilligend. Falsch. " + erklaerung }] },
        { text: richtig, dann: [{ erzaehl: "Richtig. " + erklaerung }, { setze: flag }] },
        { text: falsch2, dann: [{ erzaehl: "Das Glas klirrt missbilligend. Falsch. " + erklaerung }] }
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
      ? "Ein Funke springt vom glühenden Eisen über. Er wächst, bekommt Augen – und sieht dich an."
      : "Das alte Blatt-Amulett deiner Mutter blitzt hell auf. Etwas Silbrig-Grünes schwebt vor dir." },
    { erzaehl: schmiede
      ? "Ein eisenrotes Elemental ist aus dem Schmiedefeuer geboren. Es hat dich ausgewählt."
      : "Ein silbrig-grünes Elemental ist aus dem Garten erwacht. Es hat dich ausgewählt." },
    { geben: { elemental: { art: art, stufe: 3 } } },
    { benennen: true },
    { setze: "starter", wert: art },
    { sag: schmiede ? "Vater" : "Mutter", text: "Man sagt, das erste Elemental eines Stoffmeisters begleitet ihn ein Leben lang – und am Ende der Reise wächst es über sich hinaus." },
    { erzaehl: "Lumi wartet sicher schon auf dem Dorfplatz." }
  ];
}

var DIALOGE = {

  // ============================================================
  //  Stoffingen – Akt A: der Geburtstagsmorgen
  // ============================================================
  einstieg: [
    { erzaehl: "In früher Zeit traf eine Hadronenwolke die Erde. Wo ihre Funken niedergingen, erwachten die Elemente zum Leben – aus Stoff wurde Wesen." },
    { erzaehl: "Zuerst fürchteten sich die Menschen vor diesen Elementals. Doch dann lernten sie, mit ihnen zu leben. Unsere Geschichte beginnt im fernen Westen, in den kargen Feuerlanden … in einem kleinen Dorf namens Stoffingen." },
    { erzaehl: "Heute ist dein zwölfter Geburtstag. In den Feuerlanden heißt das: Ab jetzt lernst du ein Handwerk – das deines Vaters in der Schmiede oder das deiner Mutter im Garten." }
  ],

  vater: [
    { wennNicht: "starter", dann: [
      { sag: "Vater", text: "Hörst du das? Das Eisen singt, wenn es die richtige Hitze hat. Hellrot ist zu früh, gelb ist gut, weiß ist zu spät." },
      { sag: "Vater", text: "Eisen ist der treueste Stoff der Feuerlande: hart, stark und ehrlich." },
      { wahl: "Lernst du bei deinem Vater in der Schmiede?", optionen: [
        { text: "Ja – die Schmiede.", dann: starterWahl("eisen") },
        { text: "Ich schau mich noch um.", dann: [{ sag: "Vater", text: "Lass dir Zeit. Das Eisen läuft nicht weg. Es ist viel zu schwer dafür." }] }
      ] }
    ], sonst: [
      { wennGleich: ["starter", "eisen"], dann: [
        { sag: "Vater", text: "Pass auf dein Elemental auf. Und auf deine Finger. In genau dieser Reihenfolge – das Elemental wächst nicht nach." }
      ], sonst: [
        { sag: "Vater", text: "Der Garten also. Deine Mutter hat mir gerade eine halbe Stunde lang erklärt, dass Magnesium ein Metall ist. Ich hab nicht widersprochen. Man lernt dazu." }
      ] }
    ] }
  ],

  mutter: [
    { wennNicht: "starter", dann: [
      { sag: "Mutter", text: "Da ist ja unser Geburtstagskind! Zwölf Jahre. Du hast bei deiner Geburt geschrien wie ein Blasebalg." },
      { sag: "Mutter", text: "In jeder grünen Pflanze steckt ein silbriges Metall: Magnesium. Wenn es brennt, leuchtet es heller als hundert Kerzen." },
      { wahl: "Lernst du bei deiner Mutter im Garten?", optionen: [
        { text: "Ja – der Garten.", dann: starterWahl("magnesium") },
        { text: "Ich schau mich noch um.", dann: [{ sag: "Mutter", text: "Lass dir Zeit. Die Kräuter laufen nicht weg." }] }
      ] }
    ], sonst: [
      { sag: "Mutter", text: "Pass auf dich auf, hörst du? Und komm zum Essen, wenn die Sonne sinkt." }
    ] }
  ],

  lumi: [
    { wennNicht: "starter", dann: [
      { sag: "Lumi", text: "Alles Gute! Ich hab dir was mitgebracht: einen Stein. Er sieht aus wie ein Brot. Du musst ihn nicht essen." },
      { sag: "Lumi", text: "Hast du schon gewählt? Schmiede oder Garten? Ich würde den Garten nehmen. Da gibt es Erdbeeren. Aber du bist ja nicht ich." }
    ], sonst: [
      { wennNicht: "tutorial_fertig", dann: [
        { sag: "Lumi", text: "Du hast eins! Guck, ich auch! Na ja – es ist mir gefolgt. Ein winziges, warmes Licht. Es lässt sich nicht abschütteln." },
        { sag: "Lumi", text: "Es heißt Funzel. Es hat sich selbst so genannt. Also … ich hab's so genannt. Es hat nicht widersprochen." },
        { sag: "Lumi", text: "Da hinten im Gras flackert was. Scheuch es auf! Ich will sehen, was deins kann." },
        { kampf: { art: "zink", stufe: 2, ort: "steppe", feld: { sauerstoff: 100, waerme: 20, feuchte: 30 } } },
        { wennGleich: ["letzter_kampf", "sieg"], dann: [
          { sag: "Lumi", text: "Es ist weggelaufen! Deins ist stark. Funzel ist neidisch. Sieht man daran, dass es ein bisschen weniger leuchtet." }
        ], sonst: [
          { sag: "Lumi", text: "Na ja. Es war auch ein ziemlich zäher Brocken. Morgen gewinnst du." }
        ] },
        { sag: "Lumi", text: "Übrigens: Mit Untersuchen findest du heraus, WAS es ist – Farbe, Glanz, Magnet, Strom. Das hat mir deine Oma mal erklärt. Also, sie hat es jemandem erklärt, und ich stand daneben." },
        { setze: "tutorial_fertig" },
        { erzaehl: "Den ganzen Mittag rennt ihr mit euren Wesen über die Felder. Ihr lasst sie Funken sprühen und um die Wette leuchten." },
        { ablauf: "reiter_szenen" }
      ], sonst: [
        { sag: "Lumi", text: "Funzel mag dich. Glaub ich. Es flackert immer so, wenn du kommst." }
      ] }
    ] }
  ],

  // ============================================================
  //  Akt B – DIE HARTEN SZENEN H1–H4: PLATZHALTER
  //  Der Wortlaut steht in drehbuch\kapitel-1.md und wird erst nach
  //  der Freigabe eingesetzt. Bis dahin überbrückt dieser Ablauf die
  //  Handlung, damit der Rest des Kapitels spielbar ist.
  // ============================================================
  reiter_szenen: [
    { welt: { zeit: "15:00" } },
    { erzaehl: "[Platzhalter – Szenen H1 bis H4 warten auf Freigabe: Die grauen Reiter kommen nach Stoffingen und nehmen die Kinder mit, auch Lumi. Am Abend verbieten die Eltern die Reise. In der Nacht brichst du heimlich auf.]" },
    { setze: "reiter_da" },
    { welt: { zeit: "23:00" } },
    { wahl: "In Mutters Werkstatt stehen saubere Reagenzgläser.", optionen: [
      { text: "Nimm sie mit.", dann: [{ geben: { vorrat: { reagenzglas: 3 } } }, { setze: "glaeser_genommen" }] },
      { text: "Lass sie stehen. Es sind ihre.", dann: [{ erzaehl: "Eines hast du ohnehin in der Tasche." }, { geben: { vorrat: { reagenzglas: 1 } } }, { setze: "glaeser_gelassen" }] }
    ] },
    { wahl: "Was schreibst du auf den Zettel für den Küchentisch?", optionen: [
      { text: "„Es tut mir leid. Ich muss Lumi holen …“", dann: [{ setze: "zettel", wert: 1 }] },
      { text: "„Ich bin nicht mehr nur ein Kind.“", dann: [{ setze: "zettel", wert: 2 }] },
      { text: "„Ich komme wieder. Mit Lumi.“", dann: [{ setze: "zettel", wert: 3 }] }
    ] },
    { erzaehl: "Auf der ersten Seite von Großmutters Buch ist eine Karte der Feuerlande. Darunter, in verblasster Tinte: „Willst du einen Stoff besiegen, dann lerne ihn erst kennen. Fang dort an, wo alles anfängt: bei den Stoffen selbst. – Erste Prüfung: der Markt von Stoffingen –“" },
    { welt: { zeit: "05:30", wetter: "nebel" } },
    { setze: "aufgebrochen" },
    { erzaehl: "Morgengrauen. Das Dorf schläft. Dein Elemental sitzt warm auf deiner Schulter." }
  ],

  // ============================================================
  //  Stoffingen – Akt C: der Markt (Quest 1) und der Köhler
  // ============================================================
  mara: [
    { wennNicht: "reiter_da", dann: [
      { sag: "Mara", text: "Kupferbleche, Zinkplatten, Holzkohle, Schwefel – und Nägel für den, der was reparieren will. Alles beschriftet, alles ordentlich." },
      { sag: "Mara", text: "Finger weg vom gelben Pulver, Geburtstagskind. Es stinkt beim Anzünden – stechend, wie verbrannte Streichhölzer." }
    ], sonst: [
      { wennNicht: "markt_fertig", dann: [
        { sag: "Mara", text: "Du bist früh auf. Und du hast ein Buch unterm Arm, das ich kenne. Die Stoffmeisterin hätte gelacht." },
        { sag: "Mara", text: "Die Reiter haben meine Kisten durchwühlt und alle Schilder abgerissen. Hilf mir – und ich helfe dir." },
        { sag: "Mara", text: "Ein echter Stoffmeister erkennt jeden Stoff an seinen Eigenschaften – so wie du einen Freund an seiner Stimme erkennst. Hier: Lupe, Magnet, ein Lämpchen mit Draht, ein Hammer. Leih ich dir." },
        { geben: { werkzeug: ["lupe", "magnet", "stromkreis", "hammer"] } },
        { ablauf: "mara_kisten" },
        { sag: "Mara", text: "Alle fünf. Du kannst mehr, als du glaubst." },
        { geben: { vorrat: { reagenzglas: 2, spatel: 1 } } },
        { sag: "Mara", text: "Behalt das Werkzeug. Und pass auf draußen: Seit heute Nacht flackern überall Lichter. Die Stoffe sind unruhig – als wüssten sie, dass etwas nicht stimmt." },
        { sag: "Mara", text: "Ein Lichtfleck ist ein Elemental, das du noch nicht kennst. Erst prüfen, dann bestimmen. Und willst du es mitnehmen: das Gerät muss zum Stoff passen. Ein Pulver packt man nicht mit der Zange." },
        { setze: "markt_fertig" },
        { setze: "schemen_frei" },
        { erzaehl: "Lumis Spur: Die Reiter haben Lumi nach Osten mitgenommen. Ihr Weg führt durch den Kolbenwald." }
      ], sonst: [
        { sag: "Mara", text: "Nach Osten, durch den Kolbenwald. Und iss was unterwegs. Stoffmeister mit leerem Magen verwechseln Zink mit Zinn." }
      ] }
    ] }
  ],

  mara_kisten: [].concat(
    kistenRaetsel("Mara", "Kiste 1: rötlich glänzende Bleche. Sie lassen sich biegen, ohne zu brechen, und das Lämpchen leuchtet hell.", "kupfer", "kiste1",
      "Kupfer. Leitet den Strom wie kein Zweiter – darum sind Drähte aus Kupfer."),
    kistenRaetsel("Mara", "Kiste 2: schwarze, leichte Brocken, matt. Unter dem Hammer zerbröseln sie. Das Lämpchen leuchtet – schwach, aber es leuchtet.", "kohlenstoff", "kiste2",
      "Holzkohle, also Kohlenstoff. Leitet – und ist trotzdem kein Metall. Die meisten fallen darauf herein."),
    kistenRaetsel("Mara", "Kiste 3: zitronengelbes Pulver, ohne Glanz. Das Lämpchen bleibt dunkel.", "schwefel", "kiste3",
      "Schwefel. Ganz sicher kein Metall."),
    kistenRaetsel("Mara", "Kiste 4: graue, glänzende Nägel. Der Magnet hält sie fest.", "eisen", "kiste4",
      "Eisen. Der Einzige hier, den der Magnet festhält."),
    kistenRaetsel("Mara", "Kiste 5: bläulich-graue, glänzende Platten. Sie leiten, der Magnet zeigt keine Wirkung – und unter dem Hammer splittern sie.", "zink", "kiste5",
      "Zink. Kalt ist es spröde – warm lässt es sich formen. Merk dir das.")
  ),

  koehler: [
    { wennNicht: "reiter_da", dann: [
      { sag: "Köhler Brand", text: "Holz rein, Luft raus, Geduld dazu. Wer den Meiler zu früh öffnet, hat Asche statt Kohle." }
    ], sonst: [
      { wenn: "koehler_fertig", dann: [
        { sag: "Köhler Brand", text: "Die Glut hält. Danke. Wenn du ihn siehst, meinen Jungen … sag ihm, der Meiler brennt noch." }
      ], sonst: [
        { sag: "Köhler Brand", text: "Sie haben meinen Jungen mitgenommen. Er hat nachts immer die Glut bewacht. Jetzt schläft sie mir ein." },
        { wennElemental: "kohlenstoff", dann: [
          { erzaehl: "Dein Kohlenstoff-Elemental schwebt zum Meiler. Die Glut wacht auf und leuchtet ruhig." },
          { sag: "Köhler Brand", text: "Sieh an. Es erkennt seinen Ort. Holzkohle entsteht, wenn Holz ohne Luft erhitzt wird – das hier ist seine Wiege." },
          { erzaehl: "Er reißt eine Seite aus einem rußigen Heft: „Verkohlung – Holz, unter Luftabschluss erhitzt, wird zu Holzkohle. Mit Luft verbrennt es zu Asche.“" },
          { geben: { vorrat: { tiegelzange: 1 } } },
          { setze: "koehler_fertig" }
        ], sonst: [
          { sag: "Köhler Brand", text: "Nachts, wenn die Glut im Dunkeln leuchtet, kommen manchmal schwarze Lichter aus dem Meiler. Bring mir eins. Dann weiß ich, dass er noch lebt – der Meiler, meine ich." }
        ] }
      ] }
    ] }
  ],

  labor_stoffingen: [
    { wennNicht: "aufgebrochen", dann: [
      { erzaehl: "Mutters Werkstatt. Es riecht nach Ringelblumen, Asche und Salbe. Auf dem Regal stehen Tiegel, Mörser und saubere Reagenzgläser." }
    ], sonst: [
      { erzaehl: "Die Werkstatt ist still. Niemand ist wach. Du nimmst dir leise etwas Salbe – für deine Elementals." }
    ] },
    { heilen: true },
    { erzaehl: "Deine Elementals ruhen sich aus. Sie sind wieder bei Kräften." },
    { speichern: true },
    { erzaehl: "(Gespeichert.)" }
  ],

  schild_ost: [
    { erzaehl: "Ein verwittertes Schild: „Nach Osten – Kolbenwald. Gläserne Früchte bitte nicht pflücken.“" }
  ],

  meiler: [
    { erzaehl: "Der Meiler des Köhlers qualmt still vor sich hin. Darin wird Holz ohne Luft erhitzt, bis nur schwarze, leichte Holzkohle übrig bleibt." }
  ],

  ausgang_gesperrt_stoffingen: [
    { wennNicht: "reiter_da", dann: [
      { erzaehl: "Heute ist dein Geburtstag. Du gehst nirgendwohin – zumindest nicht, bevor du dein Handwerk gewählt hast und Lumi dich gefunden hat." }
    ], sonst: [
      { erzaehl: "Großmutters Buch ist unmissverständlich: „Erste Prüfung: der Markt von Stoffingen.“ Mara hat ihren Stand gleich am Dorfplatz." }
    ] }
  ],

  // ============================================================
  //  Kolbenwald – Akt D (Quest 2) und die Rätselkiste
  // ============================================================
  kolbenwald_ankunft: [
    { erzaehl: "Hinter Stoffingen führt der Weg in den Kolbenwald. Zwischen den Ästen hängen gläserne Kolben, Rohre und Schalen wie Früchte und klingen im Wind." },
    { erzaehl: "Irgendwo weiter östlich steht Meisterin Vitra von der Gerätemacher-Gilde. Ohne ihren Segen kommt niemand hindurch." }
  ],

  vitra: [
    { wenn: "geraetepass", dann: [
      { sag: "Meisterin Vitra", text: "Der Wagen mit dem leuchtenden Kolben nahm die Straße nach Brenner. Geh. Und zerbrich nichts, was dir nicht gehört." }
    ], sonst: alleFlags(["g_messzylinder", "g_tiegelzange", "g_reagenzglashalter", "g_reibeschale"], [
      { sag: "Meisterin Vitra", text: "Alle vier. Du kennst deine Werkzeuge. Wer sein Gerät kennt, zerbricht es nicht – und sich auch nicht." },
      { geben: { werkzeug: ["geraetepass", "erlenmeyerkolben"], vorrat: { tiegelzange: 2 } } },
      { sag: "Meisterin Vitra", text: "Die Tiegelzange ist für Metalle. Heißes greift man mit der Zange, nie mit der Hand – auch wenn es ein Elemental ist." },
      { setze: "geraetepass" },
      { sag: "Meisterin Vitra", text: "Ich hab den Wagen der grauen Reiter gesehen. Mit einem seltsam leuchtenden Glaskolben an Bord. Er nahm die Straße nach Brenner." }
    ], [
      { sag: "Meisterin Vitra", text: "Wer meinen Wald durchqueren will, muss die Werkzeuge der Stoffmeister kennen. Wer sein Gerät nicht kennt, zerbricht es – und sich." },
      { sag: "Meisterin Vitra", text: "Vier Geräte hängen im Wald, jedes mit einer Frage. Beantworte alle vier, dann bekommst du den Gerätepass." }
    ]) }
  ],

  geraet_messzylinder: geraetFrage("g_messzylinder", "Messzylinder", "Wofür brauchst du mich?",
    "Eine Flüssigkeit genau abmessen", "Einen Stoff zu Pulver zerreiben", "Ein heißes Gefäß greifen",
    "Der Messzylinder misst Flüssigkeiten genau – abgelesen in Augenhöhe, am unteren Rand der Wölbung."),
  geraet_tiegelzange: geraetFrage("g_tiegelzange", "Tiegelzange", "Wofür brauchst du mich?",
    "Ein heißes Gefäß oder einen Tiegel greifen", "Ein Reagenzglas beim Erhitzen halten", "Eine Flüssigkeit umfüllen",
    "Mit der Tiegelzange greift man heiße Tiegel und Schalen. Für das Reagenzglas gibt es den Reagenzglashalter."),
  geraet_reagenzglashalter: geraetFrage("g_reagenzglashalter", "Reagenzglashalter", "Wofür brauchst du mich?",
    "Ein heißes Reagenzglas festhalten", "Einen heißen Tiegel greifen", "Pulver portionieren",
    "Ein Reagenzglas hält man beim Erhitzen nie mit den Fingern – dafür gibt es den Halter."),
  geraet_reibeschale: geraetFrage("g_reibeschale", "Reibeschale mit Pistill", "Wofür brauchst du mich?",
    "Einen festen Stoff zu Pulver zerreiben", "Eine Lösung eindampfen", "Eine Flüssigkeit genau abmessen",
    "In der Reibeschale zerreibt man mit dem Pistill feste Stoffe zu Pulver."),

  raetselkiste: [
    { wenn: "kiste_offen", dann: [
      { erzaehl: "Die leere Kiste der Reiter. Den Befehlszettel hast du eingesteckt." }
    ], sonst: [
      { erzaehl: "Am Wegrand liegt eine verschlossene Kiste – mit dem grauen Reiher im Schilf eingebrannt. Die Reiter müssen sie in der Eile verloren haben. Ein Zettel: „Nur wer die Stoffe erkennt, darf sie öffnen.“" },
      { erzaehl: "Vier Säcke hängen am Schloss, jeder ohne Schild. Diesmal hilft dir niemand." },
      { ablauf: "kiste_saecke" },
      { wahl: "Das Schloss hat eine letzte Frage: Welcher der vier Stoffe darf auf keinen Fall achtlos ins Lagerfeuer?", optionen: [
        { text: "Kupfer", dann: [{ erzaehl: "Das Schloss bleibt zu. Kupfer glüht im Feuer und läuft höchstens schwarz an." }] },
        { text: "Schwefel", dann: [
          { erzaehl: "Klick. Richtig: Brennender Schwefel bildet Schwefeldioxid – ein stechendes, reizendes Gas." },
          { erzaehl: "In der Kiste liegt eine Kinderzeichnung. Ein Haus, ein Baum, zwei Kinder, ein kleines Licht. Unten steht ein kleines „L“." },
          { erzaehl: "Daneben ein grauer Befehlszettel: „Kommandant Bonardt verlangt: alle Kinder weiter nach Osten.“" },
          { erzaehl: "Jetzt kennst du den Namen des Mannes, der Lumi mitgenommen hat." },
          { geben: { vorrat: { spatel: 2 } } },
          { setze: "kiste_offen" }, { setze: "bonardt_bekannt" }
        ] },
        { text: "Eisen", dann: [{ erzaehl: "Das Schloss bleibt zu. Ein Eisenstück glüht im Feuer – gefährlich wird es dadurch nicht." }] }
      ] }
    ] }
  ],

  kiste_saecke: [].concat(
    kistenRaetsel("Die Kiste", "Sack A: rötlich glänzend, sehr gut verformbar, leitet den Strom hervorragend.", "kupfer", "sack_a", "Das Schloss klickt einmal."),
    kistenRaetsel("Die Kiste", "Sack B: schwarz, leicht, brüchig. Es riecht nach Lagerfeuer.", "kohlenstoff", "sack_b", "Das Schloss klickt zweimal."),
    kistenRaetsel("Die Kiste", "Sack C: zitronengelb, ein Pulver, leitet keinen Strom.", "schwefel", "sack_c", "Das Schloss klickt dreimal."),
    kistenRaetsel("Die Kiste", "Sack D: grau glänzend – ein Magnet zieht es an.", "eisen", "sack_d", "Das Schloss klickt ein viertes Mal.")
  ),

  ausgang_gesperrt_kolbenwald: [
    { sag: "Meisterin Vitra", text: "Halt! Ohne Gerätepass kommt hier niemand durch. Vier Geräte, vier Fragen. Such sie." }
  ],

  // ============================================================
  //  Brenner – Akt E (Quest 2b) und das verirrte Elemental
  // ============================================================
  brenner_ankunft: [
    { erzaehl: "Hinter dem Kolbenwald tauchen die Dächer der Stadt Brenner auf. An der großen Halle der Feuer-Gilde kommst du nicht vorbei." }
  ],

  ilka: [
    { wenn: "flammenschein", dann: [
      { sag: "Gildenmeisterin Ilka", text: "Der Wagen fuhr durchs Osttor. Richtung Teilchin, wo es nach frischem Brot duftet. Und jetzt raus, bevor du hier etwas anzündest." }
    ], sonst: [
      { sag: "Gildenmeisterin Ilka", text: "Du willst mit einem Feuerwesen durch die Feuerlande ziehen? Dann bestehe zuerst die Prüfung, die hier jedes Kind ablegt: den Flammenschein." },
      { sag: "Gildenmeisterin Ilka", text: "Wer die Flamme nicht beherrscht, den beherrscht die Flamme. Drei Teile. Erstens: die Reihenfolge." },
      { ablauf: "ilka_reihenfolge" },
      { wenn: "brenner_teil1", dann: [
        { sag: "Gildenmeisterin Ilka", text: "Zweitens." },
        { wahl: "Welche Flamme nimmt man zum Arbeiten?", optionen: [
          { text: "Die leuchtende – sie ist heller.", dann: [{ sag: "Gildenmeisterin Ilka", text: "Hell heißt nicht heiß. Die leuchtende Flamme ist die Sparflamme: Luftzufuhr zu, gelb, rußig. Komm wieder, wenn du das verinnerlicht hast." }] },
          { text: "Die rauschende – Luftzufuhr offen.", dann: [
            { sag: "Gildenmeisterin Ilka", text: "Richtig. Mehr Luft, mehr Sauerstoff, heißere Flamme. Die leuchtende ist nur die Sparflamme." },
            { sag: "Gildenmeisterin Ilka", text: "Drittens: Zeig mir, dass du ein heißes Feld beherrschst. Meine Halle ist warm. Mein Kupfer liebt das." },
            { kampf: { gegner: [{ art: "kupfer", stufe: 5 }], wild: false, name: "Gildenmeisterin Ilka", ort: "dorf",
                       feld: { sauerstoff: 100, waerme: 45, feuchte: 20 } } },
            { wennGleich: ["letzter_kampf", "sieg"], dann: [
              { sag: "Gildenmeisterin Ilka", text: "Bestanden. Kupfer leitet Wärme – wer mein Feld noch heißer macht, füttert es nur. Das hast du gemerkt. Oder Glück gehabt. Beides zählt." },
              { geben: { werkzeug: ["gasbrenner"] } },
              { sag: "Gildenmeisterin Ilka", text: "Ein Gasbrenner. Einmal pro Kampf gibt er deinem Elemental die Energie, die es zum Zünden braucht. Behandle ihn wie deine Augenbrauen: Du willst ihn behalten." },
              { setze: "flammenschein" },
              { sag: "Gildenmeisterin Ilka", text: "Der Wagen der grauen Reiter rollte durchs Osttor. Richtung Teilchin." }
            ], sonst: [
              { sag: "Gildenmeisterin Ilka", text: "Nicht bestanden. Ruh dich aus. Die Halle läuft nicht weg." }
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
      { text: "Gashahn am Tisch öffnen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Und dann stehst du im Gas und suchst deine Schutzbrille? Nein. Zuerst: Brille auf, Haare zurück, Platz frei. Noch mal von vorn – sprich mich an." }] },
      { text: "Schutzbrille auf, Haare zurück, Platz frei", dann: [
        { wahl: "Und dann?", optionen: [
          { text: "Luftzufuhr am Brenner schließen", dann: [
            { wahl: "Dann?", optionen: [
              { text: "Streichholz an den Brenner halten", dann: [{ sag: "Gildenmeisterin Ilka", text: "Woran soll das brennen? Es kommt ja noch gar kein Gas. Erst der Gashahn am Tisch. Von vorn." }] },
              { text: "Gashahn am Tisch öffnen", dann: [
                { wahl: "Dann?", optionen: [
                  { text: "Streichholz entzünden, seitlich an den Brennerrand halten", dann: [
                    { wahl: "Und zuletzt?", optionen: [
                      { text: "Gaszufuhr am Brenner langsam öffnen", dann: [
                        { sag: "Gildenmeisterin Ilka", text: "Richtig. Die Flamme brennt – leuchtend, weil die Luftzufuhr noch zu ist." },
                        { setze: "brenner_teil1" }
                      ] },
                      { text: "Luftzufuhr ganz aufdrehen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Ohne Gas brennt die schönste Luft nicht. Die Gaszufuhr am Brenner. Von vorn." }] }
                    ] }
                  ] },
                  { text: "Gaszufuhr am Brenner öffnen und warten", dann: [{ sag: "Gildenmeisterin Ilka", text: "Und das Gas strömt, während du nach Streichhölzern suchst? Erst die Flamme bereithalten. Von vorn." }] }
                ] }
              ] }
            ] }
          ] },
          { text: "Luftzufuhr ganz öffnen", dann: [{ sag: "Gildenmeisterin Ilka", text: "Mit offener Luftzufuhr schlägt dir die Flamme beim Zünden zurück. Erst schließen. Von vorn." }] }
        ] }
      ] }
    ] }
  ],

  labor_brenner: [
    { erzaehl: "Das Labor der Gilde. Hitzefeste Handschuhe, ein Sandeimer, ein Regal voller Tiegel. Ein Lehrling nickt dir zu." },
    { heilen: true },
    { erzaehl: "Deine Elementals ruhen sich aus. Sie sind wieder bei Kräften." },
    { speichern: true },
    { erzaehl: "(Gespeichert.)" }
  ],

  kind: [
    { wenn: "knopf_zurueck", dann: [
      { sag: "Kind", text: "Knopf schläft jetzt. Auf meinem Kissen. Mama sagt, das ist unhygienisch. Ist mir egal." }
    ], sonst: [
      { wenn: "knopf_gefunden", dann: [
        { sag: "Kind", text: "KNOPF! Da bist du ja!" },
        { erzaehl: "Das kleine Zink-Elemental hüpft zurück zu seinem Kind." },
        { sag: "Kind", text: "Danke. Weißt du … mein Bruder ist auch weg. Die grauen Reiter. Ich dachte, wenn Knopf auch weg ist, dann ist alles weg." },
        { sag: "Kind", text: "Hier. Das hat Papa aus der Gilde. Du brauchst es mehr als ich." },
        { geben: { vorrat: { tiegelzange: 1 } } },
        { setze: "knopf_zurueck" }
      ], sonst: [
        { sag: "Kind", text: "Hast du Knopf gesehen? Mein Elemental. Er ist klein und bläulich und ein bisschen feige. Er ist zum Brunnen gelaufen, glaub ich." },
        { setze: "knopf_gesucht" }
      ] }
    ] }
  ],

  brunnen: [
    { wennNicht: "knopf_gesucht", dann: [
      { erzaehl: "Der Brunnen von Brenner. Das Wasser ist kühl und klar." }
    ], sonst: [
      { wenn: "knopf_gefunden", dann: [{ erzaehl: "Das Wasser plätschert. Knopf ist bei seinem Kind." }], sonst: [
        { erzaehl: "Hinter dem Brunnenrand flackert ein kleines Licht. Es zittert. Es ist nicht wild – es hat Angst." },
        { erzaehl: "Du prüfst es vorsichtig. Glänzend, bläulich-grau. Der Magnet: nichts. Das Lämpchen leuchtet." },
        { wahl: "Das Kind hat „bläulich“ gesagt. Welcher Stoff ist Knopf?", optionen: [
          { text: "Eisen", dann: [{ erzaehl: "Das Licht weicht zurück. Eisen hätte der Magnet gepackt." }] },
          { text: "Zink", dann: [
            { erzaehl: "„Zink?“, sagst du leise. „Knopf?“ Das Licht hört auf zu zittern und kommt dir entgegen." },
            { setze: "knopf_gefunden" }
          ] },
          { text: "Kupfer", dann: [{ erzaehl: "Das Licht weicht zurück. Kupfer wäre rötlich." }] }
        ] }
      ] }
    ] }
  ],

  ausgang_gesperrt_brenner: [
    { erzaehl: "Die Torwache mustert dich. „Ohne Flammenschein lässt dich hier niemand mit einem Feuerwesen hinaus. Frag Gildenmeisterin Ilka.“" }
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
