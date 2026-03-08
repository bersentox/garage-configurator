alert("JS загружен");

document.addEventListener("DOMContentLoaded", function () {
  alert("DOM готов");

  const cards = document.querySelectorAll(".card");
  alert("Карточек найдено: " + cards.length);

  cards.forEach(function(card) {
    card.addEventListener("click", function() {
      alert("Клик по карточке: " + card.dataset.width);
    });
  });
});
