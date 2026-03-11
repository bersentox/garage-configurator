import { updateGarageState } from "./state.js";

export function mountConfigurator({ state, root }) {
  const lengthSelect = root.querySelector("#lengthSelect");
  const gateTypeSelect = root.querySelector("#gateTypeSelect");
  const colorSelect = root.querySelector("#colorSelect");
  const stateOutput = root.querySelector("#stateOutput");

  const renderState = () => {
    stateOutput.textContent = JSON.stringify(state, null, 2);
  };

  const applyPatch = (patch) => {
    updateGarageState(state, patch);
    renderState();
  };

  lengthSelect.addEventListener("change", () => {
    applyPatch({ length: Number(lengthSelect.value) });
  });

  gateTypeSelect.addEventListener("change", () => {
    applyPatch({ gateType: gateTypeSelect.value });
  });

  colorSelect.addEventListener("change", () => {
    applyPatch({ color: colorSelect.value });
  });

  renderState();
}
