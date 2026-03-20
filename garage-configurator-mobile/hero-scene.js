export function mountHeroScene({ state, onSelectWidth }) {
  const scene = document.getElementById("garageScene");
  const remoteButton = document.getElementById("garageRemoteButton");
  const widthButtons = [...document.querySelectorAll(".gc-m-hero__choice[data-width]")];
  let revealTimerId = 0;

  if (!scene || !remoteButton) return;

  remoteButton.addEventListener("click", () => {
    const isOpen = scene.classList.contains("is-open");
    window.clearTimeout(revealTimerId);
    scene.classList.toggle("is-open", !isOpen);
    scene.classList.toggle("choices-visible", !isOpen);
    remoteButton.setAttribute("aria-pressed", String(!isOpen));
    remoteButton.querySelector(".gc-m-hero__remote-text").textContent = isOpen ? "Открыть" : "Готово";

    if (!isOpen) {
      revealTimerId = window.setTimeout(() => {
        scene.classList.add("choices-visible");
      }, 180);
    }
  });

  widthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const width = Number(button.dataset.width);
      state.width = width;
      widthButtons.forEach((node) => node.classList.toggle("is-selected", node === button));
      onSelectWidth(width);
    });
  });
}
