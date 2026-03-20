(function () {
  const root = document.getElementById('faq-app');

  if (!root) {
    return;
  }

  const contentUrl = new URL('../site-body-content/faq.content.json', import.meta.url);

  root.innerHTML = `
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

  const section = root.querySelector('.faq');
  const titleNode = root.querySelector('.faq__title');
  const subtitleNode = root.querySelector('.faq__subtitle');
  const navNode = root.querySelector('.faq__nav');
  const detailNode = root.querySelector('.faq__detail');
  const detailTitleNode = root.querySelector('.faq__detail-title');
  const detailBodyNode = root.querySelector('.faq__detail-body');
  const detailLabelText = 'Ответ на вопрос';

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

    labelNode.textContent = detailLabelText;
  }

  function setDetail(item) {
    ensureDetailLabel();
    detailTitleNode.textContent = item ? item.question || '' : '';
    detailBodyNode.innerHTML = '';

    if (!item) {
      return;
    }

    (Array.isArray(item.answer) ? item.answer : []).forEach(function (paragraph) {
      const node = document.createElement('p');
      node.textContent = paragraph;
      detailBodyNode.appendChild(node);
    });
  }

  function setActive(index, shouldFocus) {
    activeIndex = index;

    navButtons.forEach(function (button, buttonIndex) {
      const isActive = buttonIndex === index;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    if (navButtons[index]) {
      detailNode.setAttribute('aria-labelledby', navButtons[index].id);

      if (shouldFocus) {
        navButtons[index].focus();
      }
    }

    setDetail(items[index]);
  }

  function moveActive(step) {
    if (!navButtons.length) {
      return;
    }

    setActive((activeIndex + step + navButtons.length) % navButtons.length, true);
  }

  function createNavItem(item, index) {
    const button = document.createElement('button');
    const number = document.createElement('span');
    const text = document.createElement('span');
    const indicator = document.createElement('span');

    button.type = 'button';
    button.className = 'faq__nav-item';
    button.setAttribute('role', 'tab');
    button.id = 'faq-tab-' + index;
    button.setAttribute('aria-controls', 'faq-detail-panel');

    number.className = 'faq__nav-number';
    number.textContent = String(item.number || index + 1).padStart(2, '0');

    text.className = 'faq__nav-text';
    text.textContent = item.question || '';

    indicator.className = 'faq__nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');

    button.appendChild(number);
    button.appendChild(text);
    button.appendChild(indicator);

    button.addEventListener('click', function () {
      setActive(index, false);
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

  function render(data) {
    titleNode.textContent = data.title || '';
    subtitleNode.textContent = data.subtitle || '';
    items = Array.isArray(data.items) ? data.items : [];
    navNode.innerHTML = '';
    navButtons = items.map(createNavItem);
    navButtons.forEach(function (button) {
      navNode.appendChild(button);
    });
    detailNode.id = 'faq-detail-panel';

    if (items.length) {
      setActive(0, false);
      return;
    }

    setDetail(null);
  }

  fetch(contentUrl, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load content: ' + response.status);
      }

      return response.json();
    })
    .then(render)
    .catch(function () {
      if (section) {
        section.hidden = true;
      }
      console.error('[faq] fatal runtime fail');
    });
})();
