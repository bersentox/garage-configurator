const COLOR_PRESETS = {
  graphite: { wall: "#7a818b", roof: "#3f4651", trim: "#191f29", gate: "#5d6674", interiorWall: "#d7dde5" },
  grey: { wall: "#b0b8c2", roof: "#687281", trim: "#505b68", gate: "#98a3b1", interiorWall: "#e7edf4" },
  sand: { wall: "#d5c0a1", roof: "#8b7355", trim: "#6d563b", gate: "#bf9e76", interiorWall: "#f4eadf" },
  chocolate: { wall: "#6a4e3d", roof: "#34231c", trim: "#251914", gate: "#7a5b47", interiorWall: "#eadcd1" },
  wood: { wall: "#aa7448", roof: "#664224", trim: "#4a2f1b", gate: "#bd8754", interiorWall: "#f0e1d4" },
  industrial: { wall: "#6b7380", roof: "#242d38", trim: "#101826", gate: "#5e6977", interiorWall: "#cbd5e1" }
};

const DEFAULT_OPTIONS = {
  gateAutomation: false,
  interiorElectricity: false,
  exteriorLighting: false,
  ventilation: false,
  gutters: false
};

const DEFAULT_STATE = {
  type: "Гараж на 1 машину",
  width: 6,
  gates: 1,
  length: 6,
  layout: "classic",
  shelves: false,
  partition: false,
  doors: 0,
  windows: 0,
  foundation: "none",
  roofType: "gable",
  colorPreset: "graphite",
  colors: { ...COLOR_PRESETS.graphite },
  options: { ...DEFAULT_OPTIONS },
  buildTimeDays: 7,
  price: 0
};

export { COLOR_PRESETS, DEFAULT_OPTIONS };

export function createGarageState(initial = {}) {
  return {
    ...DEFAULT_STATE,
    ...initial,
    colors: {
      ...DEFAULT_STATE.colors,
      ...(initial.colors || {})
    },
    options: {
      ...DEFAULT_OPTIONS,
      ...(initial.options || {})
    }
  };
}

export function getPresetByWidth(width) {
  return width >= 8
    ? { type: "Гараж на 2 машины", width: 8, gates: 2 }
    : { type: "Гараж на 1 машину", width: 6, gates: 1 };
}

export function getLayoutByLength(length) {
  if (length >= 10) return "utility";
  if (length >= 8) return "storage";
  return "classic";
}

export function applyColorPreset(state, presetKey) {
  const preset = COLOR_PRESETS[presetKey];
  if (!preset) return;
  state.colorPreset = presetKey;
  state.colors = { ...preset };
}
