// ============================================================
//  STATIONSCODE – was auf einem QR-Kaertchen steht
//
//  Ein Code schaltet genau eine Karte frei. Erzeugt wird er von
//  Karten\stationscodes.html (Druckbogen), gelesen von
//  App\sammlung.html (Kamera und Texteingabe). Beide benutzen
//  diese Datei – dasselbe Muster wie bei kern\kartenstil.js.
//
//  Warum ueberhaupt eine eigene Datei fuer sechs Zeilen Format:
//  Ein Code, der gedruckt an einer Wand klebt, ist auf Jahre
//  festgelegt. Stuende das Format an zwei Stellen, wuerde eine
//  davon irgendwann geaendert – und dann liest die App die
//  bereits laminierten Kaertchen nicht mehr.
// ============================================================

(function () {
  "use strict";

  // Die Kennung traegt eine Nummer, damit ein spaeteres Format
  // erkennbar anders heisst und alte Kaertchen weiter gelesen
  // werden koennen, statt still zu scheitern.
  var KENNUNG = "ELEMENTIA1:";
  var TRENNER = "|";

  // Karten ohne Regionsangabe gehoeren nach Feuerlande – dieselbe
  // Voreinstellung wie im Druckbogen und in der Sammlung.
  function regionVon(k) { return (k && k.region) || "Feuerlande"; }

  // --- Pruefzeichen --------------------------------------------
  // Absichtlich winzig. Es soll KEINE Tippfehler abfangen: Von Hand
  // eingegeben wird nichts, dafuer gibt es in der Sammlung den Knopf
  // "Noch nicht gefunden". Der eine Buchstabe erlaubt der App, einen
  // fremden QR-Code (Schulhof-Plakat, Klassenbuch, Getraenkedose)
  // als "gehoert nicht zu Elementia" zu melden, statt wortlos nichts
  // zu tun. Ein wortloses Nichts ist vor einer Klasse das Schlimmste,
  // was ein Knopf machen kann.
  //
  // Vertippte oder halb erkannte Codes sind kein Thema: Der QR-Code
  // selbst traegt eine Reed-Solomon-Fehlerkorrektur, jsQR liefert
  // entweder den richtigen Text oder gar keinen.
  var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // ohne I O 0 1

  function pruefzeichen(text) {
    var summe = 0;
    for (var i = 0; i < text.length; i++) {
      // Der Faktor macht die Stellung wichtig: "Eisen|Feuerlande"
      // bekaeme sonst dasselbe Zeichen wie "Feuerlande|Eisen".
      summe = (summe * 31 + text.charCodeAt(i)) % 1000003;
    }
    return ALPHABET.charAt(summe % ALPHABET.length);
  }

  // --- Erzeugen ------------------------------------------------
  function bauen(karte) {
    var kern = regionVon(karte) + TRENNER + karte.name;
    return KENNUNG + kern + TRENNER + pruefzeichen(kern);
  }

  // --- Erzeugen als Adresse ------------------------------------
  // Dieselbe Zeichenkette, nur in eine Web-Adresse gewickelt:
  //   https://…/Elementia/#code=ELEMENTIA1%3AFeuerlande%7CEisen%7CF
  // Das ist die Form, die seit dem 03.09.2026 auf die Kaertchen
  // gedruckt wird. Ihr Sinn: Die eingebaute Kamera-App jedes Handys
  // erkennt sie als Link und oeffnet die Sammlung direkt – ohne dass
  // jemand erst die App startet und die Kameraerlaubnis erteilt.
  //
  // Sie steht absichtlich HIER, direkt neben lesen(): Dessen
  // Adress-Zweig ist das Gegenstueck. Stuende das Zusammensetzen im
  // Druckbogen und das Zerlegen hier, liefen die beiden Seiten
  // irgendwann auseinander – und zwar erst dann, wenn die Kaertchen
  // schon laminiert sind.
  //
  // Die Basis ist ein Argument und keine Konstante. Die App soll
  // nichts darueber wissen muessen, wo sie veroeffentlicht ist; der
  // Druckbogen weiss es, weil dort der Mensch sitzt, der druckt.
  function adresse(karte, basis) {
    return String(basis || "") + "#code=" + encodeURIComponent(bauen(karte));
  }

  // --- Lesen ---------------------------------------------------
  // Gibt immer ein Objekt zurueck, nie null und nie eine Ausnahme:
  // { ok: true, region, name, schluessel } oder { ok: false, grund }.
  // Der Aufrufer steht vor einer Klasse und braucht einen Satz, den
  // er vorlesen kann – keinen Fehlerwert, den er selbst deuten muss.
  function lesen(text) {
    if (typeof text !== "string") return { ok: false, grund: "Kein Text." };

    var roh = text.trim();

    // Auch eine Adresse wird angenommen:
    //   https://…/sammlung.html#code=ELEMENTIA1%3AFeuerlande%7CEisen%7CF
    // Das ist der zweite Weg ins Spiel, sobald die App im Netz steht:
    // Ein solcher QR-Code wird von der eingebauten Kamera-App jedes
    // Handys erkannt und oeffnet die Sammlung direkt – ohne dass
    // jemand erst die App startet und die Kameraerlaubnis erteilt.
    // Die heute gedruckten Klartext-Kaertchen bleiben daneben gueltig.
    //
    // Achtung: Nach dem # steht der Code URL-kodiert, "ELEMENTIA1:"
    // heisst dort "ELEMENTIA1%3A". Deshalb wird erst abgeschnitten
    // und dann dekodiert – nicht umgekehrt nach der Kennung gesucht.
    var raute = roh.indexOf("#");
    if (raute >= 0) roh = roh.slice(raute + 1);
    if (roh.indexOf("code=") === 0) {
      try { roh = decodeURIComponent(roh.slice(5)); }
      catch (e) { return { ok: false, grund: "Die Adresse ist unvollständig." }; }
    }

    if (roh.indexOf(KENNUNG) !== 0) {
      return { ok: false, grund: "Das ist kein Elementia-Code." };
    }

    var teile = roh.slice(KENNUNG.length).split(TRENNER);
    if (teile.length !== 3) {
      return { ok: false, grund: "Der Code ist unvollständig." };
    }

    var region = teile[0], name = teile[1];
    if (pruefzeichen(region + TRENNER + name) !== teile[2]) {
      return { ok: false, grund: "Der Code ist beschädigt." };
    }

    return {
      ok: true,
      region: region,
      name: name,
      // Genau der Schluessel des Sammelstands: "Region|Name", nicht
      // der Name allein. Wasserstoff, Sauerstoff, Wasser und Methan
      // sind absichtlich je zweimal gedruckt, in zwei Regionen.
      schluessel: region + TRENNER + name
    };
  }

  // --- Selbstpruefung ------------------------------------------
  // Prueft bauen() gegen lesen() – also nur, ob das Format in sich
  // stimmt. Das ist billig und braucht keine QR-Bibliothek.
  //
  // Was es ausdruecklich NICHT prueft, ist der Weg durch den QR-Code
  // selbst. Dort sitzt die eigentliche Falle (die Wandlung nach
  // UTF-8, siehe App\lib\HERKUNFT.md), und die faengt nur der volle
  // Durchlauf ab: erzeugen, in Bildpunkte legen, mit jsQR wieder
  // lesen. Der macht das in Karten\stationscodes.html und schreibt
  // das Ergebnis in seine Kopfzeile.
  function selbsttest(karten) {
    var fehler = [];
    for (var i = 0; i < karten.length; i++) {
      var k = karten[i];
      var gelesen = lesen(bauen(k));
      if (!gelesen.ok) {
        fehler.push(k.name + ": " + gelesen.grund);
      } else if (gelesen.name !== k.name || gelesen.region !== regionVon(k)) {
        fehler.push(k.name + ": gelesen als " + gelesen.region + "|" + gelesen.name);
      }
      // Dasselbe noch einmal ueber die Adressform – das ist die, die
      // auf den Kaertchen steht. Die Basis ist hier beliebig; geprueft
      // wird nur, dass adresse() und der Adress-Zweig von lesen()
      // zueinander passen.
      var ueberAdresse = lesen(adresse(k, "https://beispiel.test/Elementia/"));
      if (!ueberAdresse.ok) {
        fehler.push(k.name + " (als Adresse): " + ueberAdresse.grund);
      } else if (ueberAdresse.schluessel !== regionVon(k) + TRENNER + k.name) {
        fehler.push(k.name + " (als Adresse): ergibt " + ueberAdresse.schluessel);
      }
    }
    return { gesamt: karten.length, fehler: fehler };
  }

  window.STATIONSCODE = {
    kennung: KENNUNG,
    bauen: bauen,
    adresse: adresse,
    lesen: lesen,
    selbsttest: selbsttest,
    regionVon: regionVon
  };
})();
