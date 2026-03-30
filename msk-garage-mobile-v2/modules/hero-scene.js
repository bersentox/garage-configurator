import { Viewer3D } from "./viewer3d.js";

const INTRO_TIMINGS = {
  scanStart: 0,
  textStart: 200,
  wakeStart: 300,
  finalStart: 700,
  end: 900,
};

export function createHeroScene({ rootElement, sceneElement, choicesElement, state }) {
  const viewer = new Viewer3D(sceneElement);
  const buttonsById = new Map();
  let introPlayed = false;
  let introRaf = 0;

  function renderChoices(options) {
    choicesElement.innerHTML = "";

    options.forEach((option) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "choice-card";
      card.dataset.model = option.id;
      card.innerHTML = `
        <p class="choice-title">${option.title}</p>
        <p class="choice-price">${option.price}</p>
      `;

      card.addEventListener("click", () => state.store.setModel(option.id));
      choicesElement.append(card);
      buttonsById.set(option.id, card);
    });
  }

  function runIntro() {
    if (introPlayed) return;
    introPlayed = true;

    rootElement.classList.remove("intro-pending", "intro-scan", "intro-text", "intro-final");
    rootElement.classList.add("intro-scan");
    state.store.setHeroPhase("scan");

    const start = performance.now();

    const update = (now) => {
      const t = now - start;

      if (t >= INTRO_TIMINGS.textStart) {
        rootElement.classList.add("intro-text");
        state.store.setHeroPhase("text");
      }

      if (t >= INTRO_TIMINGS.wakeStart) {
        const wakeProgress = Math.min(1, (t - INTRO_TIMINGS.wakeStart) / (INTRO_TIMINGS.finalStart - INTRO_TIMINGS.wakeStart));
        viewer.setWakeProgress(wakeProgress);
        state.store.setHeroPhase("wake");
      }

      if (t >= INTRO_TIMINGS.finalStart) {
        rootElement.classList.add("intro-final");
        state.store.setHeroPhase("final");
      }

      if (t < INTRO_TIMINGS.end) {
        introRaf = requestAnimationFrame(update);
        return;
      }

      viewer.setWakeProgress(1);
      rootElement.classList.remove("intro-scan", "intro-text", "intro-final");
      rootElement.classList.add("intro-done");
      state.store.setHeroPhase("done");
    };

    introRaf = requestAnimationFrame(update);
  }

  function prepareNextTransition() {
    // Reserved hook for upcoming flow:
    // hero text fade, pinned 3D top, configurator sheet emergence, fixed bottom CTA.
    rootElement.dataset.nextTransitionReady = "true";
  }

  renderChoices(state.options);

  const unsubscribe = state.store.subscribe(async ({ selected }) => {
    buttonsById.forEach((button, id) => {
      button.classList.toggle("active", id === selected.id);
    });

    await viewer.loadModel(state.store.resolveModelPath(selected));
  });

  runIntro();
  prepareNextTransition();

  return {
    destroy() {
      cancelAnimationFrame(introRaf);
      unsubscribe();
      viewer.destroy();
    },
    prepareNextTransition,
  };
}
