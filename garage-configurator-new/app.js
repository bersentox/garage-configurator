import { createGarageState } from "./state.js";
import { mountHeroScene } from "./hero-scene.js";
import { mountConfigurator } from "./configurator.js";

async function loadFragment(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Не удалось загрузить фрагмент: ${path}`);
  }

  return response.text();
}

async function bootstrap() {
  const appRoot = document.getElementById("app");

  if (!appRoot) {
    return;
  }

  const heroMarkup = await loadFragment("./hero-scene.html");
  const configuratorMarkup = await loadFragment("./configurator.html");

  appRoot.innerHTML = `${heroMarkup}\n<div class="page-container">${configuratorMarkup}</div>`;

  const state = createGarageState();
  const configuratorStep = document.getElementById("configuratorStep");

  mountHeroScene({
    state,
    onSelectWidth: () => {
      configuratorStep.hidden = false;
      configuratorStep.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  mountConfigurator({ state, root: configuratorStep });
}

bootstrap().catch((error) => {
  console.error(error);
});
