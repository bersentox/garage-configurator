(() => {
  "use strict";

  // Автономная инициализация блока site-body.
  // Файл подготовлен для будущей реализации Navigator
  // (фаза 5, progressive disclosure) без связи с configurator.
  const root = document.querySelector("#site-body");

  if (!root) {
    return;
  }

  console.log("site-body initialized");
})();
