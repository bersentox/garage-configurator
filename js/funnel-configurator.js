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
    description: "Выберите общее стилевое направление.",
    options: [
      { value: "dark", label: "Dark styles", priceDelta: 40000 },
      { value: "light", label: "Light styles", priceDelta: 20000 }
    ]
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

  function getApproxPrice() {
    let total = BASE_PRICE;

    STEPS.forEach(function (step) {
      const selectedValue = state.selections[step.key];
      const selectedOption = step.options.find(function (option) {
        return option.value === selectedValue;
      });

      if (selectedOption) {
        total += selectedOption.priceDelta;
      }
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
      const selectedValue = state.selections[step.key];
      const selectedOption = step.options.find(function (option) {
        return option.value === selectedValue;
      });

      const li = document.createElement("li");
      li.textContent = step.title.replace(" — ", ": ") + " " + (selectedOption ? selectedOption.label : "—");
      summaryListEl.appendChild(li);
    });

    const price = getApproxPrice();
    summaryPriceEl.textContent = formatMoney(price);
    updateResultSectionPrice(price);
    progressEl.textContent = "Готово";
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

    stepTitleEl.textContent = step.title;
    stepDescriptionEl.textContent = step.description;

    optionsEl.innerHTML = "";

    step.options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "funnel-option";
      button.textContent = option.label;
      button.addEventListener("click", function () {
        selectOption(option.value);
      });
      optionsEl.appendChild(button);
    });
  }

  restartButton.addEventListener("click", function () {
    state.currentStepIndex = 0;
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
