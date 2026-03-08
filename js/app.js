document.addEventListener("DOMContentLoaded", function () {
  const stepLength = document.getElementById("step-length");
  const stepConfig = document.getElementById("step-config");
  const stepRender = document.getElementById("step-render");
  const stepPrice = document.getElementById("step-price");

  const state = {
    width: null,
    length: null,
    roof: "back",
    style: "graphite"
  };

  const lengthOptions = {
    6: [
      { value: 6, title: "6 метров", subtitle: "только авто" },
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

  function clearBelow(step) {
    if (step === "type") {
      stepLength.innerHTML = "";
      stepConfig.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      state.length = null;
      state.roof = "back";
      state.style = "graphite";
    }

    if (step === "length") {
      stepConfig.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      state.roof = "back";
      state.style = "graphite";
    }
  }

  function renderLengthStep() {
    const options = lengthOptions[state.width] || [];

    let html = `
      <section class="tree-section">
        <h2 class="tree-title">Выберите длину гаража</h2>
        <div class="cards cards-length">
    `;

    options.forEach(function (item) {
      html += `
        <button class="card length-card" type="button" data-length="${item.value}">
          <div class="fake-garage preview-small garage-length-${item.value}"></div>
          <div class="card-body">
            <div class="card-title">${item.title}</div>
            <div class="card-subtitle">${item.subtitle}</div>
          </div>
        </button>
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
        renderConfigStep();
      });
    });
  }

  function renderConfigStep() {
    stepConfig.innerHTML = `
      <section class="tree-section">
        <h2 class="config-title">Ваш гараж: ${state.width} × ${state.length} м</h2>

        <div class="config-panel">
          <div class="fake-garage main-preview garage-length-${state.length} roof-${state.roof} style-${state.style}"></div>

          <div class="config-subsection">
            <h3 class="subsection-title">Выберите тип крыши</h3>

            <div class="cards roof-cards">
              <button class="card roof-card ${state.roof === "back" ? "is-active" : ""}" type="button" data-roof="back">
                <div class="fake-garage roof-mini roof-back"></div>
                <div class="card-body">
                  <div class="card-title">Скат назад</div>
                </div>
              </button>

              <button class="card roof-card ${state.roof === "gable" ? "is-active" : ""}" type="button" data-roof="gable">
                <div class="fake-garage roof-mini roof-gable"></div>
                <div class="card-body">
                  <div class="card-title">Двускатная</div>
                </div>
              </button>

              <button class="card roof-card ${state.roof === "side" ? "is-active" : ""}" type="button" data-roof="side">
                <div class="fake-garage roof-mini roof-side"></div>
                <div class="card-body">
                  <div class="card-title">Скат вбок</div>
                </div>
              </button>
            </div>
          </div>

          <div class="config-subsection">
            <h3 class="subsection-title">Выберите стиль</h3>

            <div class="style-grid">
              ${styles.map(function (style) {
                return `
                  <button class="style-card ${state.style === style.key ? "is-active" : ""}" type="button" data-style="${style.key}">
                    <div class="style-palette">
                      ${style.colors.map(function (color) {
                        return `<span style="background:${color}"></span>`;
                      }).join("")}
                    </div>
                    <div class="style-title">${style.title}</div>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </section>
    `;

    bindConfigEvents();
    renderResultBlocks();
  }

  function renderResultBlocks() {
    stepRender.innerHTML = `
      <section class="tree-section">
        <div class="config-panel">
          <h2 class="config-title">Следующий шаг</h2>
          <p class="muted-note">
            Здесь позже появятся кнопка визуализации рендера, итоговая цена,
            состав комплектации и блок доверия.
          </p>
        </div>
      </section>
    `;

    stepPrice.innerHTML = "";
  }

  function bindConfigEvents() {
    const roofCards = document.querySelectorAll(".roof-card");
    roofCards.forEach(function (card) {
      card.addEventListener("click", function () {
        state.roof = card.dataset.roof;
        renderConfigStep();
      });
    });

    const styleCards = document.querySelectorAll(".style-card");
    styleCards.forEach(function (card) {
      card.addEventListener("click", function () {
        state.style = card.dataset.style;
        renderConfigStep();
      });
    });
  }

  function bindTypeEvents() {
    const widthCards = document.querySelectorAll(".type-card");

    widthCards.forEach(function (card) {
      card.addEventListener("click", function () {
        state.width = Number(card.dataset.width);

        widthCards.forEach(function (item) {
          item.classList.remove("is-active");
        });

        card.classList.add("is-active");

        clearBelow("type");
        renderLengthStep();
      });
    });
  }

  bindTypeEvents();
});
