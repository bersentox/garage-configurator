import { createGarageState, getPresetByWidth } from "./state.js";
import { mountHeroScene } from "./hero-scene.js";
import { mountConfigurator } from "./configurator.js";
import { resolveEmbedAsset } from "./asset-paths.js";

async function loadFragment(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Не удалось загрузить фрагмент: ${path}`);
  }

  return response.text();
}

function applyEmbedAssetSources(root) {
  root.querySelectorAll("[data-embed-asset]").forEach((node) => {
    const assetPath = node.getAttribute("data-embed-asset");
    if (!assetPath) return;
    node.setAttribute("src", resolveEmbedAsset(assetPath));
  });
}

async function bootstrap() {
  const appRoot = document.getElementById("app");

  if (!appRoot) {
    return;
  }

  const [heroMarkup, configuratorMarkup] = await Promise.all([
    loadFragment(new URL("./hero-scene.html", import.meta.url).href),
    loadFragment(new URL("./configurator.html", import.meta.url).href)
  ]);

  appRoot.innerHTML = `${heroMarkup}\n${configuratorMarkup}`;
  applyEmbedAssetSources(appRoot);

  const gateSound = document.getElementById("garageGateSound");
  if (gateSound) {
    const soundPath = gateSound.getAttribute("data-embed-asset") || "audio/gate-opening.mp3";
    gateSound.setAttribute("src", resolveEmbedAsset(soundPath));
  }

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
