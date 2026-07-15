(function () {
  "use strict";

  const DESKTOP_ROOT_ID = "garage-configurator-t123";
  const MOBILE_ROOT_ID = "garage-mobile-v2-root";
  const UPDATE_DELAY_MS = 0;

  const MOBILE_PRICES = {
    RATE_PER_M2: { 6: 34000, 8: 37000 },
    FOUNDATION_RATE_PER_M2: { none: 0, pile: 6500, strip: 5500, slab: 4500 },
    OPTIONS_PRICE: {
      automation: 25000,
      electrics: 60000,
      lighting: 15000,
      ventilation: 6000,
      drainage: 25000
    }
  };

  let updateTimer = null;

  function formatPrice(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(updatePriceDisplays, UPDATE_DELAY_MS);
  }

  function ensureStyle() {
    if (document.getElementById("garage-price-display-style")) return;

    const style = document.createElement("style");
    style.id = "garage-price-display-style";
    style.textContent = `
      #${DESKTOP_ROOT_ID} .garage-live-price,
      #${MOBILE_ROOT_ID} .garage-live-price {
        margin: 0;
        font-variant-numeric: tabular-nums;
      }

      #${DESKTOP_ROOT_ID} .garage-price-row .summary-value {
        font-size: 28px;
        line-height: 1.08;
        font-weight: 800;
        letter-spacing: -0.025em;
      }

      #${DESKTOP_ROOT_ID} .garage-live-price--cta {
        font-size: clamp(28px, 4vw, 38px);
        line-height: 1.06;
        font-weight: 800;
        color: #ffffff;
      }

      #${DESKTOP_ROOT_ID} .garage-live-price-label,
      #${MOBILE_ROOT_ID} .garage-live-price-label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.72;
      }

      #${MOBILE_ROOT_ID} .garage-live-price--mobile-final {
        margin: 14px 0 6px;
        font-size: clamp(30px, 9vw, 42px);
        line-height: 1.03;
        font-weight: 800;
        letter-spacing: -0.035em;
        color: inherit;
      }

    `;
    document.head.appendChild(style);
  }

  function numberFromText(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function calculateDesktopPrice(root) {
    const prices = window.CONFIG_PRICES || {};
    const ratePerM2 = prices.RATE_PER_M2 || {};
    const foundationRates = prices.FOUNDATION_RATE_PER_M2 || {};
    const elementPrices = prices.ELEMENT_PRICE || {};
    const optionPrices = prices.OPTIONS_PRICE || {};

    const widthButton = root.querySelector(".width-card.active");
    const width = Number(widthButton?.dataset.width) || 6;
    const length = Math.max(6, Number(root.querySelector("#lengthInput")?.value) || 6);
    const foundation = root.querySelector(".foundation-option.active")?.dataset.foundation || "none";

    let price = width * length * (ratePerM2[width] || ratePerM2[6] || 0);
    price += width * length * (foundationRates[foundation] || 0);

    if (root.querySelector("#shelvesToggle")?.checked) price += elementPrices.shelves || 0;
    if (root.querySelector("#partitionToggle")?.checked) price += elementPrices.partition || 0;

    const doors = numberFromText(root.querySelector("#doorsCount")?.textContent);
    const windows = numberFromText(root.querySelector("#windowsCount")?.textContent);
    price += doors * (elementPrices.door || 0);
    price += windows * (elementPrices.window || 0);

    root.querySelectorAll("[data-option]").forEach((checkbox) => {
      if (checkbox.checked) price += optionPrices[checkbox.dataset.option] || 0;
    });

    return price;
  }

  function ensureDesktopPriceNodes(root) {
    const summaryList = root.querySelector("#summaryList");
    let summaryPrice = root.querySelector("#desktopEstimatedPrice");

    if (!summaryPrice && summaryList) {
      const priceRow = document.createElement("li");
      priceRow.id = "desktopEstimatedPriceRow";
      priceRow.className = "garage-price-row";
      priceRow.innerHTML = `
        <span class="summary-label">Ориентировочная стоимость</span>
        <span class="summary-value" id="desktopEstimatedPrice"></span>
      `;
      summaryList.appendChild(priceRow);
      summaryPrice = priceRow.querySelector("#desktopEstimatedPrice");
    }

    const ctaSummary = root.querySelector("#ctaSummary");
    let ctaPrice = root.querySelector("#desktopCtaEstimatedPrice");

    if (!ctaPrice && ctaSummary) {
      ctaPrice = document.createElement("p");
      ctaPrice.id = "desktopCtaEstimatedPrice";
      ctaPrice.className = "garage-live-price garage-live-price--cta";
      ctaSummary.before(ctaPrice);
    }

    return { summaryPrice, ctaPrice };
  }

  function updateDesktop(root) {
    const price = calculateDesktopPrice(root);
    if (!price) return;

    const formatted = formatPrice(price);
    const { summaryPrice, ctaPrice } = ensureDesktopPriceNodes(root);

    if (summaryPrice) summaryPrice.textContent = formatted;

    if (ctaPrice) {
      ctaPrice.innerHTML = `<span class="garage-live-price-label">Ориентировочная стоимость</span>${formatted}`;
    }

    const summaryTime = root.querySelector("#summaryTime");
    if (summaryTime) {
      summaryTime.textContent = "Финальная стоимость уточняется после проверки комплектации и условий участка.";
    }

    const ctaSummary = root.querySelector("#ctaSummary");
    if (ctaSummary) {
      ctaSummary.textContent = "Оставьте контакт — проверим комплектацию и подготовим точный расчёт без скрытых доплат.";
    }

    const stickyPrice = root.querySelector("#stickyPrice");
    const stickyMeta = root.querySelector("#stickyMeta");
    const width = Number(root.querySelector(".width-card.active")?.dataset.width) || 6;
    const length = Math.max(6, Number(root.querySelector("#lengthInput")?.value) || 6);

    if (stickyPrice) stickyPrice.textContent = "Ориентировочно " + formatted;
    if (stickyMeta) stickyMeta.textContent = `${width} × ${length} м · точный расчёт после заявки`;

    root.dataset.estimatedPrice = String(Math.round(price));
    root.dataset.estimatedPriceFormatted = formatted;
  }

  function getPressed(root, selector) {
    return root.querySelector(`${selector}[aria-pressed="true"]`);
  }

  function calculateMobilePrice(root) {
    const typeButton = getPressed(root, ".config-shell-type-btn");
    const lengthButton = getPressed(root, ".config-shell-length-btn");
    const foundationButton = getPressed(root, ".config-shell-foundation-btn");

    const width = typeButton?.dataset.type === "double" ? 8 : 6;
    const length = Number(lengthButton?.dataset.length) || 6;
    const foundation = foundationButton?.dataset.foundation || "none";

    let price = width * length * (MOBILE_PRICES.RATE_PER_M2[width] || MOBILE_PRICES.RATE_PER_M2[6]);
    price += width * length * (MOBILE_PRICES.FOUNDATION_RATE_PER_M2[foundation] || 0);

    root.querySelectorAll('.config-shell-extra-btn[aria-pressed="true"]').forEach((button) => {
      price += MOBILE_PRICES.OPTIONS_PRICE[button.dataset.extra] || 0;
    });

    return price;
  }

  function ensureMobilePriceNodes(root) {
    const finalText = root.querySelector(".config-shell-final-text");
    let finalPrice = root.querySelector("#mobileEstimatedPrice");

    if (!finalPrice && finalText) {
      finalPrice = document.createElement("p");
      finalPrice.id = "mobileEstimatedPrice";
      finalPrice.className = "garage-live-price garage-live-price--mobile-final";
      finalText.before(finalPrice);
    }

    return { finalPrice };
  }

  function updateMobile(root) {
    const price = calculateMobilePrice(root);
    if (!price) return;

    const formatted = formatPrice(price);
    const { finalPrice } = ensureMobilePriceNodes(root);

    if (finalPrice) {
      finalPrice.innerHTML = `<span class="garage-live-price-label">Ориентировочная стоимость</span>${formatted}`;
    }

    const barLabel = root.querySelector(".config-shell-bar-label");
    const barSummary = root.querySelector("#configShellSummary");
    if (barLabel) barLabel.textContent = "Ориентировочная стоимость:";
    if (barSummary) barSummary.textContent = formatted;

    const finalText = root.querySelector(".config-shell-final-text");
    if (finalText) {
      finalText.textContent = "Оставьте контакт — мы проверим комплектацию и подготовим точную стоимость под ваш участок.";
    }

    root.dataset.estimatedPrice = String(Math.round(price));
    root.dataset.estimatedPriceFormatted = formatted;
  }

  function updatePriceDisplays() {
    ensureStyle();

    const desktopRoot = document.getElementById(DESKTOP_ROOT_ID);
    if (desktopRoot) updateDesktop(desktopRoot);

    const mobileRoot = document.getElementById(MOBILE_ROOT_ID);
    if (mobileRoot) updateMobile(mobileRoot);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(`#${DESKTOP_ROOT_ID}, #${MOBILE_ROOT_ID}`)) scheduleUpdate();
  });

  document.addEventListener("input", (event) => {
    if (event.target.closest(`#${DESKTOP_ROOT_ID}, #${MOBILE_ROOT_ID}`)) scheduleUpdate();
  });

  document.addEventListener("change", (event) => {
    if (event.target.closest(`#${DESKTOP_ROOT_ID}, #${MOBILE_ROOT_ID}`)) scheduleUpdate();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.setTimeout(updatePriceDisplays, 300);
      window.setTimeout(updatePriceDisplays, 1200);
      window.setTimeout(updatePriceDisplays, 2500);
      window.setTimeout(updatePriceDisplays, 5000);
    });
  } else {
    window.setTimeout(updatePriceDisplays, 300);
    window.setTimeout(updatePriceDisplays, 1200);
    window.setTimeout(updatePriceDisplays, 2500);
    window.setTimeout(updatePriceDisplays, 5000);
  }

  window.GaragePriceDisplay = {
    update: updatePriceDisplays,
    getDesktopPrice: () => {
      const root = document.getElementById(DESKTOP_ROOT_ID);
      return root ? calculateDesktopPrice(root) : null;
    },
    getMobilePrice: () => {
      const root = document.getElementById(MOBILE_ROOT_ID);
      return root ? calculateMobilePrice(root) : null;
    }
  };
})();
