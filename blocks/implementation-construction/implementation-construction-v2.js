(function () {
  const root = document.querySelector('.icv2');
  if (!root) return;

  const dataEl = document.getElementById('icv2-data');
  if (!dataEl) return;

  let data;
  try {
    data = JSON.parse(dataEl.textContent || '{}');
  } catch (error) {
    console.error('[icv2] failed to parse data:', error);
    return;
  }

  const stacks = {
    implementation: root.querySelector('[data-icv2-stack="implementation"]'),
    construction: root.querySelector('[data-icv2-stack="construction"]')
  };

  const cardRegistry = {
    implementation: [],
    construction: []
  };


  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createCard(item, columnKey, index) {
    const card = document.createElement('article');
    card.className = 'icv2-card';

    const cardId = `icv2-${columnKey}-${index + 1}`;
    const panelId = `${cardId}-panel`;

    const title = escapeHtml(item.title || '');
    const support = escapeHtml(item.support || '').replace(/\n/g, '<br>');
    const description = escapeHtml(item.description || '');

    card.innerHTML = `
      <button class="icv2-card__trigger" type="button" aria-expanded="false" aria-controls="${panelId}">
        <span class="icv2-card__number">${escapeHtml(item.number || '')}</span>
        <span class="icv2-card__copy">
          <h4 class="icv2-card__title">${title}</h4>
          <p class="icv2-card__support">${support}</p>
        </span>
      </button>
      <div class="icv2-card__panel" id="${panelId}" role="region" aria-label="${title}">
        <div class="icv2-card__body">
          <p class="icv2-card__description">${description}</p>
        </div>
      </div>
    `;

    const trigger = card.querySelector('.icv2-card__trigger');
    const panel = card.querySelector('.icv2-card__panel');
    const body = card.querySelector('.icv2-card__body');

    function setExpandedState(isOpen) {
      card.classList.toggle('is-open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
    }

    function animateHeight(from, to) {
      panel.style.height = `${from}px`;
      // Force style/layout flush so the next write is animated consistently.
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight;
      panel.style.height = `${to}px`;
    }

    function openCard() {
      const startHeight = panel.getBoundingClientRect().height;
      setExpandedState(true);
      const targetHeight = body.scrollHeight;
      animateHeight(startHeight, targetHeight);
    }

    function closeCard() {
      const startHeight = panel.getBoundingClientRect().height || body.scrollHeight;
      setExpandedState(false);
      animateHeight(startHeight, 0);
    }

    trigger.addEventListener('click', function () {
      const isOpen = card.classList.contains('is-open');

      cardRegistry[columnKey].forEach(function (entry) {
        if (entry.card !== card && entry.card.classList.contains('is-open')) {
          entry.close();
        }
      });

      if (isOpen) {
        closeCard();
      } else {
        openCard();
      }
    });

    panel.addEventListener('transitionend', function (event) {
      if (event.propertyName !== 'height') return;
      if (card.classList.contains('is-open')) {
        panel.style.height = 'auto';
      }
    });

    return {
      card,
      open: openCard,
      close: closeCard
    };
  }

  ['implementation', 'construction'].forEach(function (columnKey) {
    const stack = stacks[columnKey];
    const items = Array.isArray(data[columnKey]) ? data[columnKey] : [];
    if (!stack || items.length === 0) return;

    items.forEach(function (item, index) {
      const entry = createCard(item, columnKey, index);
      stack.appendChild(entry.card);
      cardRegistry[columnKey].push(entry);
    });
  });

  window.addEventListener('resize', function () {
    ['implementation', 'construction'].forEach(function (columnKey) {
      cardRegistry[columnKey].forEach(function (entry) {
        if (!entry.card.classList.contains('is-open')) return;
        const panel = entry.card.querySelector('.icv2-card__panel');
        panel.style.height = 'auto';
      });
    });
  });
})();
