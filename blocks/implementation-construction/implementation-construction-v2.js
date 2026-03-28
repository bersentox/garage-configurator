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

  function createCard(item, columnKey, index) {
    const card = document.createElement('article');
    card.className = 'icv2-card';

    const cardId = `icv2-${columnKey}-${index + 1}`;
    const panelId = `${cardId}-panel`;

    card.innerHTML = `
      <button class="icv2-card__trigger" type="button" aria-expanded="false" aria-controls="${panelId}">
        <span class="icv2-card__number">${item.number}</span>
        <span class="icv2-card__copy">
          <h4 class="icv2-card__title">${item.title}</h4>
          <p class="icv2-card__support">${item.support}</p>
        </span>
        <span class="icv2-card__chevron" aria-hidden="true"></span>
      </button>
      <div class="icv2-card__panel" id="${panelId}" role="region" aria-label="${item.title}">
        <div class="icv2-card__body">
          <p class="icv2-card__description">${item.description}</p>
        </div>
      </div>
    `;

    const trigger = card.querySelector('.icv2-card__trigger');
    const panel = card.querySelector('.icv2-card__panel');
    const body = card.querySelector('.icv2-card__body');

    function openCard() {
      card.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.height = `${body.scrollHeight}px`;
    }

    function closeCard() {
      card.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.height = `${panel.scrollHeight}px`;
      requestAnimationFrame(() => {
        panel.style.height = '0px';
      });
    }

    trigger.addEventListener('click', function () {
      const isOpen = card.classList.contains('is-open');

      cardRegistry[columnKey].forEach(function (entry) {
        if (entry !== card && entry.classList.contains('is-open')) {
          const entryTrigger = entry.querySelector('.icv2-card__trigger');
          const entryPanel = entry.querySelector('.icv2-card__panel');
          const entryBody = entry.querySelector('.icv2-card__body');

          entry.classList.remove('is-open');
          entryTrigger.setAttribute('aria-expanded', 'false');
          entryPanel.style.height = `${entryPanel.scrollHeight}px`;
          requestAnimationFrame(function () {
            entryPanel.style.height = '0px';
          });
          if (!entryBody) return;
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

    return card;
  }

  ['implementation', 'construction'].forEach(function (columnKey) {
    const stack = stacks[columnKey];
    const items = Array.isArray(data[columnKey]) ? data[columnKey] : [];
    if (!stack || items.length === 0) return;

    items.forEach(function (item, index) {
      const card = createCard(item, columnKey, index);
      stack.appendChild(card);
      cardRegistry[columnKey].push(card);
    });

    const firstCard = cardRegistry[columnKey][0];
    if (!firstCard) return;

    firstCard.classList.add('is-open');
    const firstTrigger = firstCard.querySelector('.icv2-card__trigger');
    const firstPanel = firstCard.querySelector('.icv2-card__panel');
    const firstBody = firstCard.querySelector('.icv2-card__body');

    firstTrigger.setAttribute('aria-expanded', 'true');
    firstPanel.style.height = `${firstBody.scrollHeight}px`;

    requestAnimationFrame(function () {
      firstPanel.style.height = 'auto';
    });
  });

  window.addEventListener('resize', function () {
    ['implementation', 'construction'].forEach(function (columnKey) {
      cardRegistry[columnKey].forEach(function (card) {
        if (!card.classList.contains('is-open')) return;
        const panel = card.querySelector('.icv2-card__panel');
        panel.style.height = 'auto';
      });
    });
  });
})();
