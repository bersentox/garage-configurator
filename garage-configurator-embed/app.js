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

function setupEmbedAutoHeight() {
  const sendHeight = () => {
    const height = Math.ceil(document.documentElement.scrollHeight);

    window.parent?.postMessage(
      {
        type: "garage-configurator:height",
        height
      },
      "*"
    );
  };

  const observer = new ResizeObserver(sendHeight);
  observer.observe(document.body);
  observer.observe(document.documentElement);

  window.addEventListener("load", sendHeight);
  window.addEventListener("resize", sendHeight);
  sendHeight();
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
    }
  });

  setupEmbedAutoHeight();
}

bootstrap().catch((error) => {
  console.error(error);

  const appRoot = document.getElementById("app");
  if (appRoot) {
    appRoot.innerHTML = `
      <section style="margin:24px auto;max-width:760px;padding:16px 18px;border:1px solid #fecaca;border-radius:12px;background:#fef2f2;color:#991b1b;font:500 16px/1.4 Arial,sans-serif;">
        Не удалось запустить конфигуратор. Обновите страницу или попробуйте позже.
      </section>
    `;
  }
});
