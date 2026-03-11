const DEFAULT_GARAGE_STATE = {
  width: null,
  length: 6,
  gateType: "sectional",
  color: "graphite"
};

export function createGarageState(initial = {}) {
  return {
    ...DEFAULT_GARAGE_STATE,
    ...initial
  };
}

export function updateGarageState(state, patch) {
  Object.assign(state, patch);
  return state;
}
