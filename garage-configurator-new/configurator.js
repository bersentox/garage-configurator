import { applyColorPreset } from "./state.js";

const PRICES = window.CONFIG_PRICES || {};

const RATE_PER_M2 = PRICES.RATE_PER_M2 || {};
const OPTIONS_PRICE = PRICES.OPTIONS_PRICE || {};
const LAYOUT_SURCHARGE = PRICES.LAYOUT_SURCHARGE || {};
const ROOF_SURCHARGE = PRICES.ROOF_SURCHARGE || {};
const ELEMENT_PRICE = PRICES.ELEMENT_PRICE || {};
const FOUNDATION_RATE_PER_M2 = PRICES.FOUNDATION_RATE_PER_M2 || {};

const SUPPORTED_PREVIEW_LENGTHS = [6, 8, 10];

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

function getBuildTimeDays(config) {
  let days = 7;

  if (config.length >= 8) days += 1;
  if (config.length >= 10) days += 1;
  if (config.layout === "storage") days += 1;
  if (config.layout === "utility") days += 2;
  if (config.partition) days += 1;
  if (config.windows >= 1) days += 0.5;
  if (config.doors >= 1) days += 0.5;

  return Math.round(days);
}

function calculatePrice(config) {
  const ratePerM2 = RATE_PER_M2[config.width] || RATE_PER_M2[6] || 0;
  const basePrice = config.width * config.length * ratePerM2;
  const layoutSurcharge = LAYOUT_SURCHARGE[config.layout] || 0;
  const roofKey = config.roofType || config.roof;
  const roofSurcharge = ROOF_SURCHARGE[roofKey] || 0;
  const foundationKey = FOUNDATION_RATE_PER_M2[config.foundation] != null ? config.foundation : "none";
  const foundationRatePerM2 = FOUNDATION_RATE_PER_M2[foundationKey] || 0;
  const foundationPrice = config.width * config.length * foundationRatePerM2;
  let price = basePrice + layoutSurcharge + roofSurcharge + foundationPrice;

  if (config.shelves) price += ELEMENT_PRICE.shelves || 0;
  if (config.partition) price += ELEMENT_PRICE.partition || 0;
  price += config.doors * (ELEMENT_PRICE.door || 0);
  price += config.windows * (ELEMENT_PRICE.window || 0);

  Object.entries(config.options).forEach(([key, enabled]) => {
    if (enabled) {
      price += OPTIONS_PRICE[key] || 0;
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

function isSingleCarWidth6Branch(state) {
  return state.gates === 1 && Number(state.width) === 6;
}

function normalizePreviewLength(value) {
  const numericLength = Number(value);
  if (!Number.isFinite(numericLength)) return SUPPORTED_PREVIEW_LENGTHS[0];

  return SUPPORTED_PREVIEW_LENGTHS.reduce((closest, current) => {
    const currentDistance = Math.abs(current - numericLength);
    const closestDistance = Math.abs(closest - numericLength);
    return currentDistance < closestDistance ? current : closest;
  }, SUPPORTED_PREVIEW_LENGTHS[0]);
}

function getPreviewSvgPath(state) {
  if (!isSingleCarWidth6Branch(state)) return null;

  const normalizedLength = normalizePreviewLength(state.length);
  return `./assets/garage-${normalizedLength}.svg`;
}

export function mountConfigurator({ state, root }) {
  if (!state.foundation) state.foundation = "none";
  const productTitle = root.querySelector("#productTitle");
  const baseInfo = root.querySelector("#baseInfo");
  const lengthCards = [...root.querySelectorAll(".length-card")];
  const lengthInput = root.querySelector("#lengthInput");
  const shelvesToggle = root.querySelector("#shelvesToggle");
  const partitionToggle = root.querySelector("#partitionToggle");
  const foundationOptions = [...root.querySelectorAll(".foundation-option")];
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
  const sceneLegacyPreview = root.querySelector("#sceneLegacyPreview");
  const sceneSvgStage = root.querySelector("#sceneSvgStage");
  const scenePreviewFallback = root.querySelector("#scenePreviewFallback");
  const finalCta = root.querySelector("#finalCta");

  const svgCache = new Map();
  let currentSvgPath = null;
  let previewRequestId = 0;

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

  const FOUNDATION_LABELS = {
    none: "без фундамента",
    pile: "свайный",
    strip: "ленточный",
    slab: "плита"
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

  const LENGTH_USAGE_BY_WIDTH = {
    6: {
      6: "только для машины",
      8: "машина + хранение",
      10: "машина + хозблок"
    },
    8: {
      6: "только для машин",
      8: "машина + хранение",
      10: "машина + хозблок"
    }
  };

  const syncColorInputs = () => {
    wallColor.value = state.colors.wall;
    roofColor.value = state.colors.roof;
    trimColor.value = state.colors.trim;
    gateColor.value = state.colors.gate;
    interiorColor.value = state.colors.interiorWall;
  };

  const recolorPreviewGroup = (id, color) => {
    if (!color) return;
    const group = sceneSvgStage.querySelector(`#${id}`);
    if (!group) return;

    group.querySelectorAll("path, polygon, polyline, rect, circle, ellipse").forEach((node) => {
      node.style.fill = color;
      node.style.stroke = color;
    });
  };

  const applyGaragePreviewColors = () => {
    recolorPreviewGroup("walls", state.colors.wall);
    recolorPreviewGroup("roof", state.colors.roof);
    recolorPreviewGroup("trim", state.colors.trim);
    recolorPreviewGroup("gate", state.colors.gate);
  };

  const setPreviewMode = (mode) => {
    sceneLegacyPreview.hidden = mode !== "legacy";
    sceneSvgStage.hidden = mode !== "svg";
    scenePreviewFallback.hidden = mode !== "fallback";
  };

  const loadGaragePreview = async (path) => {
    const requestId = ++previewRequestId;

    try {
      let svgMarkup = svgCache.get(path);

      if (!svgMarkup) {
        const response = await fetch(path, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Preview request failed: ${path}`);
        }

        svgMarkup = await response.text();
        svgCache.set(path, svgMarkup);
      }

      if (requestId !== previewRequestId) return;

      if (currentSvgPath !== path) {
        sceneSvgStage.innerHTML = svgMarkup;
        currentSvgPath = path;
      }

      applyGaragePreviewColors();
      setPreviewMode("svg");
    } catch (error) {
      console.error(error);
      setPreviewMode("fallback");
    }
  };

  const syncGaragePreview = () => {
    if (!isSingleCarWidth6Branch(state)) {
      previewRequestId += 1;
      setPreviewMode("legacy");
      return;
    }

    const svgPath = getPreviewSvgPath(state);
    if (!svgPath) {
      setPreviewMode("fallback");
      return;
    }

    loadGaragePreview(svgPath);
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
    foundationOptions.forEach((option) => {
      option.classList.toggle("active", option.dataset.foundation === state.foundation);
    });
    lengthCards.forEach((card) => {
      const cardLength = Number(card.dataset.length);
      const area = state.width * cardLength;
      const previewConfig = { ...state, length: cardLength };
      const areaElement = card.querySelector(".length-area");
      const priceElement = card.querySelector(".length-price");
      const usageElement = card.querySelector(".length-usage");
      const presetUsage = LENGTH_USAGE_BY_WIDTH[state.width]?.[cardLength];

      card.classList.toggle("active", cardLength === state.length);
      if (areaElement) areaElement.textContent = `${area} м²`;
      if (priceElement) priceElement.textContent = `от ${formatPrice(calculatePrice(previewConfig))}`;
      if (usageElement && presetUsage) usageElement.textContent = presetUsage;
    });

    presetButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.preset === state.colorPreset);
    });

    syncColorInputs();
    renderSceneColors(scenePreview, state.colors);
    syncGaragePreview();

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
      <li><span class="summary-label">Фундамент</span><span class="summary-value">${FOUNDATION_LABELS[state.foundation] || FOUNDATION_LABELS.none}</span></li>
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
      applyGaragePreviewColors();
      render();
    });
  });

  foundationOptions.forEach((option) => {
    option.addEventListener("click", () => {
      state.foundation = option.dataset.foundation || "none";
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
