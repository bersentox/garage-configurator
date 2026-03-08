document.addEventListener("DOMContentLoaded", function () {
  alert("новый app.js загружен");

  const stepLength = document.getElementById("step-length");
  const stepConfig = document.getElementById("step-config");
  const stepRender = document.getElementById("step-render");
  const stepPrice = document.getElementById("step-price");

  alert(
    "IDs: " +
    !!stepLength + " / " +
    !!stepConfig + " / " +
    !!stepRender + " / " +
    !!stepPrice
  );

  const widthCards = document.querySelectorAll(".type-card");
  alert("type cards: " + widthCards.length);

  widthCards.forEach(function (card) {
    card.addEventListener("click", function () {
      alert("клик по типу работает: " + card.dataset.width);

      stepLength.innerHTML = `
        <section class="tree-section">
          <h2 class="tree-title">ТЕСТ: выбор длины открылся</h2>
          <div class="cards cards-length">
            <button class="card length-card" type="button">
              <div class="fake-garage preview-small garage-length-8"></div>
              <div class="card-body">
                <div class="card-title">8 метров</div>
                <div class="card-subtitle">тестовая карточка</div>
              </div>
            </button>
          </div>
        </section>
      `;
    });
  });
});
