// ============================================================
//  ZUFALL – wiederholbar, mit Startwert
//
//  Math.random() lässt sich nicht wiederholen. Für den Prüfstand
//  muss derselbe Startwert denselben Kampf ergeben, sonst ist jeder
//  Fehler einmalig und jede Messung ein Glücksspiel.
//  mulberry32: klein, schnell, für ein Spiel mehr als gut genug.
// ============================================================

function ZUFALL(startwert) {
  "use strict";
  var a = (startwert === undefined ? Math.floor(Math.random() * 4294967296) : startwert) >>> 0;
  function zahl() {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  zahl.zwischen = function (min, max) { return min + zahl() * (max - min); };
  zahl.ganz = function (min, max) { return min + Math.floor(zahl() * (max - min + 1)); };
  zahl.stand = function () { return a; };
  return zahl;
}
