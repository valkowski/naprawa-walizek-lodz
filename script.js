// Formularz wyceny. Wersja podglądowa: po podpięciu usługi (np. Formspree/Web3Forms)
// wpisz jej adres w ENDPOINT, a dane będą wysyłane na e-mail właściciela.
var ENDPOINT = "";

var form = document.getElementById("quote");
var msg = document.getElementById("form-msg");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  msg.className = "form-msg";
  if (!form.checkValidity()) {
    msg.textContent = "Uzupełnij wymagane pola i zaznacz zgodę.";
    msg.classList.add("err");
    return;
  }
  if (!ENDPOINT) {
    msg.textContent = "Wersja podglądowa: formularz nie wysyła jeszcze danych. Zadzwoń: 600 476 484.";
    msg.classList.add("err");
    return;
  }
  fetch(ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
    .then(function (r) {
      if (!r.ok) throw new Error();
      form.reset();
      msg.textContent = "Dziękujemy! Odpowiemy z wstępną wyceną.";
      msg.classList.add("ok");
    })
    .catch(function () {
      msg.textContent = "Nie udało się wysłać. Zadzwoń: 600 476 484.";
      msg.classList.add("err");
    });
});
