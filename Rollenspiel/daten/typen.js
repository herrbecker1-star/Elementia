// ============================================================
//  TYPEN – Stein-Schere-Papier der Stoffe (seit Fassung 12)
//
//  Jeder Angriff hat einen TYP (Zeile), jedes Elemental eine
//  STOFFKLASSE (Spalte, Feld klasse in daten\elementals.js). Die
//  Tabelle sagt, wie stark ein Typ gegen eine Klasse wirkt:
//  ×2 (sehr wirksam), ×1 (kein Eintrag) oder ×½ (kaum wirksam).
//
//  Regeln für jede Erweiterung (siehe LIESMICH.md, Fassung 12):
//   1. Neue Stoffklasse = neue Spalte, neuer Typ = neue Zeile.
//      Bestehende Einträge bleiben.
//   2. Jedes ×2 und ×½ stützt sich auf einen Merksatz (Nummer) und
//      hat ein kurzes Wort für die Anzeige. Passt kein Merksatz,
//      gilt ×1 – oder es kommt ein neuer Merksatz dazu, der für die
//      ganze Zeile oder Spalte gilt.
//   3. Jede Klasse hat 2–4 Schwächen und 2–4 Stärken. Ausnahme:
//      Edelgase (1 Schwäche, 6 Stärken) – dafür Angriff 30.
//   4. Nur ½, 1 und 2. Keine Zwischenwerte.
//   Der Prüfstand kontrolliert 2–4.
//
//  Ob ein Angriff physisch oder speziell ist, hängt wie in der
//  1. Generation nur vom Typ ab: Schlag ist physisch (Angriff gegen
//  Verteidigung), alles andere speziell (Sp.-Angriff gegen
//  Sp.-Verteidigung).
// ============================================================

var STOFFKLASSEN = ["Metall", "Nichtmetall", "Legierung", "Edelgas", "Oxid", "Sulfid", "Salz", "Säure", "Lauge", "Molekül"];

var MERKSAETZE = {
  1: "Spröde zerbricht. Ein Schlag zerbricht Kristalle. Verformbares gibt nach, Flüssiges und Gas weichen aus.",
  2: "Unedles reagiert, Gebundenes ist satt. Feuer und Reaktion greifen Metalle an, kaum aber Oxide, Salze und Edelgase.",
  3: "Säure frisst Metall und Oxid. Edelgase und Nichtmetalle bleiben verschont.",
  4: "Säure und Lauge heben sich auf. Die Lauge bindet außerdem CO₂ und reagiert mit Nichtmetallen.",
  5: "Wasser löst Salz und verdünnt Säure und Lauge.",
  6: "Strom braucht Ionen oder Gas: Lösungen, Salze und Edelgase. Metalle leiten ihn einfach ab.",
  7: "Wärme fließt in Leiter. Metalle werden durch und durch heiß, Isolatoren nicht. Moleküle verdampfen."
};

// gegen: { Klasse: [Faktor, Merksatz, Wort] } – fehlt die Klasse, gilt ×1.
var TYPEN = {
  schlag: { name: "Schlag", physisch: true, gegen: {
    "Metall": [0.5, 1, "verformbar"], "Nichtmetall": [2, 1, "spröde"], "Legierung": [0.5, 1, "verformbar"],
    "Edelgas": [0.5, 1, "Gas weicht aus"], "Oxid": [2, 1, "spröde"], "Sulfid": [2, 1, "spröde"], "Salz": [2, 1, "spröde"],
    "Säure": [0.5, 1, "flüssig"], "Lauge": [0.5, 1, "flüssig"], "Molekül": [0.5, 1, "weicht aus"] } },
  feuer: { name: "Feuer", gegen: {
    "Metall": [2, 2, "oxidiert"], "Edelgas": [0.5, 2, "brennt nicht"], "Oxid": [0.5, 2, "schon oxidiert"],
    "Sulfid": [2, 2, "wird geröstet"], "Salz": [0.5, 2, "gebunden"], "Molekül": [0.5, 2, "löscht"] } },
  reaktion: { name: "Reaktion", gegen: {
    "Metall": [2, 2, "unedel"], "Nichtmetall": [0.5, 2, "reagiert kaum"], "Edelgas": [0.5, 2, "reaktionsträge"],
    "Oxid": [0.5, 2, "gebunden"], "Sulfid": [0.5, 2, "gebunden"], "Salz": [0.5, 2, "gebunden"] } },
  waerme: { name: "Wärme", gegen: {
    "Metall": [2, 7, "leitet"], "Nichtmetall": [0.5, 7, "isoliert"], "Legierung": [2, 7, "leitet"],
    "Oxid": [0.5, 7, "isoliert"], "Molekül": [2, 7, "verdampft"] } },
  saeure: { name: "Säure", gegen: {
    "Metall": [2, 3, "löst sich"], "Nichtmetall": [0.5, 3, "säurefest"], "Legierung": [2, 3, "löst sich"],
    "Edelgas": [0.5, 3, "reaktionsträge"], "Oxid": [2, 3, "löst sich"], "Sulfid": [2, 3, "löst sich"],
    "Säure": [0.5, 4, "gleichartig"], "Lauge": [2, 4, "neutralisiert"] } },
  lauge: { name: "Lauge", gegen: {
    "Metall": [0.5, 4, "laugenfest"], "Nichtmetall": [2, 4, "reagiert"], "Legierung": [0.5, 4, "laugenfest"],
    "Edelgas": [0.5, 4, "reaktionsträge"], "Salz": [0.5, 4, "gebunden"], "Säure": [2, 4, "neutralisiert"],
    "Lauge": [0.5, 4, "gleichartig"], "Molekül": [2, 4, "bindet CO₂"] } },
  wasser: { name: "Wasser", gegen: {
    "Legierung": [0.5, 5, "wasserfest"], "Edelgas": [0.5, 5, "unlöslich"], "Sulfid": [0.5, 5, "unlöslich"],
    "Salz": [2, 5, "löst sich"], "Säure": [2, 5, "verdünnt"], "Lauge": [2, 5, "verdünnt"] } },
  strom: { name: "Strom", gegen: {
    "Metall": [0.5, 6, "leitet ab"], "Nichtmetall": [0.5, 6, "isoliert"], "Legierung": [0.5, 6, "leitet ab"],
    "Edelgas": [2, 6, "leuchtet auf"], "Oxid": [0.5, 6, "isoliert"], "Salz": [2, 6, "Elektrolyse"],
    "Säure": [2, 6, "Elektrolyse"], "Lauge": [2, 6, "Elektrolyse"], "Molekül": [0.5, 6, "isoliert"] } }
};

// Wie stark wirkt Typ typ gegen die Art artId? Liefert { faktor, wort, merksatz }.
// Eine Art kann eine Ausnahme tragen (ARTEN[..].ausnahmen), z. B. Grafit,
// das als Nichtmetall die Wärme leitet. bisWaerme: Die Ausnahme gilt nur,
// solange das Feld kälter ist (Zink ist kalt spröde, warm verformbar).
function typWirkung(typ, artId, waerme) {
  var a = ARTEN[artId], t = TYPEN[typ];
  if (!t) return { faktor: 1, wort: "", merksatz: null };
  var aus = a.ausnahmen && a.ausnahmen[typ];
  if (aus && !(aus.bisWaerme !== undefined && waerme >= aus.bisWaerme)) return { faktor: aus.faktor, wort: aus.wort, merksatz: aus.merksatz || null };
  var e = t.gegen[a.klasse];
  return e ? { faktor: e[0], wort: e[2], merksatz: e[1] } : { faktor: 1, wort: "", merksatz: null };
}
