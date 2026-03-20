(function () {
  const root = document.getElementById('implementation-construction-app');

  if (!root) {
    return;
  }

  const contentUrl = new URL('../site-body-content/implementation-construction.content.json', import.meta.url);

  root.innerHTML = `
    <section class="implementation-construction" aria-labelledby="implementation-construction-title">
      <div class="implementation-construction__inner">
        <header class="implementation-construction__header">
          <h2 id="implementation-construction-title" class="implementation-construction__title">
            Вы инвестируете не в гараж — а в управляемый результат
          </h2>
          <p class="implementation-construction__subtitle">
            Процесс под контролем. Конструкция просчитана. Результат предсказуем.
          </p>
        </header>
        <div
          class="implementation-construction__layout"
          role="group"
          aria-label="Системы контроля проекта и конструкции"
        >
          <section
            class="implementation-construction__column implementation-construction__column--process"
            aria-labelledby="implementation-construction-column-process-title"
          >
            <div class="implementation-construction__column-head">
              <h3
                id="implementation-construction-column-process-title"
                class="implementation-construction__column-title"
              >
                Реализация
              </h3>
            </div>
            <div
              class="implementation-construction__surface implementation-construction__surface--process"
              data-implementation-construction-surface="process"
              data-implementation-construction-accordion
            ></div>
          </section>
          <section
            class="implementation-construction__column implementation-construction__column--construction"
            aria-labelledby="implementation-construction-column-construction-title"
          >
            <div class="implementation-construction__column-head">
              <h3
                id="implementation-construction-column-construction-title"
                class="implementation-construction__column-title"
              >
                Конструкция
              </h3>
            </div>
            <div
              class="implementation-construction__surface implementation-construction__surface--construction"
              data-implementation-construction-surface="construction"
              data-implementation-construction-accordion
            ></div>
          </section>
        </div>
        <p class="implementation-construction__footer" data-implementation-construction-footer></p>
      </div>
    </section>
  `;

  const section = root.querySelector('.implementation-construction');
  const processSurface = root.querySelector('[data-implementation-construction-surface="process"]');
  const constructionSurface = root.querySelector('[data-implementation-construction-surface="construction"]');
  const footerNode = root.querySelector('[data-implementation-construction-footer]');

  function normalizeSectionKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  function resolveSectionGroup(sections) {
    const resolved = {
      process: null,
      construction: null,
      footer: ''
    };

    sections.forEach(function (sectionItem) {
      const key = normalizeSectionKey(
        sectionItem.section || sectionItem.slug || sectionItem.key || sectionItem.id || sectionItem.title
      );

      if (!resolved.process && (key.includes('реал') || key.includes('process') || key.includes('implementation'))) {
        resolved.process = sectionItem;
        return;
      }

      if (!resolved.construction && (key.includes('констр') || key.includes('construction'))) {
        resolved.construction = sectionItem;
        return;
      }

      if (!resolved.footer && (key.includes('footer') || key.includes('итог') || key.includes('result'))) {
        resolved.footer = sectionItem.text || sectionItem.content || sectionItem.description || '';
      }
    });

    if (!resolved.process && sections[0]) {
      resolved.process = sections[0];
    }

    if (!resolved.construction && sections[1]) {
      resolved.construction = sections[1];
    }

    if (!resolved.footer) {
      const footerSection = sections.find(function (sectionItem) {
        return sectionItem.footer || sectionItem.text || sectionItem.content;
      });

      resolved.footer =
        (footerSection && (footerSection.footer || footerSection.text || footerSection.content)) || '';
    }

    return resolved;
  }

  function getItems(sectionItem) {
    if (!sectionItem) {
      return [];
    }

    if (Array.isArray(sectionItem.items)) {
      return sectionItem.items;
    }

    if (Array.isArray(sectionItem.points)) {
      return sectionItem.points;
    }

    if (Array.isArray(sectionItem.entries)) {
      return sectionItem.entries;
    }

    return [];
  }

  function createItem(itemData, columnKey, itemIndex) {
    const item = document.createElement('article');
    const heading = document.createElement('h4');
    const trigger = document.createElement('button');
    const number = document.createElement('span');
    const copy = document.createElement('span');
    const top = document.createElement('span');
    const title = document.createElement('span');
    const chevron = document.createElement('span');
    const panel = document.createElement('div');
    const panelInner = document.createElement('div');
    const panelContent = document.createElement('div');
    const description = document.createElement('p');
    const triggerId = 'implementation-construction-' + columnKey + '-trigger-' + itemIndex;
    const panelId = 'implementation-construction-' + columnKey + '-panel-' + itemIndex;

    item.className = 'implementation-construction__item';
    heading.className = 'implementation-construction__heading';
    trigger.className = 'implementation-construction__trigger';
    trigger.type = 'button';
    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    number.className = 'implementation-construction__number';
    number.textContent = String(itemData.number || itemIndex + 1).padStart(2, '0');

    copy.className = 'implementation-construction__copy';
    top.className = 'implementation-construction__topline';

    title.className = 'implementation-construction__item-title';
    title.textContent = itemData.title || '';
    top.appendChild(title);

    if (itemData.status) {
      const meta = document.createElement('span');
      meta.className = 'implementation-construction__meta';
      meta.textContent = itemData.status;
      top.appendChild(meta);
    }

    copy.appendChild(top);

    chevron.className = 'implementation-construction__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    panel.className = 'implementation-construction__panel';
    panel.id = panelId;
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', triggerId);

    panelInner.className = 'implementation-construction__panel-inner';
    panelContent.className = 'implementation-construction__panel-content';
    description.className = 'implementation-construction__description';
    description.textContent = itemData.description || '';

    panelContent.appendChild(description);
    panelInner.appendChild(panelContent);
    panel.appendChild(panelInner);

    trigger.appendChild(number);
    trigger.appendChild(copy);
    trigger.appendChild(chevron);
    heading.appendChild(trigger);
    item.appendChild(heading);
    item.appendChild(panel);

    trigger.addEventListener('click', function () {
      const nextIsOpen = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(nextIsOpen));
      item.classList.toggle('is-open', nextIsOpen);
      panel.hidden = !nextIsOpen;
    });

    return item;
  }

  function renderSection(surface, sectionItem, columnKey) {
    surface.innerHTML = '';
    getItems(sectionItem).forEach(function (itemData, itemIndex) {
      surface.appendChild(createItem(itemData, columnKey, itemIndex));
    });
  }

  function render(data) {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const resolved = resolveSectionGroup(sections);

    renderSection(processSurface, resolved.process, 'process');
    renderSection(constructionSurface, resolved.construction, 'construction');
    footerNode.textContent = data.footer || resolved.footer || '';
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
      console.error('[implementation-construction] fatal runtime fail');
    });
})();
