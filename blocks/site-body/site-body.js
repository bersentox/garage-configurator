(() => {
  "use strict";

  const root = document.querySelector("#site-body");

  if (!root) {
    return;
  }

  const trigger = root.querySelector("[data-disclosure-trigger]");
  const panel = root.querySelector("[data-disclosure-panel]");

  if (!trigger || !panel) {
    return;
  }

  const updateState = (isExpanded) => {
    trigger.setAttribute("aria-expanded", String(isExpanded));
    panel.hidden = !isExpanded;
    trigger.textContent = isExpanded ? "Скрыть детали Navigator" : "Показать детали Navigator";
  };

  updateState(false);

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    updateState(!expanded);
  });
})();
