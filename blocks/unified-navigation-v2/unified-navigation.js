(() => {
  const root = document.querySelector('.process-nav');

  if (!root) {
    return;
  }

  const titleEl = root.querySelector('.process-nav__title');
  const subtitleEl = root.querySelector('.process-nav__subtitle');
  const timelineEl = root.querySelector('.process-nav__timeline');
  const branchEl = root.querySelector('.process-nav__branch');

  const state = {
    activeStageIndex: 0,
    expandedStepIndex: 0,
    data: null
  };

  const clampIndex = (value, max) => {
    if (max <= 0) {
      return 0;
    }

    return Math.min(Math.max(value, 0), max - 1);
  };

  const render = () => {
    const { data, activeStageIndex, expandedStepIndex } = state;

    if (!data?.stages?.length) {
      return;
    }

    const stageCount = data.stages.length;
    const activeStage = data.stages[activeStageIndex];
    const safeExpandedIndex = clampIndex(expandedStepIndex, activeStage.steps.length);

    titleEl.textContent = data.title ?? '';
    subtitleEl.textContent = data.subtitle ?? '';
    timelineEl.style.setProperty('--stage-count', String(stageCount));

    timelineEl.innerHTML = data.stages
      .map((stage, index) => {
        const activeClass = index === activeStageIndex ? ' is-active' : '';

        return `
          <button
            class="process-stage${activeClass}"
            type="button"
            role="tab"
            aria-selected="${index === activeStageIndex}"
            aria-controls="process-branch"
            data-stage-index="${index}"
          >
            <span class="process-stage__number">${stage.number}</span>
            <span class="process-stage__title">${stage.title}</span>
          </button>
        `;
      })
      .join('');

    branchEl.id = 'process-branch';
    branchEl.innerHTML = activeStage.steps
      .map((step, index) => {
        const expandedClass = index === safeExpandedIndex ? ' is-expanded' : '';

        return `
          <article class="process-step${expandedClass}">
            <button
              type="button"
              class="process-step__trigger"
              aria-expanded="${index === safeExpandedIndex}"
              data-step-index="${index}"
            >
              <span class="process-step__number">${step.number}</span>
              <span class="process-step__compact">
                <span class="process-step__title">${step.title}</span>
              </span>
            </button>
            <div class="process-step__detail">
              <h3 class="process-step__detail-title">${step.detailTitle}</h3>
              <p class="process-step__detail-text">${step.detailText}</p>
            </div>
          </article>
        `;
      })
      .join('');
  };

  timelineEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-stage-index]');

    if (!trigger) {
      return;
    }

    const nextStageIndex = Number.parseInt(trigger.dataset.stageIndex, 10);

    if (!Number.isNaN(nextStageIndex) && nextStageIndex !== state.activeStageIndex) {
      state.activeStageIndex = nextStageIndex;
      state.expandedStepIndex = 0;
      render();
    }
  });

  branchEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-step-index]');

    if (!trigger) {
      return;
    }

    const nextStepIndex = Number.parseInt(trigger.dataset.stepIndex, 10);

    if (!Number.isNaN(nextStepIndex) && nextStepIndex !== state.expandedStepIndex) {
      state.expandedStepIndex = nextStepIndex;
      render();
    }
  });

  fetch('./unified-navigation.content.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      state.data = data;
      state.activeStageIndex = clampIndex(0, data.stages.length);
      state.expandedStepIndex = 0;
      render();
    })
    .catch((error) => {
      branchEl.innerHTML = `<p class="process-nav__error">Не удалось загрузить навигацию. ${error.message}</p>`;
    });
})();
