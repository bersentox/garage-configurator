const MODEL_BASE_PATH = "../msk-garage-mobile/assets/models/";

export const GARAGE_OPTIONS = [
  {
    id: "single",
    title: "1 машина",
    price: "от 1.2 млн ₽",
    file: "garage_6x8.glb",
  },
  {
    id: "double",
    title: "2 машины",
    price: "от 2.1 млн ₽",
    file: "garage_8x10.glb",
  },
];

export function createState(defaultId = GARAGE_OPTIONS[0].id) {
  let selectedModelId = defaultId;
  let heroPhase = "boot";
  const listeners = new Set();

  const getSelected = () =>
    GARAGE_OPTIONS.find((option) => option.id === selectedModelId) ?? GARAGE_OPTIONS[0];

  const snapshot = () => ({
    selected: getSelected(),
    heroPhase,
  });

  const notify = () => {
    const state = snapshot();
    listeners.forEach((listener) => listener(state));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    setModel(id) {
      if (id === selectedModelId) return;
      selectedModelId = id;
      notify();
    },
    setHeroPhase(nextPhase) {
      if (heroPhase === nextPhase) return;
      heroPhase = nextPhase;
      notify();
    },
    getSelected,
    getHeroPhase() {
      return heroPhase;
    },
    resolveModelPath(option = getSelected()) {
      return `${MODEL_BASE_PATH}${option.file}`;
    },
  };
}
