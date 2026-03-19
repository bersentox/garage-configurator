const scene = document.querySelector('.scene');
const mainNode = document.querySelector('.main-node');

if (scene && mainNode) {
  mainNode.addEventListener('click', () => {
    const isExpanded = scene.classList.toggle('is-expanded');
    mainNode.classList.toggle('is-active', isExpanded);
    mainNode.setAttribute('aria-expanded', String(isExpanded));
  });
}
