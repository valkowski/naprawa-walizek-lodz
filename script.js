// Formularz wyceny przez Web3Forms (darmowy plan, wysyła na e-mail właściciela).
// Klucz dostępu (access key) jest publiczny z założenia — wpisz go poniżej.
// Dopóki jest pusty, formularz działa w trybie podglądowym.
var ACCESS_KEY = "";
var ENDPOINT = "https://api.web3forms.com/submit";

// Dane diagnozy walizki. price: null = „cena po wycenie" — wpisz kwotę, np. "od 40 zł".
var PARTS = [
  { id: "kolka", label: "Kółka", x: 24, y: 93, title: "Kółka", text: "Wymiana urwanych, zablokowanych i zużytych kółek, żeby walizka znów jechała gładko.", price: null },
  { id: "raczka", label: "Rączka górna", x: 50, y: 5, title: "Rączki i uchwyty", text: "Wymiana złamanej lub obluzowanej rączki oraz uchwytów.", price: null },
  { id: "uchwyt", label: "Uchwyt boczny", x: 7, y: 51, title: "Uchwyt boczny", text: "Naprawa i wymiana bocznych uchwytów oraz ich mocowań.", price: null },
  { id: "suwak", label: "Zamek błyskawiczny", x: 84, y: 19, title: "Suwak / zamek błyskawiczny", text: "Zacinający się, rozpruty lub urwany suwak — naprawiamy albo wymieniamy.", price: null },
  { id: "szyfr", label: "Zamek szyfrowy, klamry", x: 78, y: 58, title: "Zamek szyfrowy i klamry", text: "Zablokowany zamek, uszkodzone klamry i zatrzaski.", price: null },
  { id: "skorupa", label: "Stelaż i skorupa", x: 50, y: 30, title: "Stelaż i skorupa", text: "Pęknięcia, przetarcia i uszkodzone elementy konstrukcji — ocenimy na zdjęciu lub na miejscu.", price: null },
  { id: "podszewka", label: "Podszewka i szycie", x: 50, y: 72, title: "Podszewka i szycie", text: "Rozdarcia, przetarcia, szycie maszynowe.", price: null }
];

var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

/* --- pasek-zamek (postęp przewijania) i parallax --- */
var zipFill = $(".zip-fill"), zipPull = $(".zip-pull");
var parallaxEls = $$("[data-parallax]");
var route = $("#route");
function onScroll() {
  var h = document.documentElement.scrollHeight - innerHeight;
  var p = h > 0 ? scrollY / h : 0;
  zipFill.style.width = p * 100 + "%";
  zipPull.style.left = p * 100 + "%";
  if (!reduce) {
    parallaxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.parallax);
      el.style.translate = "0 " + off.toFixed(1) + "px";
    });
  }
  if (route) {
    var rr = route.getBoundingClientRect();
    var rp = Math.min(1, Math.max(0, (innerHeight * 0.75 - rr.top) / (rr.height + innerHeight * 0.2)));
    route.style.setProperty("--p", rp.toFixed(3));
    $$(".rs", route).forEach(function (s, i) { s.classList.toggle("on", rp >= i / 4 + 0.04); });
  }
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* --- pojawianie sekcji --- */
var reveals = $$(".reveal");
if ("IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  // paragon ma clip-path, więc obserwujemy jego kontener
  var rc = $("#receipt");
  if (rc) new IntersectionObserver(function (es, o) {
    if (es[0].isIntersecting) { rc.classList.add("in"); o.disconnect(); }
  }, { threshold: 0, rootMargin: "0px 0px -30% 0px" }).observe(rc.parentNode);
} else {
  reveals.forEach(function (el) { el.classList.add("in"); });
  var rc2 = $("#receipt"); if (rc2) rc2.classList.add("in");
}

/* --- liczniki --- */
function countUp(el) {
  var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), t0 = null;
  if (reduce) return;
  function step(t) {
    if (t0 === null) t0 = t;
    var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * e).toFixed(dec).replace(".", ",");
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
if ("IntersectionObserver" in window) {
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(function (el) { cio.observe(el); });
}

/* --- menu mobilne i aktywna sekcja --- */
var burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", function () {
  var open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
$$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); }); });
if ("IntersectionObserver" in window) {
  var links = {};
  $$("a", nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting && links[en.target.id]) {
        $$("a", nav).forEach(function (a) { a.classList.remove("active"); });
        links[en.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
}

/* --- poświata za kursorem, magnetyczne przyciski, pochylanie metek --- */
var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
if (fine && !reduce) {
  var glow = $(".cursor-glow");
  addEventListener("pointermove", function (e) {
    glow.style.opacity = 1;
    glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
  }, { passive: true });
  $$("[data-magnet]").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
  $$("[data-tilt]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(800px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 8 + "deg) translateY(-6px)";
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });
}

/* --- diagnoza walizki --- */
var caseEl = $("#case");
var diagInfo = $("#diag-info"), diagEmpty = $("#diag-empty"), current = null;
PARTS.forEach(function (p) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "hot"; b.style.left = p.x + "%"; b.style.top = p.y + "%";
  b.setAttribute("aria-label", p.label);
  b.innerHTML = '<span>' + p.label + '</span>';
  b.addEventListener("click", function () {
    $$(".hot", caseEl).forEach(function (h) { h.classList.remove("on"); });
    b.classList.add("on");
    current = p;
    $("#diag-title").textContent = p.title;
    $("#diag-text").textContent = p.text;
    $("#diag-price").textContent = p.price ? "Cena: " + p.price : "Cena: po wycenie (podamy po zdjęciu lub oględzinach)";
    diagEmpty.hidden = true; diagInfo.hidden = false;
    diagInfo.style.animation = "none"; void diagInfo.offsetWidth; diagInfo.style.animation = "";
  });
  caseEl.appendChild(b);
});
var quote = $("#quote");
$("#diag-cta").addEventListener("click", function () {
  if (!current) return;
  quote.rodzaj.value = "Walizka";
  quote.opis.value = "Walizka — " + current.title.toLowerCase() + ": ";
  document.getElementById("wycena").scrollIntoView({ behavior: "smooth" });
  setTimeout(function () { quote.opis.focus(); }, 700);
});

/* --- ostrzenie: zaznaczanie narzędzi i przeniesienie do formularza --- */
var chips = $$(".chip"), forgeCta = $("#forge-cta");
function selectedChips() { return chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; }); }
function updateForgeCta() {
  var n = selectedChips().length;
  forgeCta.textContent = n ? "Wyceń wybrane (" + n + ")" : "Przynieś swoje — wyceń";
}
chips.forEach(function (c) {
  c.addEventListener("click", function () {
    c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
    updateForgeCta();
  });
});
forgeCta.addEventListener("click", function () {
  var sel = selectedChips();
  if (sel.length) {
    var kinds = sel.map(function (c) { return c.dataset.kind; });
    var same = kinds.every(function (k) { return k === kinds[0]; });
    quote.rodzaj.value = same ? kinds[0] : "Inne";
    quote.opis.value = "Ostrzenie: " + sel.map(function (c) { return c.dataset.item; }).join(", ") + ". ";
  }
  document.getElementById("wycena").scrollIntoView({ behavior: "smooth" });
  setTimeout(function () { quote.opis.focus(); }, 700);
});

/* --- tablica odlotów: efekt przekładania liter --- */
var CH = "ABCDEFGHIJKLMNOPRSTUWYZĄĆĘŁŃÓŚŹŻ0123456789";
function scramble(el) {
  var txt = el.dataset.text, n = 0;
  if (reduce) return;
  var iv = setInterval(function () {
    n += 0.5;
    var out = "";
    for (var i = 0; i < txt.length; i++) {
      out += txt[i] === " " || txt[i] === "." || txt[i] === "-" ? txt[i] : (i < n ? txt[i] : CH[Math.floor(Math.random() * CH.length)]);
    }
    el.textContent = out;
    if (n >= txt.length) { el.textContent = txt; clearInterval(iv); }
  }, 45);
}

var board = $("#board");
if (board && "IntersectionObserver" in window) {
  var bio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) { $$(".b-v", board).forEach(function (v, i) { setTimeout(function () { scramble(v); }, i * 180); }); bio.disconnect(); }
    });
  }, { threshold: 0.4 });
  bio.observe(board);
}

/* --- iskry (canvas) --- */
(function () {
  var forge = $("#ostrzenie"), cv = $("#sparks");
  if (!forge || !cv || reduce) return;
  var ctx = cv.getContext("2d"), parts = [], visible = false, raf = 0, W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
  var wp = $("#wheel-point");
  function size() {
    var r = forge.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener("resize", size);
  function emit(x, y, n, dirx) {
    for (var i = 0; i < n; i++) {
      var a = (Math.random() - 0.5) * 1.6 + (dirx < 0 ? Math.PI : 0) - 0.4;
      var s = 2 + Math.random() * 6;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, life: 1, d: 0.012 + Math.random() * 0.02 });
    }
    if (parts.length > 900) parts.splice(0, parts.length - 900);
  }
  forge.addEventListener("pointermove", function (e) {
    var r = forge.getBoundingClientRect();
    emit(e.clientX - r.left, e.clientY - r.top, 3, Math.random() < 0.5 ? 1 : -1);
  });
  function frame() {
    if (!visible) { raf = 0; return; }
    ctx.clearRect(0, 0, W, H);
    // stałe iskry z tarczy
    var fr = forge.getBoundingClientRect(), pr = wp.getBoundingClientRect();
    emit(pr.left - fr.left, pr.top - fr.top, 2, -1);
    ctx.globalCompositeOperation = "lighter";
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += 0.18; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.life -= p.d;
      if (p.life <= 0 || p.y > H + 20) { parts.splice(i, 1); continue; }
      ctx.strokeStyle = "rgba(255," + (120 + 100 * p.life | 0) + "," + (40 * p.life | 0) + "," + p.life + ")";
      ctx.lineWidth = 1 + p.life * 1.6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible && !raf) { size(); raf = requestAnimationFrame(frame); }
  }, { threshold: 0.05 }).observe(forge);
})();

/* --- numer zgłoszenia na karcie --- */
var tn = $("#ticket-no");
if (tn) tn.textContent = "WL-" + String(Math.floor(1000 + Math.random() * 9000));

/* --- formularz --- */
var msg = $("#form-msg");
function show(text, cls) { msg.textContent = text; msg.className = "form-msg " + cls; }
quote.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!quote.checkValidity()) { show("Uzupełnij wymagane pola i zaznacz zgodę.", "err"); return; }
  if (!ACCESS_KEY) { show("Wersja podglądowa: formularz nie wysyła jeszcze danych. Zadzwoń: 600 476 484.", "err"); return; }
  var data = new FormData(quote);
  data.append("access_key", ACCESS_KEY);
  data.append("numer_zgloszenia", tn.textContent);
  fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.success) throw new Error();
      quote.reset();
      show("Dziękujemy! Zgłoszenie " + tn.textContent + " przyjęte — odpowiemy możliwie szybko.", "ok");
    })
    .catch(function () { show("Nie udało się wysłać. Zadzwoń: 600 476 484.", "err"); });
});
