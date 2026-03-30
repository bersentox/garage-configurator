const MODEL_BASE_PATH = "../msk-garage-mobile/assets/models/";

export const GARAGE_OPTIONS = [
  { id: "6x6", label: "6×6", file: "garage_6x6.glb" },
  { id: "6x8", label: "6×8", file: "garage_6x8.glb" },
  { id: "6x10", label: "6×10", file: "garage_6x10.glb" },
  { id: "8x6", label: "8×6", file: "garage_8x6.glb" },
  { id: "8x8", label: "8×8", file: "garage_8x8.glb" },
  { id: "8x10", label: "8×10", file: "garage_8x10.glb" },
];

export function createState(defaultId = GARAGE_OPTIONS[0].id) {
  let selectedModelId = defaultId;
  const listeners = new Set();

  const getSelected = () =>
    GARAGE_OPTIONS.find((option) => option.id === selectedModelId) ?? GARAGE_OPTIONS[0];

  const notify = () => {
    listeners.forEach((listener) => listener(getSelected()));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(getSelected());
      return () => listeners.delete(listener);
    },
    setModel(id) {
      if (id === selectedModelId) {
        return;
      }
      selectedModelId = id;
      notify();
    },
    getSelected,
    resolveModelPath(option = getSelected()) {
      return `${MODEL_BASE_PATH}${option.file}`;
    },
  };
}
