(function () {
  const root = document.querySelector('.faq');

  if (!root) {
    return;
  }

  const titleNode = root.querySelector('.faq__title');
  const subtitleNode = root.querySelector('.faq__subtitle');
  const navNode = root.querySelector('.faq__nav');
  const detailNode = root.querySelector('.faq__detail');
  const detailTitleNode = root.querySelector('.faq__detail-title');
  const detailBodyNode = root.querySelector('.faq__detail-body');
  const JSON_PATH = '../site-body-content/faq.content.json';

  let navButtons = [];
  let items = [];

  function setDetail(item) {
    if (!item) {
      detailTitleNode.textContent = '';
      detailBodyNode.innerHTML = '';
      return;
    }

    detailTitleNode.textContent = item.question || '';
    detailBodyNode.innerHTML = '';

    const paragraphs = Array.isArray(item.answer) ? item.answer : [];

    paragraphs.forEach((paragraph) => {
      const node = document.createElement('p');
      node.textContent = paragraph;
      detailBodyNode.appendChild(node);
    });
  }

  function setActive(index) {
    navButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    const activeButton = navButtons[index];

    if (activeButton) {
      detailNode.setAttribute('aria-labelledby', activeButton.id);
    }

    setDetail(items[index]);
  }

  function createNavItem(item, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'faq__nav-item';
    button.setAttribute('role', 'tab');
    button.id = `faq-tab-${index}`;
    button.setAttribute('aria-controls', 'faq-detail-panel');

    const number = document.createElement('span');
    number.className = 'faq__nav-number';
    number.textContent = String(item.number || index + 1).padStart(2, '0');

    const text = document.createElement('span');
    text.className = 'faq__nav-text';
    text.textContent = item.question || '';

    button.appendChild(number);
    button.appendChild(text);

    button.addEventListener('click', function () {
      setActive(index);
    });

    return button;
  }

  function render() {
    navNode.innerHTML = '';
    navButtons = items.map(createNavItem);
    navButtons.forEach((button) => navNode.appendChild(button));

    detailNode.id = 'faq-detail-panel';

    if (items.length > 0) {
      setActive(0);
    } else {
      setDetail(null);
    }
  }

  async function init() {
    try {
      const response = await fetch(JSON_PATH, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.status}`);
      }

      const data = await response.json();
      titleNode.textContent = data.title || '';
      subtitleNode.textContent = data.subtitle || '';
      items = Array.isArray(data.items) ? data.items : [];
      render();
    } catch (error) {
      console.error('[faq] render failed', error);
      titleNode.textContent = 'FAQ временно недоступен';
      subtitleNode.textContent = 'Не удалось загрузить содержимое блока.';
      items = [];
      render();
    }
  }

  init();
})();
