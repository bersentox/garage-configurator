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

  function clearBelow(step) {
    if (step === "type") {
      stepLength.innerHTML = "";
      stepRoof.innerHTML = "";
      stepStyle.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      state.length = null;
    }

    if (step === "length") {
      stepRoof.innerHTML = "";
      stepStyle.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
    }
  }

  function renderLengthStep() {
    const options = lengthOptions[state.width] || [];

    let html = `
      <section class="tree-section">
        <h2>Выберите длину гаража</h2>
        <div class="cards cards-length">
    `;

    options.forEach(function (item) {
      html += `
        <div class="card length-card" data-length="${item.value}">
          <div class="fake-garage garage-length-${item.value}"></div>
          <p><strong>${item.title}</strong><br>${item.subtitle}</p>
        </div>
      `;
    });

    html += `
        </div>
      </section>
    `;

    stepLength.innerHTML = html;

    const lengthCards = document.querySelectorAll(".length-card");
    lengthCards.forEach(function (card) {
      card.addEventListener("click", function () {
        state.length = Number(card.dataset.length);
        clearBelow("length");
        renderPreviewStep();
      });
    });
  }

function renderPreviewStep() {

  stepRoof.innerHTML = `
    <section class="tree-section tree-result">
      <h2>Ваш гараж: ${state.width} × ${state.length} м</h2>

      <div class="result-card">

        <div class="fake-garage big-preview garage-length-${state.length}"></div>

        <h3 style="margin-top:30px">Выберите тип крыши</h3>

        <div class="cards">

          <div class="card roof-card" data-roof="back">
            <div class="fake-garage"></div>
            <p><strong>Скат назад</strong></p>
          </div>

          <div class="card roof-card" data-roof="gable">
            <div class="fake-garage"></div>
            <p><strong>Двускатная</strong></p>
          </div>

          <div class="card roof-card" data-roof="side">
            <div class="fake-garage"></div>
            <p><strong>Скат вбок</strong></p>
          </div>

        </div>

      </div>

    </section>
  `;

  const roofCards = document.querySelectorAll(".roof-card");

  roofCards.forEach(function(card){

    card.addEventListener("click", function(){

      const roof = card.dataset.roof;

      showRoofResult(roof);

    });

  });

}
function showRoofResult(roof) {
  const roofLabels = {
    back: "Скат назад",
    gable: "Двускатная",
    side: "Скат вбок"
  };

  const styles = [
    {
      key: "graphite",
      title: "Графит",
      colors: ["#D9DDE2", "#2B2F36", "#1F232A", "#2B2F36"]
    },
    {
      key: "sand",
      title: "Песочный",
      colors: ["#D8C7A6", "#6A4B3B", "#4A342B", "#8B7355"]
    },
    {
      key: "contrast",
      title: "Контраст",
      colors: ["#F7F7F5", "#1F232A", "#1F232A", "#F7F7F5"]
    },
    {
      key: "scandi",
      title: "Сканди",
      colors: ["#EEEDE8", "#9099A3", "#2B2F36", "#E8EAED"]
    },
    {
      key: "industrial",
      title: "Индустриальный",
      colors: ["#BFC5CC", "#3B4046", "#14181F", "#5B6570"]
    }
  ];

  stepStyle.innerHTML = `
    <section class="tree-section">
      <h2>Выбранная крыша: ${roofLabels[roof]}</h2>

      <div class="result-card">
        <div class="fake-garage big-preview garage-length-${state.length} roof-preview roof-${roof}"></div>

        <h3 style="margin-top:30px">Выберите стиль</h3>

        <div class="style-grid">
          ${styles.map(style => `
            <div class="style-card" data-style="${style.key}">
              <div class="style-palette">
                ${style.colors.map(color => `<span style="background:${color}"></span>`).join("")}
              </div>
              <p><strong>${style.title}</strong></p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;

  const styleCards = document.querySelectorAll(".style-card");
  styleCards.forEach(function(card) {
    card.addEventListener("click", function() {
      showStyleResult(card.dataset.style, roof);
    });
  });
}
  function showStyleResult(style, roof) {
  const styleLabels = {
    graphite: "Графит",
    sand: "Песочный",
    contrast: "Контраст",
    scandi: "Сканди",
    industrial: "Индустриальный"
  };

  stepRender.innerHTML = `
    <section class="tree-section">
      <h2>Стиль выбран: ${styleLabels[style]}</h2>

      <div class="result-card">
        <div class="fake-garage big-preview garage-length-${state.length} roof-preview roof-${roof} style-${style}"></div>

        <p style="margin-top:20px">
          Следующим шагом здесь будет кнопка визуализации рендера и итоговая цена.
        </p>
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
