// Formularz wyceny przez Web3Forms (darmowy plan, wysyła na e-mail właściciela).
// Klucz dostępu (access key) jest publiczny z założenia — wpisz go poniżej.
// Dopóki jest pusty, formularz działa w trybie podglądowym.
var ACCESS_KEY = "";
var ENDPOINT = "https://api.web3forms.com/submit";

var form = document.getElementById("quote");
var msg = document.getElementById("form-msg");

function show(text, cls) {
  msg.textContent = text;
  msg.className = "form-msg " + cls;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    show("Uzupełnij wymagane pola i zaznacz zgodę.", "err");
    return;
  }
  if (!ACCESS_KEY) {
    show("Wersja podglądowa: formularz nie wysyła jeszcze danych. Zadzwoń: 600 476 484.", "err");
    return;
  }
  var data = new FormData(form);
  data.append("access_key", ACCESS_KEY);
  fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.success) throw new Error();
      form.reset();
      show("Dziękujemy! Odpowiemy możliwie szybko.", "ok");
    })
    .catch(function () {
      show("Nie udało się wysłać. Zadzwoń: 600 476 484.", "err");
    });
});
