export function mountHeroScene({ onOpenConfigurator }) {
  const garageScene = document.getElementById("garageScene");
  const garageRemoteButton = document.getElementById("garageRemoteButton");
  const garageGateSound = document.getElementById("garageGateSound");
  const configuratorButton = document.getElementById("garageConfiguratorButton");
  const catalogButton = document.getElementById("garageCatalogButton");
  let revealTimerId = null;

  if (!garageScene || !garageRemoteButton) {
    return;
  }

  garageRemoteButton.addEventListener("click", () => {
    const isOpen = garageScene.classList.contains("open");

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play().catch(() => {});
    }

    if (revealTimerId) {
      clearTimeout(revealTimerId);
      revealTimerId = null;
    }

    garageScene.classList.toggle("open");
    garageRemoteButton.setAttribute("aria-pressed", String(!isOpen));

    if (!isOpen) {
      revealTimerId = setTimeout(() => {
        garageScene.classList.add("choices-visible");
      }, 320);
    } else {
      garageScene.classList.remove("choices-visible");
    }
  });

  configuratorButton?.addEventListener("click", () => {
    onOpenConfigurator?.();
  });

  catalogButton?.addEventListener("click", () => {
    const target = catalogButton.dataset.target;

    if (target) {
      window.location.hash = target;
    }
  });
}
