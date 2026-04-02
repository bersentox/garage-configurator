const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');

if (hero && openBtn) {
  openBtn.addEventListener('click', () => {
    hero.classList.remove('open');
    void hero.offsetWidth;
    hero.classList.add('open');
  });
}
