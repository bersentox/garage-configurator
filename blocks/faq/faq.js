(function () {
  const APP_ID = 'faq-app';
  const MOUNT_FLAG = 'faqMounted';
  const BASE_URL =
    (window.GARAGE_CONFIGURATOR_EMBED_BASE_URL || '')
      .trim()
      .replace(/\/+$/, '');
  const JSON_PATH = BASE_URL
    ? `${BASE_URL}/site-body-content/faq.content.json`
    : '../site-body-content/faq.content.json';
  const TEMPLATE = `
    <section class="faq" aria-labelledby="faq-title">
      <div class="faq__inner">
        <header class="faq__header">
          <h2 id="faq-title" class="faq__title"></h2>
          <p class="faq__subtitle"></p>
        </header>
        <div class="faq__layout">
          <div class="faq__nav" role="tablist" aria-label="Частые вопросы"></div>
          <div class="faq__detail" role="tabpanel" aria-live="polite">
            <h3 class="faq__detail-title"></h3>
            <div class="faq__detail-body"></div>
          </div>
        </div>
      </div>
    </section>
  `;
  const appRoot = document.getElementById(APP_ID);

  if (!appRoot) {
    return;
  }

  if (!appRoot.querySelector('.faq')) {
    appRoot.innerHTML = TEMPLATE;
  }

  if (appRoot.dataset[MOUNT_FLAG] === 'true') {
    return;
  }

  appRoot.dataset[MOUNT_FLAG] = 'true';

  const root = appRoot.querySelector('.faq');

  if (!root) {
    return;
  }

  const titleNode = root.querySelector('.faq__title');
  const subtitleNode = root.querySelector('.faq__subtitle');
  const navNode = root.querySelector('.faq__nav');
  const detailNode = root.querySelector('.faq__detail');
  const detailTitleNode = root.querySelector('.faq__detail-title');
  const detailBodyNode = root.querySelector('.faq__detail-body');
  const DETAIL_LABEL_TEXT = 'Ответ на вопрос';

  let navButtons = [];
  let items = [];
  let activeIndex = 0;

  function ensureDetailLabel() {
    let labelNode = detailNode.querySelector('.faq__detail-label');

    if (!labelNode) {
      labelNode = document.createElement('p');
      labelNode.className = 'faq__detail-label';
      detailNode.insertBefore(labelNode, detailTitleNode);
    }

    labelNode.textContent = DETAIL_LABEL_TEXT;
  }

  function setDetail(item) {
    ensureDetailLabel();

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

  function setActive(index, shouldFocus) {
    activeIndex = index;

    navButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    const activeButton = navButtons[index];

    if (activeButton) {
      detailNode.setAttribute('aria-labelledby', activeButton.id);

      if (shouldFocus) {
        activeButton.focus();
      }
    }

    setDetail(items[index]);
  }

  function moveActive(step) {
    if (!navButtons.length) {
      return;
    }

    const nextIndex = (activeIndex + step + navButtons.length) % navButtons.length;
    setActive(nextIndex, true);
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

    const indicator = document.createElement('span');
    indicator.className = 'faq__nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');

    button.appendChild(number);
    button.appendChild(text);
    button.appendChild(indicator);

    button.addEventListener('click', function () {
      setActive(index);
    });

    button.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveActive(1);
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        moveActive(-1);
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setActive(0, true);
      }

      if (event.key === 'End') {
        event.preventDefault();
        setActive(navButtons.length - 1, true);
      }
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
