const COLOR_PRESETS = {
  graphite: {
  wall: "#737373",
  roof: "#636363",
  trim: "#6b6b6b",
  gate: "#878787",
  interiorWall: "#d5dbe4"
},
  grey: {
    wall: "#a3a3a3",
    roof: "#6b6b6b",
    trim: "#8a8a8a",
    gate: "#8f8f8f",
    interiorWall: "#e5e7eb"
  },
  sand: {
    wall: "#d8c3a5",
    roof: "#8b7355",
    trim: "#7c5f3d",
    gate: "#c4a484",
    interiorWall: "#f4ead7"
  },
  chocolate: {
    wall: "#6b4f3a",
    roof: "#3f2d23",
    trim: "#2b1d17",
    gate: "#7c5a45",
    interiorWall: "#e9ddd3"
  },
  wood: {
    wall: "#a66a3f",
    roof: "#5f3b22",
    trim: "#3b2a1f",
    gate: "#b07a52",
    interiorWall: "#efe3d6"
  },
  industrial: {
    wall: "#6a7280",
    roof: "#2b313a",
    trim: "#0f172a",
    gate: "#5b6573",
    interiorWall: "#cfd4dc"
  }
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
  colorPreset: "graphite",
  colors: { ...COLOR_PRESETS.graphite },
  options: { ...DEFAULT_OPTIONS },
  buildTimeWeeks: 4,
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
  if (width >= 8) {
    return {
      type: "Гараж на 2 машины",
      width: 8,
      gates: 2
    };
  }

  return {
    type: "Гараж на 1 машину",
    width: 6,
    gates: 1
  };
}

export function applyColorPreset(state, presetKey) {
  if (!COLOR_PRESETS[presetKey]) {
    return;
  }

  state.colorPreset = presetKey;
  state.colors = { ...COLOR_PRESETS[presetKey] };
}
