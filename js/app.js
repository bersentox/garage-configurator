document.addEventListener("DOMContentLoaded", function () {
const stepLength = document.getElementById("step-length");
const stepConfig = document.getElementById("step-config");
const stepRender = document.getElementById("step-render");
const stepPrice = document.getElementById("step-price");
const stepTrust = document.getElementById("step-trust");
const stepAction = document.getElementById("step-action");
const IMAGE_BASE = "https://raw.githubusercontent.com/bersentox/garage-configurator/main/images/garages";
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
function getLengthType(length) {
  return length === 6 ? "short" : "long";
}

function getGarageImageUrl() {
  if (!state.width || !state.length) return "";

  const lengthType = getLengthType(state.length);

  const fileName =
    "garage_" +
    state.width +
    "_" +
    lengthType +
    "_" +
    state.roof +
    "_" +
    state.style +
    ".webp";

  return IMAGE_BASE + "/" + fileName;
}
  function getTypeCardImageUrl(width) {
  if (width === 6) {
    return IMAGE_BASE + "/garage_6_long_gable_graphite.webp";
  }
  return IMAGE_BASE + "/garage_8_long_gable_industrial.webp";
}

function getLengthCardImageUrl(width, length) {
  const map = {
    6: "garage_6_short_back_graphite.webp",
    8: "garage_6_long_back_graphite.webp",
    10: "garage_6_long_gable_graphite.webp",
    12: width === 6
      ? "garage_6_long_gable_industrial.webp"
      : "garage_8_long_back_graphite.webp",
    14: "garage_8_long_gable_graphite.webp"
  };

  return IMAGE_BASE + "/" + map[length];
}

function getRoofCardImageUrl(roofKey) {
  if (roofKey === "gable") {
    return IMAGE_BASE + "/garage_6_short_gable_graphite.webp";
  }
  return IMAGE_BASE + "/garage_6_short_back_graphite.webp";
}
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
    colors: ["#d7dce2","#2b2f36","#1e2228","#2b2f36"]
  },
  {
    key: "sand",
    title: "Песочный",
    colors: ["#d8c7a6","#6a4b3b","#4a342b","#8b7355"]
  },
  {
    key: "wood",
    title: "Под дерево",
    colors: ["#b98a5a","#8e623c","#6f4a2d","#c79a63"]
  },
  {
    key: "chocolate",
    title: "Шоколад",
    colors: ["#6b4a3a","#4a3128","#2f201a","#8a5b46"]
  },
  {
    key: "industrial",
    title: "Индустриальный",
    colors: ["#bfc5cc","#3b4046","#14181f","#5b6570"]
  }
];

  function fmtMoney(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

function getRoofOptions() {
  return [
    { key: "back", title: "Скат назад", cls: "roof-back" },
    { key: "gable", title: "Двускатная", cls: "roof-gable" }
  ];
}

function ensureValidRoof() {
  if (state.roof !== "back" && state.roof !== "gable") {
    state.roof = "back";
  }
}

  function clearBelow(step) {
    if (step === "type") {
      stepLength.innerHTML = "";
      stepConfig.innerHTML = "";
      stepRender.innerHTML = "";
      stepPrice.innerHTML = "";
      stepTrust.innerHTML = "";
      stepAction.innerHTML = "";

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
      stepTrust.innerHTML = "";
      stepAction.innerHTML = "";

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
          <div class="card-image">
  <img src="${getLengthCardImageUrl(state.width, item.value)}" alt="${item.title}">
</div>
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

      <div class="config-shell">
        <div class="config-layout">
          
          <div class="config-sidebar">
            <div class="config-subsection">
              <h3 class="subsection-title">Выберите тип крыши</h3>

              <div class="cards roof-cards">
                ${roofOptions.map(function (roof) {
                  return `
                    <button class="card roof-card ${state.roof === roof.key ? "is-active" : ""}" type="button" data-roof="${roof.key}">
                      <div class="card-image">
                        <img src="${getRoofCardImageUrl(roof.key)}" alt="${roof.title}">
                      </div>
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

              <div class="style-grid style-grid--sidebar">
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

          <div class="config-main">
            <div class="main-preview">
              <img
                class="main-preview-image"
                src="${getGarageImageUrl()}"
                alt="Гараж ${state.width} × ${state.length}"
              >
            </div>
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
    renderTrustBlocks();
    renderActionBlock();
  }
  
function renderTrustBlocks() {
  stepTrust.innerHTML = `
    <section class="tree-section">
    <div class="trust-head-card">
  <h2 class="trust-main-title">Ваш гараж уже выбран. Теперь покажем, почему за результат можно быть спокойным</h2>
</div>

      <div class="trust-grid">
        <div class="trust-card">
          <div class="trust-title">У нас только качественные материалы и комплектующие</div>
          <div class="trust-text">
            Используем проверенные панели, металл и крепёж.
            Контролируем толщину металла, качество окраски и надёжность узлов.
          </div>
          <div class="trust-result">
            Результат: гараж служит годами без перекосов и коррозии.
          </div>
        </div>

        <div class="trust-card">
          <div class="trust-title">Гараж точно встанет на ваш участок</div>
          <div class="trust-text">
            Подбираем габариты и посадку под пятно застройки.
            Учитываем подъезд, уклоны и отступы.
          </div>
          <div class="trust-result">
            Результат: всё открывается, подъезд удобный, посадка продумана.
          </div>
        </div>

        <div class="trust-card">
          <div class="trust-title">Личный прораб контролирует каждый этап</div>
          <div class="trust-text">
            Один ответственный человек ведёт объект от замера до сдачи.
            Контролирует материалы, узлы и качество монтажа.
          </div>
          <div class="trust-result">
            Результат: меньше хаоса, предсказуемые сроки и аккуратная сборка.
          </div>
        </div>

        <div class="trust-card">
          <div class="trust-title">Гарантия и ответственность после сдачи</div>
          <div class="trust-text">
            Все условия фиксируются в договоре.
            Если выявится недочёт — устраняем.
          </div>
          <div class="trust-result">
            Результат: вы не остаётесь один на один с проблемой.
          </div>
        </div>
      </div>

      <div class="steps-panel">
        <h2 class="config-title">Как проходит заказ — от первого звонка до сдачи</h2>

        <div class="steps-list">
          <div class="step-line">
            <div class="step-num">1</div>
            <div class="step-content">
              <div class="step-title">Звонок и уточнение задачи</div>
              <div class="step-text">Размер, место установки, крыша, опции, пожелания по эксплуатации.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">2</div>
            <div class="step-content">
              <div class="step-title">Выезд и замер участка</div>
              <div class="step-text">Смотрим пятно застройки, подъезд, уклоны, отступы и основание.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">3</div>
            <div class="step-content">
              <div class="step-title">Проект и согласование сметы</div>
              <div class="step-text">Фиксируем решение, уточняем состав работ и подтверждаем цену.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">4</div>
            <div class="step-content">
              <div class="step-title">Подготовка каркаса и комплекта материалов</div>
              <div class="step-text">Изготавливаем каркас, комплектуем панели, крепёж, доборные элементы и ворота.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">5</div>
            <div class="step-content">
              <div class="step-title">Монтаж на объекте</div>
              <div class="step-text">Собираем конструкцию по чек-листу: каркас, панели, кровля, ворота, узлы и примыкания.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">6</div>
            <div class="step-content">
              <div class="step-title">Проверка и сдача объекта</div>
              <div class="step-text">Проверяем геометрию, работу ворот, герметичность и итоговое качество сборки.</div>
            </div>
          </div>

          <div class="step-line">
            <div class="step-num">7</div>
            <div class="step-content">
              <div class="step-title">Гарантия и поддержка</div>
              <div class="step-text">Если после сдачи что-то проявится — закрываем вопрос и не уходим от ответственности.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderActionBlock() {
  stepAction.innerHTML = `
    <section class="tree-section">
      <div class="action-panel">
        <div class="action-overline">Следующий шаг</div>
        <h2 class="action-title">Получите точный расчёт и проект под ваш участок</h2>
        <div class="action-text">
          Проверим конфигурацию, уточним детали по установке и подготовим окончательную смету без серых зон и сюрпризов.
        </div>

        <div class="action-buttons">
          <a class="action-btn action-btn--primary" href="#popup:zayavka">Получить точный расчёт</a>
          <a class="action-btn action-btn--ghost" href="tel:+79969500777">Позвонить: +7 (996) 950-07-77</a>
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
