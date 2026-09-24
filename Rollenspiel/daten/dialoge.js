// ============================================================
//  DIALOGE – Stoffingen, Probefassung für die Technikprobe (M0)
//
//  Der Morgen des zwölften Geburtstags, bevor die Reiter kommen.
//  Diese Texte prüfen nur Dialogbox, Wahl und Flags auf dem Handy.
//  Die Szenen von Kapitel 1 (Starterwahl, Reiter, Aufbruch) kommen
//  in M3 und werden vorher zur Freigabe vorgelegt.
//
//  Schlüssel = "dialog"-Eigenschaft des Objekts in der Tiled-Karte.
//  Format der Schritte: siehe kern\ereignisse.js.
// ============================================================

var DIALOGE = {

  mutter: [
    { wennNicht: "mutter_gratuliert", dann: [
      { sag: "Mutter", text: "Da ist ja unser Geburtstagskind! Zwölf Jahre. Ich hab den Tag, an dem du auf die Welt kamst, noch vor Augen – du hast geschrien wie ein Blasebalg." },
      { sag: "Mutter", text: "Heute entscheidest du, welches Handwerk du lernst. Lass dir Zeit. Die Kräuter laufen nicht weg." },
      { setze: "mutter_gratuliert" }
    ], sonst: [
      { sag: "Mutter", text: "Die Salbei-Beete brauchen Wasser, die Ringelblumen Geduld. Und du brauchst ein Frühstück." }
    ] }
  ],

  vater: [
    { sag: "Vater", text: "Hörst du das? Das Eisen singt, wenn es die richtige Hitze hat. Hellrot ist zu früh, gelb ist gut, weiß ist zu spät." },
    { wahl: "Was fragst du ihn?", optionen: [
      { text: "Warum singt Eisen?", dann: [
        { sag: "Vater", text: "Tut es nicht wirklich. Das ist der Hammer. Aber es klingt besser, wenn man es so erzählt." }
      ] },
      { text: "Darf ich heute schmieden?", dann: [
        { sag: "Vater", text: "Heute darfst du wählen. Schmieden darfst du, wenn du dir vorher nicht die Finger verbrennst. Also morgen. Oder übermorgen." }
      ] }
    ] }
  ],

  lumi: [
    { wennNicht: "lumi_rennen", dann: [
      { sag: "Lumi", text: "Alles Gute! Ich hab dir was mitgebracht: einen Stein. Er sieht aus wie ein Brot. Du musst ihn nicht essen." },
      { wahl: "Lumi hüpft auf und ab. „Wettrennen bis zum Meiler?“", optionen: [
        { text: "Na klar!", dann: [
          { sag: "Lumi", text: "Drei, zwei – ich bin schon losgelaufen!" },
          { setze: "lumi_rennen" }
        ] },
        { text: "Erst Frühstück.", dann: [
          { sag: "Lumi", text: "Du bist zwölf und kein bisschen spannender geworden." }
        ] }
      ] }
    ], sonst: [
      { sag: "Lumi", text: "Gewonnen! Zählt auch, wenn du nicht wusstest, dass es losgeht." }
    ] }
  ],

  mara: [
    { sag: "Mara", text: "Kupferbleche, Zinkplatten, Holzkohle, Schwefel – und Nägel für den, der was reparieren will. Alles beschriftet, alles ordentlich." },
    { sag: "Mara", text: "Eines Tages, Kind, erkennst du jeden Stoff am Glanz und am Klang. Bis dahin: Finger weg vom gelben Pulver. Es stinkt beim Anzünden." }
  ],

  schild_ost: [
    { erzaehl: "Ein verwittertes Schild: „Nach Osten – Kolbenwald. Gläserne Früchte bitte nicht pflücken.“" }
  ],

  meiler: [
    { erzaehl: "Der Meiler des Köhlers qualmt still vor sich hin. Darin wird Holz ohne Luft erhitzt, bis nur schwarze, leichte Holzkohle übrig bleibt." },
    { wenn: "lumi_rennen", dann: [
      { erzaehl: "Lumi sitzt schon oben auf dem Zaun und winkt." }
    ] }
  ]
};
