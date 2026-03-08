document.addEventListener("DOMContentLoaded", function () {
  const stepLength = document.getElementById("step-length");
  const stepRoof = document.getElementById("step-roof");
  const stepStyle = document.getElementById("step-style");
  const stepRender = document.getElementById("step-render");
  const stepPrice = document.getElementById("step-price");

  const state = {
    width: null,
    length: null
  };

  const lengthOptions = {
    6: [
      { value: 6, title: "6 метров", subtitle: "только автомобиль" },
      { value: 8, title: "8 метров", subtitle: "авто + стеллаж" },
      { value: 10, title: "10 метров", subtitle: "авто + хозблок" },
      { value: 12, title: "12 метров", subtitle: "авто + мастерская" }
    ],
    8: [
      { value: 6, title: "6 метров", subtitle: "только авто" },
      { value: 8, title: "8 метров", subtitle: "авто + стеллаж" },
      { value: 10, title: "10 метров", subtitle: "авто + хозблок" },
      { value: 12, title: "12 метров", subtitle: "авто + мастерская" },
      { value: 14, title: "14 метров", subtitle: "мастерская + хранение" }
    ]
  };

  function clearBelow(fromStep) {
    if (fromStep === "type") {
      stepLength.innerHTML = "";
      stepRoof.innerHTML = "";
      stepStyle.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      state.length = null;
    }

    if (fromStep === "length") {
      stepRoof.innerHTML = "";
      stepStyle.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
    }
  }

  function renderLengthStep() {
    if (!state.width) return;

    const options = lengthOptions[state.width] || [];

    stepLength.innerHTML = `
      <section class="tree-section">
        <h2>Выберите длину гаража</h2>
        <div class="cards cards-length">
          ${options.map(function (item) {
            return `
              <div class="card length-card" data-length="${item.value}">
                <div class="fake-garage garage-length-${item.value}"></div>
                <p><strong>${item.title}</strong><br>${item.subtitle}</p>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;

    const lengthCards = document.querySelectorAll(".length-card");
    lengthCards.forEach(function (card) {
      card.addEventListener("click", function () {
        state.length = Number(card.dataset.length);
        clearBelow("length");
        renderRoofPreviewStep();
      });
    });
  }

  function renderRoofPreviewStep() {
    if (!state.width || !state.length) return;

    stepRoof.innerHTML = `
      <section class="tree-section tree-result">
        <h2>Ваш гараж: ${state.width} × ${state.length} м</h2>
        <div class="result-card">
          <div class="fake-garage big-preview garage-width-${state.width} garage-length-${state.length}"></div>
          <p>Следующим шагом здесь появится выбор типа кровли.</p>
        </div>
      </section>
    `;
  }

  const widthCards = document.querySelectorAll(".card[data-width]");
  widthCards.forEach(function (card) {
    card.addEventListener("click", function () {
      state.width = Number(card.dataset.width);
      clearBelow("type");
      renderLengthStep();
    });
  });
});
