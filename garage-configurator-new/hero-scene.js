export function mountHeroScene({ state, onSelectWidth }) {
  const garageScene = document.getElementById("garageScene");
  const garageRemoteButton = document.getElementById("garageRemoteButton");
  const garageGateSound = document.getElementById("garageGateSound");
  const widthButtons = document.querySelectorAll(".garage-choice[data-width]");
  let revealTimerId = null;

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

  widthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const width = Number(button.dataset.width);
      state.width = width;
      onSelectWidth(width);
    });
  });
}
