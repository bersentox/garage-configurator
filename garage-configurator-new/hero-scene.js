export function mountHeroScene({ state, onSelectWidth }) {
  const garageScene = document.getElementById("garageScene");
  const garageRemoteButton = document.getElementById("garageRemoteButton");
  const garageGateSound = document.getElementById("garageGateSound");
  const widthButtons = document.querySelectorAll(".garage-choice[data-width]");

  if (!garageScene || !garageRemoteButton) {
    return;
  }

  garageRemoteButton.addEventListener("click", () => {
    const isOpen = garageScene.classList.contains("open");

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play();
    }

    garageScene.classList.toggle("open");
    garageRemoteButton.setAttribute("aria-pressed", String(!isOpen));
  });

  widthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const width = Number(button.dataset.width);
      state.width = width;
      onSelectWidth(width);
    });
  });
}
