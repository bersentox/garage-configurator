(() => {
  "use strict";

  const root = document.querySelector("#site-body");

  if (!root) {
    return;
  }

  const faqItems = Array.from(root.querySelectorAll(".sb__faq-item"));

  faqItems.forEach((item) => {
    const summary = item.querySelector(".sb__faq-summary");

    if (!summary) {
      return;
    }

    const syncState = () => {
      summary.setAttribute("aria-expanded", String(item.hasAttribute("open")));
    };

    syncState();
    item.addEventListener("toggle", syncState);
  });
})();
