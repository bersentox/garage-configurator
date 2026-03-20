import { applyColorPreset, getLayoutByLength } from "./state.js";
import { createGarage3DViewer } from "./garage3d.js";

const PRICES = window.CONFIG_PRICES || {};
const RATE_PER_M2 = PRICES.RATE_PER_M2 || {};
const OPTIONS_PRICE = PRICES.OPTIONS_PRICE || {};
const LAYOUT_SURCHARGE = PRICES.LAYOUT_SURCHARGE || {};
const ROOF_SURCHARGE = PRICES.ROOF_SURCHARGE || {};
const ELEMENT_PRICE = PRICES.ELEMENT_PRICE || {};
const FOUNDATION_RATE_PER_M2 = PRICES.FOUNDATION_RATE_PER_M2 || {};

const LAYOUT_LABELS = {
  classic: "Классическая компоновка",
  storage: "С зоной хранения",
  utility: "С хозблоком"
};

const OPTION_LABELS = {
  gateAutomation: "Автоматика ворот",
  interiorElectricity: "Внутренняя электрика",
  exteriorLighting: "Внешнее освещение",
  ventilation: "Вентиляция",
  gutters: "Водостоки"
};

const FOUNDATION_LABELS = {
  none: "Без фундамента",
  pile: "Свайный",
  strip: "Ленточный",
  slab: "Монолитная плита"
};

const PRESET_LABELS = {
  graphite: "Графит",
  grey: "Серый",
  sand: "Песочный",
  chocolate: "Шоколад",
  wood: "Под дерево",
  industrial: "Индастриал",
  custom: "Индивидуальная палитра"
};

const LENGTH_USAGE_BY_WIDTH = {
  6: { 6: "только для машины", 8: "машина + хранение", 10: "машина + хозблок" },
  8: { 6: "два авто без запаса", 8: "два авто + хранение", 10: "два авто + мастерская" }
};

function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

function getBuildTimeDays(config) {
  let days = 7;
  if (config.width >= 8) days += 1;
  if (config.length >= 8) days += 1;
  if (config.length >= 10) days += 1;
  if (config.partition) days += 1;
  if (config.doors > 0) days += 1;
  if (config.windows > 1) days += 1;
  const enabledOptions = Object.values(config.options).filter(Boolean).length;
  return days + Math.min(enabledOptions, 2);
}

function calculatePrice(config) {
  const widthRate = RATE_PER_M2[config.width] || RATE_PER_M2[6] || 0;
  const basePrice = config.width * config.length * widthRate;
  const layout = getLayoutByLength(config.length);
  const layoutSurcharge = LAYOUT_SURCHARGE[layout] || 0;
  const roofSurcharge = ROOF_SURCHARGE[config.roofType] || 0;
  const foundationRate = FOUNDATION_RATE_PER_M2[config.foundation] || 0;
  const foundationPrice = config.width * config.length * foundationRate;
  let total = basePrice + layoutSurcharge + roofSurcharge + foundationPrice;

  if (config.shelves) total += ELEMENT_PRICE.shelves || 0;
  if (config.partition) total += ELEMENT_PRICE.partition || 0;
  total += config.doors * (ELEMENT_PRICE.door || 0);
  total += config.windows * (ELEMENT_PRICE.window || 0);

  Object.entries(config.options).forEach(([key, enabled]) => {
    if (enabled) total += OPTIONS_PRICE[key] || 0;
  });

  return total;
}

function buildSummaryMarkup(state) {
  const additionalItems = [];
  if (state.shelves) additionalItems.push("стеллажи");
  if (state.partition) additionalItems.push("перегородка");
  if (state.doors) additionalItems.push(`${state.doors} доп. двер.`);
  if (state.windows) additionalItems.push(`${state.windows} доп. окон`);

  const selectedOptions = Object.entries(state.options)
    .filter(([, enabled]) => enabled)
    .map(([key]) => OPTION_LABELS[key])
    .join(", ") || "Без дополнительных инженерных опций";

  const summaryItems = [
    ["Тип", state.type],
    ["Размер", `${state.width} × ${state.length} м`],
    ["Планировка", LAYOUT_LABELS[state.layout]],
    ["Фундамент", FOUNDATION_LABELS[state.foundation]],
    ["Цвет", PRESET_LABELS[state.colorPreset] || PRESET_LABELS.custom],
    ["Доп. элементы", additionalItems.join(", ") || "Без дополнительных элементов"],
    ["Инженерия", selectedOptions]
  ];

  return summaryItems
    .map(([label, value]) => `
      <article class="gc-m-summary-item">
        <span class="gc-m-summary-label">${label}</span>
        <span class="gc-m-summary-value">${value}</span>
      </article>
    `)
    .join("");
}

export function mountConfigurator({ state, root }) {
  const productTitle = root.querySelector("#productTitle");
  const baseInfo = root.querySelector("#baseInfo");
  const introPrice = root.querySelector("#introPrice");
  const introTiming = root.querySelector("#introTiming");
  const viewerDimension = root.querySelector("#viewerDimension");
  const viewerPreset = root.querySelector("#viewerPreset");
  const lengthCards = [...root.querySelectorAll(".length-card")];
  const lengthInput = root.querySelector("#lengthInput");
  const shelvesToggle = root.querySelector("#shelvesToggle");
  const partitionToggle = root.querySelector("#partitionToggle");
  const foundationOptions = [...root.querySelectorAll(".foundation-option")];
  const doorsCount = root.querySelector("#doorsCount");
  const windowsCount = root.querySelector("#windowsCount");
  const presetButtons = [...root.querySelectorAll(".color-presets [data-preset]")];
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
  const finalCta = root.querySelector("#finalCta");

  const viewer = createGarage3DViewer({ containerId: "garage-3d-viewer" });

  function syncColorInputs() {
    wallColor.value = state.colors.wall;
    roofColor.value = state.colors.roof;
    trimColor.value = state.colors.trim;
    gateColor.value = state.colors.gate;
    interiorColor.value = state.colors.interiorWall;
  }

  function render() {
    state.layout = getLayoutByLength(state.length);
    state.price = calculatePrice(state);
    state.buildTimeDays = getBuildTimeDays(state);

    productTitle.textContent = state.type;
    baseInfo.textContent = `Ширина ${state.width} м · ${state.gates} ${state.gates === 1 ? "ворота" : "ворот"} · ${LAYOUT_LABELS[state.layout]}`;
    introPrice.textContent = formatPrice(state.price);
    introTiming.textContent = `${state.buildTimeDays}–${state.buildTimeDays + 1} дней`;

    lengthInput.value = String(state.length);
    shelvesToggle.checked = state.shelves;
    partitionToggle.checked = state.partition;
    doorsCount.textContent = String(state.doors);
    windowsCount.textContent = String(state.windows);

    lengthCards.forEach((card) => {
      const cardLength = Number(card.dataset.length);
      const previewConfig = { ...state, length: cardLength };
      const area = state.width * cardLength;
      card.classList.toggle("is-active", cardLength === state.length);
      card.querySelector(".length-area").textContent = `${area} м²`;
      card.querySelector(".length-usage").textContent = LENGTH_USAGE_BY_WIDTH[state.width]?.[cardLength] || "индивидуальная компоновка";
      card.querySelector(".length-price").textContent = `от ${formatPrice(calculatePrice(previewConfig))}`;
    });

    foundationOptions.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.foundation === state.foundation);
    });

    presetButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.preset === state.colorPreset);
    });

    root.querySelectorAll("[data-option]").forEach((checkbox) => {
      checkbox.checked = Boolean(state.options[checkbox.dataset.option]);
    });

    syncColorInputs();
    viewer.loadModelBySize(state.width, state.length);
    viewer.applyColors(state.colors);

    viewerDimension.textContent = `Размер: ${state.width} × ${state.length} м`;
    viewerPreset.textContent = `Палитра: ${PRESET_LABELS[state.colorPreset] || PRESET_LABELS.custom}`;

    summaryList.innerHTML = buildSummaryMarkup(state);
    summaryTime.textContent = `Ориентировочный срок производства и монтажа: ${state.buildTimeDays}–${state.buildTimeDays + 1} дней.`;

    const compactLine = `${state.type} · ${state.width} × ${state.length} м · ${FOUNDATION_LABELS[state.foundation]}`;
    ctaSummary.textContent = compactLine;
    ctaPrice.textContent = formatPrice(state.price);
    ctaTime.textContent = `Срок: ${state.buildTimeDays}–${state.buildTimeDays + 1} дней`;
    stickyPrice.textContent = formatPrice(state.price);
    stickyMeta.textContent = `${state.width} × ${state.length} м · ${PRESET_LABELS[state.colorPreset] || PRESET_LABELS.custom}`;
  }

  lengthCards.forEach((card) => card.addEventListener("click", () => {
    state.length = Number(card.dataset.length);
    render();
  }));

  lengthInput.addEventListener("input", () => {
    const nextLength = Math.max(6, Math.min(12, Number(lengthInput.value) || 6));
    state.length = nextLength;
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

  foundationOptions.forEach((button) => button.addEventListener("click", () => {
    state.foundation = button.dataset.foundation || "none";
    render();
  }));

  presetButtons.forEach((button) => button.addEventListener("click", () => {
    applyColorPreset(state, button.dataset.preset);
    render();
  }));

  [[wallColor, "wall"], [roofColor, "roof"], [trimColor, "trim"], [gateColor, "gate"], [interiorColor, "interiorWall"]].forEach(([input, key]) => {
    input.addEventListener("input", () => {
      state.colorPreset = "custom";
      state.colors[key] = input.value;
      render();
    });
  });

  root.querySelectorAll("[data-option]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.options[checkbox.dataset.option] = checkbox.checked;
      render();
    });
  });

  const observer = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(([entry]) => {
      stickyBar.classList.toggle("is-hidden", entry.isIntersecting);
    }, { threshold: 0.2 })
    : null;

  observer?.observe(finalCta);
  render();

  return {
    render,
    destroy() {
      observer?.disconnect();
      viewer.destroy();
    }
  };
}
