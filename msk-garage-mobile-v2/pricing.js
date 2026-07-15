(function () {
  const ROOT_ID = "garage-mobile-v2-root";
  const PRICES = window.CONFIG_PRICES || {};
  const GARAGE = PRICES.GARAGE || {};
  const FOUNDATION_RATE_PER_M2 = PRICES.FOUNDATION_RATE_PER_M2 || {};
  const OPTIONS_PRICE = PRICES.OPTIONS_PRICE || {};

  const EXTRA_KEY_MAP = {
    automation: "gateAutomation",
    electrics: "interiorElectricity",
    lighting: "exteriorLighting",
    ventilation: "ventilation",
    drainage: "gutters"
  };

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getActiveButton(root, selector) {
    return root ? root.querySelector(selector + '[aria-pressed="true"]') : null;
  }

  function calculateMobilePrice() {
    const root = getRoot();

    if (!root) {
      return null;
    }

    const typeButton = getActiveButton(root, ".config-shell-type-btn");
    const lengthButton = getActiveButton(root, ".config-shell-length-btn");
    const foundationButton = getActiveButton(root, ".config-shell-foundation-btn");

    const width = typeButton?.dataset.type === "double" ? 8 : 6;
    const length = Math.max(6, Number(lengthButton?.dataset.length) || 6);
    const garageType = width === 8 ? "double" : "single";
    const garagePricing = GARAGE[garageType];

    if (!garagePricing) {
      return null;
    }

    const baseLength = Number(garagePricing.baseLength) || 6;
    const basePrice = Number(garagePricing.basePrice) || 0;
    const extraMeterPrice = Number(garagePricing.extraMeterPrice) || 0;
    const extraLength = Math.max(0, length - baseLength);

    const foundationKey = foundationButton?.dataset.foundation || "none";
    const foundationRatePerM2 = Number(FOUNDATION_RATE_PER_M2[foundationKey]) || 0;
    const foundationPrice = width * length * foundationRatePerM2;

    const extrasPrice = [...root.querySelectorAll('.config-shell-extra-btn[aria-pressed="true"]')]
      .reduce(function (sum, button) {
        const sharedKey = EXTRA_KEY_MAP[button.dataset.extra];
        return sum + (sharedKey ? Number(OPTIONS_PRICE[sharedKey]) || 0 : 0);
      }, 0);

    return basePrice + extraLength * extraMeterPrice + foundationPrice + extrasPrice;
  }

  function formatPrice(value) {
    return "от " + new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  function updateDisplayedPrice() {
    const root = getRoot();
    const price = calculateMobilePrice();

    if (!root || price == null) {
      return;
    }

    const priceText = formatPrice(price);
    const stickyPrice = root.querySelector("#configShellPrice");
    const finalPrice = root.querySelector("#finalCtaPrice");

    if (stickyPrice) stickyPrice.textContent = priceText;
    if (finalPrice) finalPrice.textContent = priceText;
  }

  function scheduleUpdate() {
    window.requestAnimationFrame(function () {
      window.setTimeout(updateDisplayedPrice, 0);
    });
  }

  function setup() {
    const root = getRoot();

    if (!root) {
      return;
    }

    document.addEventListener(
      "click",
      function (event) {
        const pricingControl = event.target.closest(
          [
            "#" + ROOT_ID + " .config-shell-type-btn",
            "#" + ROOT_ID + " .config-shell-length-btn",
            "#" + ROOT_ID + " .config-shell-foundation-btn",
            "#" + ROOT_ID + " .config-shell-extra-btn"
          ].join(",")
        );

        if (pricingControl) {
          scheduleUpdate();
        }
      },
      true
    );

    const observer = new MutationObserver(function (mutations) {
      const pricingStateChanged = mutations.some(function (mutation) {
        return mutation.type === "attributes" && mutation.attributeName === "aria-pressed";
      });

      if (pricingStateChanged) {
        scheduleUpdate();
      }
    });

    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-pressed"]
    });

    updateDisplayedPrice();
    window.setTimeout(updateDisplayedPrice, 300);
    window.setTimeout(updateDisplayedPrice, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
