const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');
const garageGateSound = document.getElementById('garageGateSound');
const sceneChoice = document.getElementById('sceneChoice');

const PUSH_DELAY_MS = 520;
const SHOW_CHOICE_DELAY_MS = 2600;
const CHOICE_DELAY_MS = 4600;

if (hero && openBtn) {
  let timers = [];

  openBtn.addEventListener('click', () => {
    if (hero.classList.contains('opening') || hero.classList.contains('pushing') || hero.classList.contains('choice')) {
      return;
    }

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play().catch(() => {});
    }

    timers.forEach((timerId) => clearTimeout(timerId));
    timers = [];

    hero.classList.remove('idle');
    hero.classList.add('open', 'opening');
    openBtn.setAttribute('aria-pressed', 'true');

    if (sceneChoice) {
      sceneChoice.setAttribute('aria-hidden', 'true');
    }

    timers.push(setTimeout(() => {
      hero.classList.add('pushing');
    }, PUSH_DELAY_MS));

    timers.push(setTimeout(() => {
      hero.classList.add('show-choice');

      if (sceneChoice) {
        sceneChoice.setAttribute('aria-hidden', 'false');
      }
    }, SHOW_CHOICE_DELAY_MS));

    timers.push(setTimeout(() => {
      hero.classList.remove('opening', 'pushing');
      hero.classList.add('choice');
      openBtn.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('tabindex', '-1');
    }, CHOICE_DELAY_MS));
  });
}
