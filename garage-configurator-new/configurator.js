import { applyColorPreset } from "./state.js";

const LENGTH_BASE_PRICE = {
  6: 1950000,
  8: 2290000,
  10: 2650000
};

const OPTIONS_PRICE = {
  gateAutomation: 110000,
  interiorElectricity: 150000,
  exteriorLighting: 70000,
  ventilation: 60000,
  gutters: 50000
};

const LAYOUT_MULTIPLIER = {
  classic: 1,
  storage: 1.06,
  utility: 1.11
};

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

function getBuildTimeDays(config) {
  return 4 + (config.length >= 8 ? 1 : 0) + (config.length >= 10 ? 1 : 0) + (config.partition ? 1 : 0);
}

function calculatePrice(config) {
  const knownBase = LENGTH_BASE_PRICE[config.length] || LENGTH_BASE_PRICE[10] + Math.max(0, config.length - 10) * 160000;
  const widthFactor = config.width === 8 ? 1.18 : 1;
  let price = knownBase * widthFactor * LAYOUT_MULTIPLIER[config.layout];

  if (config.shelves) price += 45000;
  if (config.partition) price += 90000;
  price += config.doors * 32000;
  price += config.windows * 18000;

  Object.entries(config.options).forEach(([key, enabled]) => {
    if (enabled) {
      price += OPTIONS_PRICE[key];
    }
  });

  return price;
}

function renderSceneColors(root, colors) {
  root.querySelector(".scene-wall").style.background = colors.wall;
  root.querySelector(".scene-roof").style.background = colors.roof;
  root.querySelector(".scene-trim").style.background = colors.trim;
  root.querySelector(".scene-gate").style.background = colors.gate;
  root.querySelector(".scene-interior").style.background = colors.interiorWall;
}

export function mountConfigurator({ state, root }) {
  const productTitle = root.querySelector("#productTitle");
  const baseInfo = root.querySelector("#baseInfo");
  const lengthCards = [...root.querySelectorAll(".length-card")];
  const lengthInput = root.querySelector("#lengthInput");
  const shelvesToggle = root.querySelector("#shelvesToggle");
  const partitionToggle = root.querySelector("#partitionToggle");
  const doorsCount = root.querySelector("#doorsCount");
  const windowsCount = root.querySelector("#windowsCount");
  const presetButtons = [...root.querySelectorAll(".color-presets button")];
  const wallColor = root.querySelector("#wallColor");
  const roofColor = root.querySelector("#roofColor");
  const trimColor = root.querySelector("#trimColor");
  const gateColor = root.querySelector("#gateColor");
  const interiorColor = root.querySelector("#interiorColor");
  const summaryList = root.querySelector("#summaryList");
  const summaryTime = root.querySelector("#summaryTime");
  const ctaSummary = root.querySelector("#ctaSummary");
  const ctaPrice = root.querySelector("#ctaPrice");
  const ctaTime = root.querySelector("#ctaTime");
  const stickyBar = root.querySelector("#stickyBar");
  const stickyPrice = root.querySelector("#stickyPrice");
  const stickyMeta = root.querySelector("#stickyMeta");
  const scenePreview = root.querySelector("#scenePreview");
  const finalCta = root.querySelector("#finalCta");

  const LAYOUT_LABELS = {
    classic: "классическая",
    utility: "с хозблоком",
    storage: "с зоной хранения"
  };

  const OPTION_LABELS = {
    gateAutomation: "автоматика ворот",
    interiorElectricity: "внутренняя электрика",
    exteriorLighting: "внешнее освещение",
    ventilation: "вентиляция",
    gutters: "водостоки"
  };

  const PRESET_LABELS = {
    graphite: "графит",
    grey: "серый",
    sand: "песочный",
    chocolate: "шоколад",
    wood: "под дерево",
    industrial: "индустриальный",
    custom: "индивидуальная композиция"
  };

  const syncColorInputs = () => {
    wallColor.value = state.colors.wall;
    roofColor.value = state.colors.roof;
    trimColor.value = state.colors.trim;
    gateColor.value = state.colors.gate;
    interiorColor.value = state.colors.interiorWall;
  };

  const render = () => {
    state.price = calculatePrice(state);
    state.buildTimeWeeks = getBuildTimeDays(state);

    productTitle.textContent = state.type.toUpperCase();
    baseInfo.textContent = `ширина ${state.width} м • ${state.gates} ${state.gates === 1 ? "ворота" : "ворот"}`;
    doorsCount.textContent = String(state.doors);
    windowsCount.textContent = String(state.windows);
    lengthInput.value = String(state.length);
    shelvesToggle.checked = state.shelves;
    partitionToggle.checked = state.partition;
    lengthCards.forEach((card) => {
      card.classList.toggle("active", Number(card.dataset.length) === state.length);
    });

    presetButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.preset === state.colorPreset);
    });

    syncColorInputs();
    renderSceneColors(scenePreview, state.colors);

    const selectedOptions = Object.entries(state.options)
      .filter(([, value]) => value)
      .map(([key]) => OPTION_LABELS[key])
      .join(", ") || "без доп. опций";

    const additionalItems = [];
    if (state.shelves) additionalItems.push("стеллажи");
    if (state.partition) additionalItems.push("перегородка");
    if (state.doors) additionalItems.push(`${state.doors} ${state.doors === 1 ? "дверь" : "двери"}`);
    if (state.windows) additionalItems.push(`${state.windows} ${state.windows === 1 ? "окно" : "окна"}`);

    const colorDescription = state.colorPreset === "custom"
      ? "индивидуальная композиция"
      : `${PRESET_LABELS[state.colorPreset]} / гармоничное сочетание крыши и фасонных элементов`;

    summaryList.innerHTML = `
      <li><span class="summary-label">Тип</span><span class="summary-value">${state.type.toLowerCase()}</span></li>
      <li><span class="summary-label">Размер</span><span class="summary-value">${state.width} × ${state.length} м</span></li>
      <li><span class="summary-label">Планировка</span><span class="summary-value">${LAYOUT_LABELS[state.layout]}</span></li>
      <li><span class="summary-label">Дополнительно</span><span class="summary-value">${additionalItems.join(", ") || "без дополнительных элементов"}</span></li>
      <li><span class="summary-label">Цвет</span><span class="summary-value">${colorDescription}</span></li>
      <li><span class="summary-label">Опции</span><span class="summary-value">${selectedOptions}</span></li>
    `;

    const priceText = formatPrice(state.price);
    const timeText = `Срок строительства: ${state.buildTimeWeeks}–${state.buildTimeWeeks + 1} дней`;
    summaryTime.textContent = timeText;
    ctaSummary.textContent = `${state.type.toLowerCase()} · ${state.width} × ${state.length} м · ${LAYOUT_LABELS[state.layout]}`;
    ctaPrice.textContent = priceText;
    ctaTime.textContent = timeText;
    stickyPrice.textContent = priceText;
    stickyMeta.textContent = `${state.width} × ${state.length} м · ${state.gates} ${state.gates === 1 ? "ворота" : "ворот"}`;
  };

  lengthCards.forEach((card) => {
    card.addEventListener("click", () => {
      state.length = Number(card.dataset.length);
      render();
    });
  });

  lengthInput.addEventListener("input", () => {
    state.length = Math.max(6, Number(lengthInput.value) || 6);
    render();
  });

  shelvesToggle.addEventListener("change", () => {
    state.shelves = shelvesToggle.checked;
    render();
  });

  partitionToggle.addEventListener("change", () => {
    state.partition = partitionToggle.checked;
    render();
  });

  root.querySelectorAll("button[data-stepper]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.stepper;
      const direction = Number(button.dataset.dir);
      state[key] = Math.max(0, state[key] + direction);
      render();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyColorPreset(state, button.dataset.preset);
      render();
    });
  });

  [
    [wallColor, "wall"],
    [roofColor, "roof"],
    [trimColor, "trim"],
    [gateColor, "gate"],
    [interiorColor, "interiorWall"]
  ].forEach(([input, key]) => {
    input.addEventListener("input", () => {
      state.colorPreset = "custom";
      state.colors[key] = input.value;
      renderSceneColors(scenePreview, state.colors);
      render();
    });
  });

  root.querySelectorAll("[data-option]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.options[checkbox.dataset.option] = checkbox.checked;
      render();
    });
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      stickyBar.classList.toggle("is-hidden", entry.isIntersecting);
    },
    { threshold: 0.2 }
  );
  observer.observe(finalCta);

  render();

  return {
    render,
    destroy() {
      observer.disconnect();
    }
  };
}
