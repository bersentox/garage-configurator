const hero = document.getElementById("hero");
const openBtn = document.getElementById("openBtn");

openBtn.addEventListener("click", () => {
  hero.classList.toggle("open");
});
