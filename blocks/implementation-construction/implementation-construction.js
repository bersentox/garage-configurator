(function () {
  const APP_ID = 'implementation-construction-app';
  const MOUNT_FLAG = 'implementationConstructionMounted';
  const BASE_URL =
    (window.GARAGE_CONFIGURATOR_EMBED_BASE_URL || '')
      .trim()
      .replace(/\/+$/, '');
  const JSON_PATH = BASE_URL
    ? `${BASE_URL}/site-body-content/implementation-construction.content.json`
    : '../site-body-content/implementation-construction.content.json';
  const TEMPLATE = `
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

  const appRoot = document.getElementById(APP_ID);

  if (!appRoot) {
    return;
  }

  if (!appRoot.querySelector('.implementation-construction')) {
    appRoot.innerHTML = TEMPLATE;
  }

  if (appRoot.dataset[MOUNT_FLAG] === 'true') {
    return;
  }

  appRoot.dataset[MOUNT_FLAG] = 'true';

  const root = appRoot.querySelector('.implementation-construction');

  if (!root) {
    return;
  }

  const processSurface = root.querySelector('[data-implementation-construction-surface="process"]');
  const constructionSurface = root.querySelector('[data-implementation-construction-surface="construction"]');
  const footerNode = root.querySelector('[data-implementation-construction-footer]');

  function normalizeSectionKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  function resolveSectionGroup(sections) {
    const result = {
      process: null,
      construction: null,
      footer: ''
    };

    sections.forEach((section) => {
      const key = normalizeSectionKey(section.section || section.slug || section.key || section.id || section.title);

      if (!result.process && (key.includes('реал') || key.includes('process') || key.includes('implementation'))) {
        result.process = section;
        return;
      }

      if (!result.construction && (key.includes('констр') || key.includes('construction'))) {
        result.construction = section;
        return;
      }

      if (!result.footer && (key.includes('footer') || key.includes('итог') || key.includes('result'))) {
        result.footer = section.text || section.content || section.description || '';
      }
    });

    if (!result.process && sections[0]) {
      result.process = sections[0];
    }

    if (!result.construction && sections[1]) {
      result.construction = sections[1];
    }

    if (!result.footer) {
      const footerCandidate = sections.find((section) => section.footer || section.text || section.content);
      result.footer =
        (footerCandidate && (footerCandidate.footer || footerCandidate.text || footerCandidate.content)) || '';
    }

    return result;
  }

  function getItems(section) {
    if (!section) {
      return [];
    }

    if (Array.isArray(section.items)) {
      return section.items;
    }

    if (Array.isArray(section.points)) {
      return section.points;
    }

    if (Array.isArray(section.entries)) {
      return section.entries;
    }

    return [];
  }

  function createItem(itemData, columnKey, itemIndex) {
    const item = document.createElement('article');
    item.className = 'implementation-construction__item';

    const heading = document.createElement('h4');
    heading.className = 'implementation-construction__heading';

    const trigger = document.createElement('button');
    trigger.className = 'implementation-construction__trigger';
    trigger.type = 'button';

    const triggerId = `implementation-construction-${columnKey}-trigger-${itemIndex}`;
    const panelId = `implementation-construction-${columnKey}-panel-${itemIndex}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    const number = document.createElement('span');
    number.className = 'implementation-construction__number';
    number.textContent = String(itemData.number || itemIndex + 1).padStart(2, '0');

    const copy = document.createElement('span');
    copy.className = 'implementation-construction__copy';

    const top = document.createElement('span');
    top.className = 'implementation-construction__topline';

    const title = document.createElement('span');
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

    const chevron = document.createElement('span');
    chevron.className = 'implementation-construction__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    trigger.appendChild(number);
    trigger.appendChild(copy);
    trigger.appendChild(chevron);
    heading.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'implementation-construction__panel';
    panel.id = panelId;
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', triggerId);

    const panelInner = document.createElement('div');
    panelInner.className = 'implementation-construction__panel-inner';

    const panelContent = document.createElement('div');
    panelContent.className = 'implementation-construction__panel-content';

    const description = document.createElement('p');
    description.className = 'implementation-construction__description';
    description.textContent = itemData.description || '';

    panelContent.appendChild(description);
    panelInner.appendChild(panelContent);
    panel.appendChild(panelInner);

    trigger.addEventListener('click', function () {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      const nextOpenState = !isOpen;
      trigger.setAttribute('aria-expanded', String(nextOpenState));
      item.classList.toggle('is-open', nextOpenState);
      panel.hidden = !nextOpenState;
    });

    item.appendChild(heading);
    item.appendChild(panel);

    return item;
  }

  function renderSection(surface, section, columnKey) {
    surface.innerHTML = '';

    getItems(section).forEach((itemData, itemIndex) => {
      surface.appendChild(createItem(itemData, columnKey, itemIndex));
    });
  }

  async function init() {
    try {
      const response = await fetch(JSON_PATH, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.status}`);
      }

      const data = await response.json();
      const sections = Array.isArray(data.sections) ? data.sections : [];
      const resolved = resolveSectionGroup(sections);

      renderSection(processSurface, resolved.process, 'process');
      renderSection(constructionSurface, resolved.construction, 'construction');

      if (footerNode) {
        footerNode.textContent =
          data.footer ||
          resolved.footer ||
          'Надёжный результат начинается задолго до монтажа.';
      }
    } catch (error) {
      console.error('[implementation-construction] render failed', error);

      if (footerNode) {
        footerNode.textContent = 'Надёжный результат начинается задолго до монтажа.';
      }
    }
  }

  init();
})();
