document.addEventListener("DOMContentLoaded", function () {
  alert("app.js подключен");

  const cards = document.querySelectorAll(".card[data-width]");
  console.log("cards found:", cards.length);

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      alert("клик работает: " + card.dataset.width);
    });
  });
});
