import { createGarageState } from "./state.js";
import { mountHeroScene } from "./hero-scene.js";
import { mountConfigurator } from "./configurator.js";

async function loadFragment(path) {
  const response = await fetch(path);
  return response.text();
}

async function bootstrap() {
  const appRoot = document.getElementById("app");
  const heroMarkup = await loadFragment("./hero-scene.html");
  const configuratorMarkup = await loadFragment("./configurator.html");

  appRoot.innerHTML = `${heroMarkup}\n${configuratorMarkup}`;

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

bootstrap();
