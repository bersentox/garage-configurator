(() => {
  'use strict';

  const block = document.querySelector('[data-implementation-construction]');

  if (!block) {
    return;
  }

  const source = block.getAttribute('data-source');
  const columns = Array.from(block.querySelectorAll('.implementation-construction__column'));
  const footer = block.querySelector('.implementation-construction__footer');

  function createAccordionItem(itemData, sectionIndex, itemIndex) {
    const item = document.createElement('article');
    item.className = 'implementation-construction__item';

    const trigger = document.createElement('button');
    trigger.className = 'implementation-construction__trigger';
    trigger.type = 'button';

    const panelId = `implementation-construction-panel-${sectionIndex}-${itemIndex}`;
    const triggerId = `implementation-construction-trigger-${sectionIndex}-${itemIndex}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    const number = document.createElement('span');
    number.className = 'implementation-construction__number';
    number.textContent = itemData.number || '';

    const copy = document.createElement('span');
    copy.className = 'implementation-construction__item-copy';

    const title = document.createElement('span');
    title.className = 'implementation-construction__item-title';
    title.textContent = itemData.title || '';

    const status = document.createElement('span');
    status.className = 'implementation-construction__status';
    status.textContent = itemData.status || '';

    const icon = document.createElement('span');
    icon.className = 'implementation-construction__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';

    copy.appendChild(title);
    copy.appendChild(status);

    trigger.appendChild(number);
    trigger.appendChild(copy);
    trigger.appendChild(icon);

    const panel = document.createElement('div');
    panel.className = 'implementation-construction__panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);
    panel.hidden = true;

    const description = document.createElement('p');
    description.className = 'implementation-construction__description';
    description.textContent = itemData.description || '';

    panel.appendChild(description);

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      item.classList.toggle('is-open', !isOpen);
      icon.textContent = isOpen ? '+' : '−';
    });

    item.appendChild(trigger);
    item.appendChild(panel);

    return item;
  }

  const render = (data) => {
    columns.forEach((column, columnIndex) => {
      const section = data.sections?.[columnIndex];
      const title = column.querySelector('.implementation-construction__column-title');
      const accordion = column.querySelector('.implementation-construction__accordion');

      if (!section || !title || !accordion) {
        return;
      }

      title.textContent = section.title;
      accordion.replaceChildren(
        ...section.items.map((item, itemIndex) => createAccordionItem(item, columnIndex, itemIndex)),
      );
    });

    if (footer) {
      footer.textContent = data.footer || '';
    }
  };

  const init = async () => {
    if (!source) {
      return;
    }

    try {
      const response = await fetch(source, { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      render(data);
    } catch {
      /* Intentionally silent to keep the block isolated. */
    }
  };

  init();
})();
