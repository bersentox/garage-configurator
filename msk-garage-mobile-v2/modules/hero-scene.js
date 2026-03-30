import { Viewer3D } from "./viewer3d.js";

export function createHeroScene({ sceneElement, choicesElement, state }) {
  const viewer = new Viewer3D(sceneElement);

  const buttonsById = new Map();

  function renderChoices(options) {
    choicesElement.innerHTML = "";
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.dataset.model = option.id;
      button.textContent = option.label;
      button.addEventListener("click", () => state.setModel(option.id));
      choicesElement.append(button);
      buttonsById.set(option.id, button);
    });
  }

  renderChoices(state.options);

  const unsubscribe = state.store.subscribe(async (selected) => {
    buttonsById.forEach((button, id) => {
      button.classList.toggle("active", id === selected.id);
    });

    await viewer.loadModel(state.store.resolveModelPath(selected));
  });

  return {
    destroy() {
      unsubscribe();
      viewer.destroy();
    },
  };
}
