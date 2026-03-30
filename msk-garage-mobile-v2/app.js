import { GARAGE_OPTIONS, createState } from "./core/state.js";
import { createHeroScene } from "./modules/hero-scene.js";

const sceneElement = document.getElementById("scene-root");
const choicesElement = document.getElementById("size-choices");

const store = createState("8x8");

createHeroScene({
  sceneElement,
  choicesElement,
  state: {
    options: GARAGE_OPTIONS,
    store,
  },
});
