const STYLE_CATEGORIES = [
  {
    value: "monochrome",
    title: "Монохромные оттенки",
    heading: "Какой характер гаража вам ближе?",
    includedStylesText: "Графит · Индустриальный · Контрастный серый",
    previewImage: "images/garages/garage_8_long_gable_graphite.webp",
    styles: [
      { value: "graphite", label: "Графит", priceDelta: 40000 },
      { value: "industrial", label: "Индустриальный", priceDelta: 35000 },
      { value: "contrast-gray", label: "Контрастный серый", priceDelta: 45000 }
    ]
  },
  {
    value: "natural",
    title: "Природные оттенки",
    heading: "Какой характер гаража вам ближе?",
    includedStylesText: "Песочный · Шоколад · Под дерево",
    previewImage: "images/garages/garage_8_long_gable_sand.webp",
    styles: [
      { value: "sand", label: "Песочный", priceDelta: 20000 },
      { value: "chocolate", label: "Шоколад", priceDelta: 30000 },
      { value: "wood", label: "Под дерево", priceDelta: 50000 }
    ]
  }
];

const STEPS = [
  {
    key: "type",
    title: "Шаг 1 — Тип гаража",
    description: "Выберите формат гаража под ваш сценарий.",
    options: [
      { value: "one-car", label: "One car", priceDelta: 0 },
      { value: "two-cars", label: "Two cars", priceDelta: 300000 }
    ]
  },
  {
    key: "usage",
    title: "Шаг 2 — Назначение",
    description: "Укажите, как планируете использовать пространство.",
    options: [
      { value: "car-storage", label: "Car + storage", priceDelta: 80000 },
      { value: "car-storage-utility", label: "Car + storage + utility block", priceDelta: 220000 }
    ]
  },
  {
    key: "style",
    title: "Шаг 3 — Стиль",
    description: "Выберите стиль гаража.",
    options: []
  },
  {
    key: "package",
    title: "Шаг 4 — Комплектация",
    description: "Выберите пакет оснащения.",
    options: [
      { value: "basic", label: "Basic", priceDelta: 0 },
      { value: "standard", label: "Standard", priceDelta: 180000 },
      { value: "maximum", label: "Maximum", priceDelta: 360000 }
    ]
  }
];

const BASE_PRICE = 900000;

const state = {
  currentStepIndex: 0,
  styleSubstep: "category",
  selections: {}
};

const wizardRoot = document.querySelector("[data-funnel-configurator]");

if (wizardRoot) {
  const progressEl = document.getElementById("funnelProgress");
  const stepCardEl = document.getElementById("funnelStepCard");
  const stepTitleEl = document.getElementById("funnelStepTitle");
  const stepDescriptionEl = document.getElementById("funnelStepDescription");
  const optionsEl = document.getElementById("funnelOptions");
  const summaryEl = document.getElementById("funnelSummary");
  const summaryListEl = document.getElementById("funnelSummaryList");
  const summaryPriceEl = document.getElementById("funnelSummaryPrice");
  const restartButton = document.getElementById("funnelRestartBtn");

  function formatMoney(value) {
    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
  }

  function getSelectedStyleOption() {
    const selectedCategory = STYLE_CATEGORIES.find(function (category) {
      return category.value === state.selections.styleCategory;
    });

    if (!selectedCategory) {
      return null;
    }

    return selectedCategory.styles.find(function (style) {
      return style.value === state.selections.style;
    }) || null;
  }

  function getStepPriceDelta(step) {
    if (step.key === "style") {
      const selectedStyle = getSelectedStyleOption();
      return selectedStyle ? selectedStyle.priceDelta : 0;
    }

    const selectedValue = state.selections[step.key];
    const selectedOption = step.options.find(function (option) {
      return option.value === selectedValue;
    });

    return selectedOption ? selectedOption.priceDelta : 0;
  }

  function getApproxPrice() {
    let total = BASE_PRICE;

    STEPS.forEach(function (step) {
      total += getStepPriceDelta(step);
    });

    return total;
  }

  function updateResultSectionPrice(price) {
    const resultPriceEl = document.querySelector(".result__price");
    const resultNoteEl = document.querySelector(".result__note");

    if (resultPriceEl) {
      resultPriceEl.textContent = "≈ " + formatMoney(price);
    }

    if (resultNoteEl && state.selections.package) {
      const packageStep = STEPS.find(function (step) {
        return step.key === "package";
      });
      const packageOption = packageStep.options.find(function (option) {
        return option.value === state.selections.package;
      });

      if (packageOption) {
        resultNoteEl.textContent = "Предварительный расчёт для пакета «" + packageOption.label + "». Финальная стоимость подтверждается после уточнения проекта.";
      }
    }
  }

  function renderSummary() {
    stepCardEl.hidden = true;
    summaryEl.hidden = false;

    summaryListEl.innerHTML = "";

    STEPS.forEach(function (step) {
      let selectedLabel = "—";

      if (step.key === "style") {
        const styleCategory = STYLE_CATEGORIES.find(function (category) {
          return category.value === state.selections.styleCategory;
        });
        const styleOption = getSelectedStyleOption();
        if (styleCategory && styleOption) {
          selectedLabel = styleCategory.title + " / " + styleOption.label;
        }
      } else {
        const selectedValue = state.selections[step.key];
        const selectedOption = step.options.find(function (option) {
          return option.value === selectedValue;
        });
        selectedLabel = selectedOption ? selectedOption.label : "—";
      }

      const li = document.createElement("li");
      li.textContent = step.title.replace(" — ", ": ") + " " + selectedLabel;
      summaryListEl.appendChild(li);
    });

    const price = getApproxPrice();
    summaryPriceEl.textContent = formatMoney(price);
    updateResultSectionPrice(price);
    progressEl.textContent = "Готово";
  }

  function createRegularOptionButton(option) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "funnel-option";
    button.textContent = option.label;
    button.addEventListener("click", function () {
      selectOption(option.value);
    });
    return button;
  }

  function renderStyleCategoryOptions() {
    stepTitleEl.textContent = "Какой характер гаража вам ближе?";
    stepDescriptionEl.textContent = "Сначала выберите категорию оттенков, затем конкретный стиль.";

    optionsEl.classList.add("funnel-options--style-categories");
    optionsEl.innerHTML = "";

    STYLE_CATEGORIES.forEach(function (category) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "funnel-style-category";
      button.setAttribute("aria-label", category.title);
      button.innerHTML =
        '<span class="funnel-style-category__image-wrap">' +
          '<img class="funnel-style-category__image" src="' + category.previewImage + '" alt="' + category.title + '">' +
        "</span>" +
        '<span class="funnel-style-category__body">' +
          '<span class="funnel-style-category__title">' + category.title + "</span>" +
          '<span class="funnel-style-category__list">' + category.includedStylesText + "</span>" +
        "</span>";

      button.addEventListener("click", function () {
        state.selections.styleCategory = category.value;
        state.selections.style = "";
        state.styleSubstep = "style";
        renderStep();
      });

      optionsEl.appendChild(button);
    });
  }

  function renderStyleOptions() {
    const selectedCategory = STYLE_CATEGORIES.find(function (category) {
      return category.value === state.selections.styleCategory;
    });

    if (!selectedCategory) {
      state.styleSubstep = "category";
      renderStyleCategoryOptions();
      return;
    }

    stepTitleEl.textContent = "Шаг 3B — Выберите стиль";
    stepDescriptionEl.textContent = "Категория: " + selectedCategory.title + ".";

    optionsEl.classList.remove("funnel-options--style-categories");
    optionsEl.innerHTML = "";

    selectedCategory.styles.forEach(function (styleOption) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "funnel-option";
      button.textContent = styleOption.label;
      button.addEventListener("click", function () {
        state.selections.style = styleOption.value;
        state.currentStepIndex += 1;
        state.styleSubstep = "category";
        renderStep();
      });
      optionsEl.appendChild(button);
    });
  }

  function selectOption(value) {
    const step = STEPS[state.currentStepIndex];
    state.selections[step.key] = value;

    if (state.currentStepIndex === STEPS.length - 1) {
      renderSummary();
      return;
    }

    state.currentStepIndex += 1;
    renderStep();
  }

  function renderStep() {
    const step = STEPS[state.currentStepIndex];

    summaryEl.hidden = true;
    stepCardEl.hidden = false;
    progressEl.textContent = "Шаг " + (state.currentStepIndex + 1) + " из " + STEPS.length;

    optionsEl.classList.remove("funnel-options--style-categories");

    if (step.key === "style") {
      if (state.styleSubstep === "category") {
        renderStyleCategoryOptions();
      } else {
        renderStyleOptions();
      }
      return;
    }

    stepTitleEl.textContent = step.title;
    stepDescriptionEl.textContent = step.description;

    optionsEl.innerHTML = "";

    step.options.forEach(function (option) {
      optionsEl.appendChild(createRegularOptionButton(option));
    });
  }

  restartButton.addEventListener("click", function () {
    state.currentStepIndex = 0;
    state.styleSubstep = "category";
    state.selections = {};

    const resultPriceEl = document.querySelector(".result__price");
    const resultNoteEl = document.querySelector(".result__note");

    if (resultPriceEl) {
      resultPriceEl.textContent = "от " + formatMoney(BASE_PRICE);
    }

    if (resultNoteEl) {
      resultNoteEl.textContent = "Итоговая стоимость уточняется после финальной конфигурации и замера участка.";
    }

    renderStep();
  });

  renderStep();
}
