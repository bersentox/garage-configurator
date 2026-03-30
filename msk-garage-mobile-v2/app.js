import { GARAGE_OPTIONS, createState } from "./core/state.js";
import { createHeroScene } from "./modules/hero-scene.js";

const rootElement = document.querySelector(".app");
const sceneElement = document.getElementById("scene-root");
const choicesElement = document.getElementById("hero-choices");

const store = createState("single");

createHeroScene({
  rootElement,
  sceneElement,
  choicesElement,
  state: {
    options: GARAGE_OPTIONS,
    store,
  },
});
