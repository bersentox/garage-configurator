const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');
const garageGateSound = document.getElementById('garageGateSound');
const sceneChoice = document.getElementById('sceneChoice');
const configShell = document.getElementById('configShell');
const configShellSummary = document.getElementById('configShellSummary');
const configShellPrice = document.getElementById('configShellPrice');
const choiceButtons = sceneChoice ? [...sceneChoice.querySelectorAll('[data-garage-option]')] : [];

const PUSH_DELAY_MS = 520;
const SHOW_CHOICE_DELAY_MS = 2000;
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

if (configShell && choiceButtons.length) {
  choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const garageOption = button.dataset.garageOption;
      const isTwoCars = garageOption === 'two';
      const summaryText = isTwoCars
        ? 'Гараж на 2 машины · базовая комплектация'
        : 'Гараж на 1 машину · базовая комплектация';
      const priceText = isTwoCars ? 'от 2 290 000 ₽' : 'от 1 950 000 ₽';

      configShell.hidden = false;
      configShell.setAttribute('aria-hidden', 'false');

      choiceButtons.forEach((choiceButton) => {
        choiceButton.setAttribute('aria-pressed', String(choiceButton === button));
      });

      if (configShellSummary) {
        configShellSummary.textContent = summaryText;
      }

      if (configShellPrice) {
        configShellPrice.textContent = priceText;
      }

      configShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
