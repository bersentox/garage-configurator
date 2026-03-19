(() => {
  'use strict';

  const block = document.querySelector('[data-implementation-construction]');

  if (!block) {
    return;
  }

  const source = block.getAttribute('data-source');
  const columns = Array.from(block.querySelectorAll('.implementation-construction__column'));
  const footer = block.querySelector('.implementation-construction__footer');
  let blockId = 0;

  const createItem = (item, columnIndex, itemIndex) => {
    const article = document.createElement('article');
    article.className = 'implementation-construction__item';
    article.dataset.open = itemIndex === 0 ? 'true' : 'false';

    const trigger = document.createElement('button');
    trigger.className = 'implementation-construction__trigger';
    trigger.type = 'button';

    const triggerId = `implementation-construction-trigger-${blockId}-${columnIndex}-${itemIndex}`;
    const panelId = `implementation-construction-panel-${blockId}-${columnIndex}-${itemIndex}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', article.dataset.open === 'true' ? 'true' : 'false');

    const meta = document.createElement('span');
    meta.className = 'implementation-construction__item-meta';

    const number = document.createElement('span');
    number.className = 'implementation-construction__number';
    number.textContent = item.number;

    const title = document.createElement('span');
    title.className = 'implementation-construction__item-title';
    title.textContent = item.title;

    meta.append(number, title);

    const status = document.createElement('span');
    status.className = 'implementation-construction__status';
    status.textContent = item.status;

    const panel = document.createElement('div');
    panel.className = 'implementation-construction__panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);
    if (article.dataset.open !== 'true') {
      panel.hidden = true;
    }

    const description = document.createElement('p');
    description.className = 'implementation-construction__description';
    description.textContent = item.description;

    panel.append(description);
    trigger.append(meta, status);
    article.append(trigger, panel);

    return article;
  };

  const setItemState = (item, isOpen) => {
    const trigger = item.querySelector('.implementation-construction__trigger');
    const panel = item.querySelector('.implementation-construction__panel');

    item.dataset.open = isOpen ? 'true' : 'false';
    trigger?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (panel) {
      panel.hidden = !isOpen;
    }
  };

  const bindAccordion = (accordion) => {
    accordion.addEventListener('click', (event) => {
      const trigger = event.target instanceof Element ? event.target.closest('.implementation-construction__trigger') : null;

      if (!trigger) {
        return;
      }

      const item = trigger.closest('.implementation-construction__item');

      if (!item) {
        return;
      }

      setItemState(item, item.dataset.open !== 'true');
    });
  };

  const render = (data) => {
    blockId += 1;

    columns.forEach((column, columnIndex) => {
      const section = data.sections?.[columnIndex];
      const title = column.querySelector('.implementation-construction__column-title');
      const accordion = column.querySelector('.implementation-construction__accordion');

      if (!section || !title || !accordion) {
        return;
      }

      title.textContent = section.title;
      accordion.replaceChildren(...section.items.map((item, itemIndex) => createItem(item, columnIndex, itemIndex)));
      bindAccordion(accordion);
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
