import { createGarageState, getPresetByWidth } from "./state.js";
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

  const [heroMarkup, configuratorMarkup] = await Promise.all([
    loadFragment("./hero-scene.html"),
    loadFragment("./configurator.html")
  ]);

  appRoot.innerHTML = `${heroMarkup}\n${configuratorMarkup}`;

  const state = createGarageState();
  const configuratorStep = document.getElementById("configuratorStep");
  const configuratorApi = mountConfigurator({ state, root: configuratorStep });

  mountHeroScene({
    state,
    onSelectWidth: (width) => {
      const preset = getPresetByWidth(width);
      Object.assign(state, preset);
      configuratorApi.render();
      configuratorStep.hidden = false;
      configuratorStep.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

bootstrap().catch((error) => {
  console.error(error);
});
