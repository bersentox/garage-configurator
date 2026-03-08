document.addEventListener("DOMContentLoaded", function () {
  const stepLength = document.getElementById("step-length");
  const stepConfig = document.getElementById("step-config");
  const stepRender = document.getElementById("step-render");
  const stepPrice = document.getElementById("step-price");

  const state = {
    width: null,
    length: null,
    roof: "back",
    style: "graphite",
    windows: 0,
    electricity: false,
    rack: false,
    partition: false,
    foundation: false
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

  function fmtMoney(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  function getRoofOptions() {
    if (state.width === 6) {
      return [
        { key: "back", title: "Скат назад", cls: "roof-back" },
        { key: "gable", title: "Двускатная", cls: "roof-gable" }
      ];
    }

    return [
      { key: "back", title: "Скат назад", cls: "roof-back" },
      { key: "gable", title: "Двускатная", cls: "roof-gable" },
      { key: "side", title: "Скат вбок", cls: "roof-side" }
    ];
  }

  function ensureValidRoof() {
    if (state.width === 6 && state.roof === "side") {
      state.roof = "back";
    }
  }

  function clearBelow(step) {
    if (step === "type") {
      stepLength.innerHTML = "";
      stepConfig.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";

      state.length = null;
      state.roof = "back";
      state.style = "graphite";
      state.windows = 0;
      state.electricity = false;
      state.rack = false;
      state.partition = false;
      state.foundation = false;
    }

    if (step === "length") {
      stepConfig.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";

      state.roof = "back";
      state.style = "graphite";
      state.windows = 0;
      state.electricity = false;
      state.rack = false;
      state.partition = false;
      state.foundation = false;
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

    document.querySelectorAll(".length-card").forEach(function (card) {
      card.addEventListener("click", function () {
        state.length = Number(card.dataset.length);
        clearBelow("length");
        renderConfigStep();
      });
    });
  }

  function calculatePrice() {
    if (!state.width || !state.length) {
      return null;
    }

    const base = PRICES.base[state.width][state.length];
    const roofCoefficient = PRICES.roof[state.roof] || 1;
    const roofAdjusted = base * roofCoefficient;

    const windowsCost = state.windows * PRICES.options.window;
    const electricityCost = state.electricity ? PRICES.options.electricity : 0;
    const rackCost = state.rack ? PRICES.options.rack : 0;
    const partitionCost = state.partition ? PRICES.options.partition : 0;
    const foundationCost = state.foundation ? PRICES.options.foundation : 0;

    const total =
      roofAdjusted +
      windowsCost +
      electricityCost +
      rackCost +
      partitionCost +
      foundationCost;

    return {
      base,
      roofAdjusted,
      roofExtra: roofAdjusted - base,
      windowsCost,
      electricityCost,
      rackCost,
      partitionCost,
      foundationCost,
      total
    };
  }

  function renderConfigStep() {
    ensureValidRoof();

    const roofOptions = getRoofOptions();

    stepConfig.innerHTML = `
      <section class="tree-section">
        <h2 class="config-title">Ваш гараж: ${state.width} × ${state.length} м</h2>

        <div class="config-panel">
          <div class="fake-garage main-preview garage-length-${state.length} roof-${state.roof} style-${state.style}"></div>

          <div class="config-subsection">
            <h3 class="subsection-title">Выберите тип крыши</h3>

            <div class="cards roof-cards">
              ${roofOptions.map(function (roof) {
                return `
                  <button class="card roof-card ${state.roof === roof.key ? "is-active" : ""}" type="button" data-roof="${roof.key}">
                    <div class="fake-garage roof-mini ${roof.cls}"></div>
                    <div class="card-body">
                      <div class="card-title">${roof.title}</div>
                    </div>
                  </button>
                `;
              }).join("")}
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

          <div class="config-subsection">
            <h3 class="subsection-title">Дополнительные опции</h3>

            <div class="options-grid">
              <label class="option-box option-box--count">
                <span class="option-title">Количество окон</span>
                <input id="windowsInput" class="option-input" type="number" min="0" max="10" step="1" value="${state.windows}">
              </label>

              <label class="option-box">
                <input id="electricityInput" type="checkbox" ${state.electricity ? "checked" : ""}>
                <span class="option-title">Электрика и свет</span>
              </label>

              <label class="option-box">
                <input id="rackInput" type="checkbox" ${state.rack ? "checked" : ""}>
                <span class="option-title">Встроенный стеллаж</span>
              </label>

              <label class="option-box">
                <input id="partitionInput" type="checkbox" ${state.partition ? "checked" : ""}>
                <span class="option-title">Перегородка с дверью</span>
              </label>

              <label class="option-box">
                <input id="foundationInput" type="checkbox" ${state.foundation ? "checked" : ""}>
                <span class="option-title">Нужен фундамент</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    `;

    bindConfigEvents();
    renderResultBlocks();
  }

  function renderResultBlocks() {
    const price = calculatePrice();

    if (!price) {
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      return;
    }

    const doorsCount = state.width === 6 ? 1 : 2;

    stepRender.innerHTML = `
      <section class="tree-section">
        <div class="config-panel">
          <h2 class="config-title">Стоимость вашего гаража</h2>

          <div class="price-total">${fmtMoney(price.total)}</div>

          <div class="price-breakdown">
            <div class="price-row">
              <span>Базовая стоимость</span>
              <strong>${fmtMoney(price.base)}</strong>
            </div>

            <div class="price-row">
              <span>Тип крыши</span>
              <strong>${price.roofExtra > 0 ? "+ " + fmtMoney(price.roofExtra) : "в базе"}</strong>
            </div>

            <div class="price-row">
              <span>Окна</span>
              <strong>${price.windowsCost > 0 ? "+ " + fmtMoney(price.windowsCost) : "—"}</strong>
            </div>

            <div class="price-row">
              <span>Электрика и свет</span>
              <strong>${price.electricityCost > 0 ? "+ " + fmtMoney(price.electricityCost) : "—"}</strong>
            </div>

            <div class="price-row">
              <span>Встроенный стеллаж</span>
              <strong>${price.rackCost > 0 ? "+ " + fmtMoney(price.rackCost) : "—"}</strong>
            </div>

            <div class="price-row">
              <span>Перегородка с дверью</span>
              <strong>${price.partitionCost > 0 ? "+ " + fmtMoney(price.partitionCost) : "—"}</strong>
            </div>

            <div class="price-row">
              <span>Фундамент</span>
              <strong>${price.foundationCost > 0 ? "+ " + fmtMoney(price.foundationCost) : "—"}</strong>
            </div>
          </div>
        </div>
      </section>
    `;

    stepPrice.innerHTML = `
      <section class="tree-section">
        <div class="config-panel">
          <h2 class="config-title">Что входит в стоимость</h2>

          <div class="included-list">
            <div class="included-item">Металлокаркас</div>
            <div class="included-item">Сэндвич-панели</div>
            <div class="included-item">${doorsCount} ворот${doorsCount === 1 ? "а" : ""}</div>
            <div class="included-item">1 входная дверь</div>
            <div class="included-item">Водосточная система</div>
            <div class="included-item">Все основные материалы</div>
            <div class="included-item">Крепёж и комплектующие</div>
            <div class="included-item">Доставка материалов</div>
            <div class="included-item">Монтаж под ключ</div>
          </div>
        </div>
      </section>
    `;
  }

  function bindConfigEvents() {
    document.querySelectorAll(".roof-card").forEach(function (card) {
      card.addEventListener("click", function () {
        state.roof = card.dataset.roof;
        renderConfigStep();
      });
    });

    document.querySelectorAll(".style-card").forEach(function (card) {
      card.addEventListener("click", function () {
        state.style = card.dataset.style;
        renderConfigStep();
      });
    });

    const windowsInput = document.getElementById("windowsInput");
    if (windowsInput) {
      windowsInput.addEventListener("input", function () {
        let value = parseInt(windowsInput.value, 10);

        if (isNaN(value) || value < 0) value = 0;
        if (value > 10) value = 10;

        state.windows = value;
        renderResultBlocks();
      });
    }

    const electricityInput = document.getElementById("electricityInput");
    if (electricityInput) {
      electricityInput.addEventListener("change", function () {
        state.electricity = electricityInput.checked;
        renderResultBlocks();
      });
    }

    const rackInput = document.getElementById("rackInput");
    if (rackInput) {
      rackInput.addEventListener("change", function () {
        state.rack = rackInput.checked;
        renderResultBlocks();
      });
    }

    const partitionInput = document.getElementById("partitionInput");
    if (partitionInput) {
      partitionInput.addEventListener("change", function () {
        state.partition = partitionInput.checked;
        renderResultBlocks();
      });
    }

    const foundationInput = document.getElementById("foundationInput");
    if (foundationInput) {
      foundationInput.addEventListener("change", function () {
        state.foundation = foundationInput.checked;
        renderResultBlocks();
      });
    }
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
