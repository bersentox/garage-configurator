(async () => {
  const root = document.querySelector('.unified-navigation');

  if (!root) {
    return;
  }

  const titleElement = root.querySelector('.unified-navigation__title');
  const subtitleElement = root.querySelector('.unified-navigation__subtitle');
  const transitionElement = root.querySelector('[data-unified-navigation-transition]');
  const statusElement = root.querySelector('[data-unified-navigation-status]');
  const stageLayer = root.querySelector('[data-unified-navigation-stages]');
  const clusterLayer = root.querySelector('[data-unified-navigation-cluster]');
  const mainConnectorSvg = root.querySelector('.unified-navigation__connectors--main');
  const clusterConnectorSvg = root.querySelector('.unified-navigation__connectors--cluster');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stageLayouts = {
    desktop: [
      { x: 18, y: 22 },
      { x: 39, y: 15 },
      { x: 68, y: 20 },
      { x: 80, y: 42 },
      { x: 62, y: 66 },
      { x: 31, y: 72 },
      { x: 14, y: 50 }
    ],
    tablet: [
      { x: 20, y: 18 },
      { x: 50, y: 14 },
      { x: 77, y: 24 },
      { x: 78, y: 49 },
      { x: 57, y: 72 },
      { x: 27, y: 76 },
      { x: 15, y: 50 }
    ],
    mobile: [
      { x: 26, y: 13 },
      { x: 68, y: 20 },
      { x: 28, y: 32 },
      { x: 71, y: 42 },
      { x: 31, y: 57 },
      { x: 69, y: 69 },
      { x: 40, y: 84 }
    ]
  };

  const clusterLayouts = {
    desktop: {
      right: {
        summary: { x: 16, y: -12 },
        steps: [
          { x: 22, y: -26 },
          { x: 31, y: -4 },
          { x: 28, y: 20 },
          { x: 10, y: 31 }
        ]
      },
      left: {
        summary: { x: -16, y: -12 },
        steps: [
          { x: -24, y: -24 },
          { x: -31, y: -2 },
          { x: -28, y: 21 },
          { x: -11, y: 31 }
        ]
      },
      bottom: {
        summary: { x: 0, y: 15 },
        steps: [
          { x: -17, y: 28 },
          { x: 9, y: 32 },
          { x: 27, y: 19 },
          { x: -28, y: 16 }
        ]
      }
    },
    tablet: {
      right: {
        summary: { x: 14, y: -10 },
        steps: [
          { x: 19, y: -24 },
          { x: 27, y: -3 },
          { x: 23, y: 19 },
          { x: 7, y: 28 }
        ]
      },
      left: {
        summary: { x: -14, y: -10 },
        steps: [
          { x: -21, y: -22 },
          { x: -27, y: -1 },
          { x: -24, y: 18 },
          { x: -8, y: 28 }
        ]
      },
      bottom: {
        summary: { x: 0, y: 14 },
        steps: [
          { x: -15, y: 27 },
          { x: 7, y: 31 },
          { x: 23, y: 21 },
          { x: -23, y: 18 }
        ]
      }
    },
    mobile: {
      right: {
        summary: { x: 0, y: 13 },
        steps: [
          { x: -18, y: 29 },
          { x: 18, y: 31 },
          { x: -10, y: 46 },
          { x: 20, y: 49 }
        ]
      },
      left: {
        summary: { x: 0, y: 13 },
        steps: [
          { x: -18, y: 29 },
          { x: 18, y: 31 },
          { x: -10, y: 46 },
          { x: 20, y: 49 }
        ]
      },
      bottom: {
        summary: { x: 0, y: 13 },
        steps: [
          { x: -18, y: 29 },
          { x: 18, y: 31 },
          { x: -10, y: 46 },
          { x: 20, y: 49 }
        ]
      }
    }
  };

  const setPosition = (element, x, y) => {
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
  };

  const getMode = () => {
    if (window.innerWidth <= 640) {
      return 'mobile';
    }
    if (window.innerWidth <= 1024) {
      return 'tablet';
    }
    return 'desktop';
  };

  const connectorPath = (from, to, bend = 8) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const controlOneX = midX - deltaX * 0.18;
    const controlOneY = from.y + bend * Math.sign(deltaY || 1);
    const controlTwoX = midX + deltaX * 0.18;
    const controlTwoY = to.y - bend * Math.sign(deltaY || 1);

    return `M ${from.x} ${from.y} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${to.x} ${to.y}`;
  };

  const clusterConnectorPath = (from, to) => {
    const direction = to.x >= from.x ? 1 : -1;
    const controlOne = { x: from.x + direction * 5, y: from.y + (to.y - from.y) * 0.2 };
    const controlTwo = { x: to.x - direction * 6, y: to.y - (to.y - from.y) * 0.18 };
    return `M ${from.x} ${from.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${to.x} ${to.y}`;
  };

  const createPath = (pathData, className) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', className);
    return path;
  };

  const buildTransitionText = (stages) => {
    const finalStage = stages[stages.length - 1];
    return finalStage?.description || '';
  };

  let content;

  try {
    const response = await fetch('../site-body-content/unified-navigation.content.json');
    content = await response.json();
  } catch (error) {
    titleElement.textContent = 'Не удалось загрузить карту этапов';
    subtitleElement.textContent = 'Проверьте доступность JSON-источника для блока unified-navigation.';
    return;
  }

  titleElement.textContent = content.title || '';
  subtitleElement.textContent = content.subtitle || '';
  transitionElement.textContent = buildTransitionText(content.stages || []);
  statusElement.innerHTML = `<div class="unified-navigation__status-pill"><span>${content.activeStageLabel || 'Активный этап'}</span><strong>—</strong></div>`;

  let activeStageId = null;
  let stageButtons = [];

  const renderMainConnectors = (positions) => {
    mainConnectorSvg.innerHTML = '';
    positions.forEach((position, index) => {
      const nextPosition = positions[index + 1];
      if (!nextPosition) {
        return;
      }

      const bend = index % 2 === 0 ? 7 : -7;
      mainConnectorSvg.append(createPath(connectorPath(position, nextPosition, bend), 'unified-navigation__connector-path'));
    });
  };

  const createStageButton = (stage, index, positions) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'unified-navigation__stage';
    button.dataset.stageId = String(index);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `unified-navigation-cluster-${index}`);
    button.setAttribute('aria-label', `${stage.number} ${stage.title}. ${stage.description}`);
    setPosition(button, positions[index].x, positions[index].y);

    button.innerHTML = `
      <span class="unified-navigation__stage-content">
        <span class="unified-navigation__stage-number">${stage.number}</span>
        <span class="unified-navigation__stage-body">
          <span class="unified-navigation__stage-title">${stage.title}</span>
          <span class="unified-navigation__stage-label">${stage.label}</span>
        </span>
      </span>
    `;

    const clearPressed = () => button.classList.remove('is-pressed');

    button.addEventListener('pointerdown', () => {
      button.classList.add('is-pressed');
    });
    button.addEventListener('pointerup', clearPressed);
    button.addEventListener('pointerleave', clearPressed);
    button.addEventListener('pointercancel', clearPressed);
    button.addEventListener('click', () => toggleStage(index));

    return button;
  };

  const getClusterVariant = (anchorPosition) => {
    const mode = getMode();

    if (mode === 'mobile') {
      return 'bottom';
    }
    if (anchorPosition.x >= 64) {
      return 'left';
    }
    if (anchorPosition.y >= 68) {
      return 'top' in clusterLayouts[mode] ? 'top' : 'right';
    }
    return 'right';
  };

  const getClusterGeometry = (index, stepsLength) => {
    const mode = getMode();
    const anchor = stageLayouts[mode][index];
    const variant = getClusterVariant(anchor);
    const layoutSet = clusterLayouts[mode][variant] || clusterLayouts[mode].right;
    const summary = { x: anchor.x + layoutSet.summary.x, y: anchor.y + layoutSet.summary.y };
    const steps = layoutSet.steps.slice(0, stepsLength).map((step) => ({ x: anchor.x + step.x, y: anchor.y + step.y }));
    return { anchor, summary, steps };
  };

  const renderCluster = (stageIndex) => {
    clusterLayer.innerHTML = '';
    clusterConnectorSvg.innerHTML = '';
    clusterLayer.classList.remove('is-open');

    if (stageIndex === null) {
      return;
    }

    const stage = content.stages[stageIndex];
    const geometry = getClusterGeometry(stageIndex, stage.steps.length);
    const fragment = document.createDocumentFragment();

    const summaryCard = document.createElement('article');
    summaryCard.id = `unified-navigation-cluster-${stageIndex}`;
    summaryCard.className = 'unified-navigation__cluster-card unified-navigation__cluster-card--summary';
    summaryCard.setAttribute('role', 'region');
    summaryCard.setAttribute('aria-label', `${stage.branchTitle}. ${stage.branchText}`);
    setPosition(summaryCard, geometry.summary.x, geometry.summary.y);
    summaryCard.innerHTML = `
      <div class="unified-navigation__cluster-topline">
        <span class="unified-navigation__cluster-number">${stage.number}</span>
        <p class="unified-navigation__cluster-label">branch summary</p>
      </div>
      <h3 class="unified-navigation__cluster-title">${stage.branchTitle}</h3>
      <p class="unified-navigation__cluster-text">${stage.branchText}</p>
    `;

    fragment.append(summaryCard);
    clusterConnectorSvg.append(createPath(clusterConnectorPath(geometry.anchor, geometry.summary), 'unified-navigation__connector-path is-active'));

    stage.steps.forEach((step, stepIndex) => {
      const stepCard = document.createElement('button');
      stepCard.type = 'button';
      stepCard.className = 'unified-navigation__cluster-card unified-navigation__cluster-card--step';
      stepCard.setAttribute('aria-label', `${step.detailTitle}. ${step.detailText}`);
      setPosition(stepCard, geometry.steps[stepIndex].x, geometry.steps[stepIndex].y);
      stepCard.innerHTML = `
        <div class="unified-navigation__cluster-topline">
          <span class="unified-navigation__cluster-number">${step.number}</span>
          <p class="unified-navigation__cluster-label">${step.label}</p>
        </div>
        <h3 class="unified-navigation__cluster-title">${step.title}</h3>
        <p class="unified-navigation__cluster-description">${step.detailText}</p>
      `;

      fragment.append(stepCard);
      clusterConnectorSvg.append(createPath(clusterConnectorPath(geometry.anchor, geometry.steps[stepIndex]), 'unified-navigation__connector-path is-active'));
    });

    clusterLayer.append(fragment);
    clusterLayer.classList.add('is-open');

    const clusterCards = Array.from(clusterLayer.querySelectorAll('.unified-navigation__cluster-card'));
    clusterCards.forEach((card, index) => {
      const delay = reducedMotion ? 0 : index * 90;
      window.setTimeout(() => {
        card.classList.add('is-visible');
      }, delay);
    });
  };

  const syncStageStates = () => {
    stageButtons.forEach((button, index) => {
      const isActive = activeStageId === index;
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('is-dimmed', activeStageId !== null && !isActive);
      button.setAttribute('aria-expanded', String(isActive));
    });

    const activeStage = activeStageId !== null ? content.stages[activeStageId] : null;
    statusElement.innerHTML = activeStage
      ? `<div class="unified-navigation__status-pill"><span>${content.activeStageLabel || 'Активный этап'}</span><strong>${activeStage.number} ${activeStage.title}</strong></div>`
      : `<div class="unified-navigation__status-pill"><span>${content.activeStageLabel || 'Активный этап'}</span><strong>—</strong></div>`;

    Array.from(mainConnectorSvg.querySelectorAll('.unified-navigation__connector-path')).forEach((path, index) => {
      const isActivePath = activeStageId !== null && (index === activeStageId || index === activeStageId - 1);
      path.classList.toggle('is-active', isActivePath);
    });
  };

  const closeCluster = () => {
    if (!clusterLayer.classList.contains('is-open')) {
      activeStageId = null;
      syncStageStates();
      return;
    }

    Array.from(clusterLayer.querySelectorAll('.unified-navigation__cluster-card')).forEach((card) => {
      card.classList.remove('is-visible');
    });

    window.setTimeout(() => {
      if (activeStageId === null) {
        renderCluster(null);
      }
    }, reducedMotion ? 0 : 180);
  };

  const toggleStage = (index) => {
    if (activeStageId === index) {
      activeStageId = null;
      syncStageStates();
      closeCluster();
      return;
    }

    activeStageId = index;
    syncStageStates();
    renderCluster(index);
  };

  const render = () => {
    const mode = getMode();
    const positions = stageLayouts[mode];

    stageLayer.innerHTML = '';
    stageButtons = content.stages.map((stage, index) => createStageButton(stage, index, positions));
    stageLayer.append(...stageButtons);
    renderMainConnectors(positions);
    syncStageStates();
    renderCluster(activeStageId);
  };

  render();
  window.addEventListener('resize', render);
})();
