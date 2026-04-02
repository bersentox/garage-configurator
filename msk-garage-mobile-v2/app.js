const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');
const garageGateSound = document.getElementById('garageGateSound');

if (hero && openBtn) {
  openBtn.addEventListener('click', () => {
    const isOpen = hero.classList.contains('open');

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play().catch(() => {});
    }

    hero.classList.toggle('open');

    openBtn.setAttribute('aria-pressed', String(!isOpen));
  });
}
