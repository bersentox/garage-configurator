(function () {
  const root = document.querySelector('.unified-navigation');

  if (!root) {
    return;
  }

  const JSON_PATH = '../site-body-content/unified-navigation.content.json';
  const eyebrowNode = root.querySelector('[data-unified-navigation-eyebrow]');
  const titleNode = root.querySelector('.unified-navigation__title');
  const subtitleNode = root.querySelector('.unified-navigation__subtitle');
  const stagesNode = root.querySelector('[data-unified-navigation-stages]');
  const transitionNode = root.querySelector('[data-unified-navigation-transition]');

  let activeCluster = null;

  function createStepCard(step) {
    const card = document.createElement('article');
    card.className = 'unified-navigation__step-card';

    const head = document.createElement('div');
    head.className = 'unified-navigation__step-head';

    const number = document.createElement('span');
    number.className = 'unified-navigation__step-number';
    number.textContent = step.number || '';

    const label = document.createElement('span');
    label.className = 'unified-navigation__step-label';
    label.textContent = step.label || '';

    head.appendChild(number);
    head.appendChild(label);

    const title = document.createElement('h4');
    title.className = 'unified-navigation__step-title';
    title.textContent = step.detailTitle || step.title || '';

    const detail = document.createElement('p');
    detail.className = 'unified-navigation__step-detail';
    detail.textContent = step.detailText || '';

    card.appendChild(head);
    card.appendChild(title);
    card.appendChild(detail);

    return card;
  }

  function setClusterOpen(cluster, nextOpen) {
    if (!cluster) {
      return;
    }

    const trigger = cluster.querySelector('.unified-navigation__branch-trigger');
    const panel = cluster.querySelector('.unified-navigation__branch-panel');

    cluster.classList.toggle('is-open', nextOpen);
    trigger.classList.remove('is-pressed');
    trigger.setAttribute('aria-expanded', String(nextOpen));
    panel.hidden = !nextOpen;

    if (nextOpen) {
      activeCluster = cluster;
    } else if (activeCluster === cluster) {
      activeCluster = null;
    }
  }

  function closeOtherClusters(nextCluster) {
    const clusters = stagesNode.querySelectorAll('.unified-navigation__branch-cluster');

    clusters.forEach((cluster) => {
      if (cluster !== nextCluster) {
        setClusterOpen(cluster, false);
      }
    });
  }

  function bindTrigger(trigger, cluster) {
    const clearPressed = function () {
      trigger.classList.remove('is-pressed');
    };

    trigger.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
        return;
      }

      trigger.classList.add('is-pressed');
    });

    trigger.addEventListener('pointerup', clearPressed);
    trigger.addEventListener('pointercancel', clearPressed);
    trigger.addEventListener('pointerleave', clearPressed);

    trigger.addEventListener('click', function () {
      const isOpen = cluster.classList.contains('is-open');

      if (isOpen) {
        setClusterOpen(cluster, false);
        return;
      }

      closeOtherClusters(cluster);
      setClusterOpen(cluster, true);
    });

    trigger.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        trigger.classList.add('is-pressed');
      }
    });

    trigger.addEventListener('keyup', function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        clearPressed();
      }
    });

    trigger.addEventListener('blur', clearPressed);
  }

  function createStageItem(stage, index) {
    const side = index % 2 === 0 ? 'right' : 'left';
    const item = document.createElement('li');
    item.className = `unified-navigation__stage-item unified-navigation__stage-item--${side}`;

    const stageNode = document.createElement('article');
    stageNode.className = 'unified-navigation__stage-node';

    const topLine = document.createElement('div');
    topLine.className = 'unified-navigation__stage-topline';

    const number = document.createElement('span');
    number.className = 'unified-navigation__stage-number';
    number.textContent = stage.number || String(index + 1).padStart(2, '0');

    const label = document.createElement('span');
    label.className = 'unified-navigation__stage-label';
    label.textContent = stage.label || '';

    const title = document.createElement('h3');
    title.className = 'unified-navigation__stage-title';
    title.textContent = stage.title || '';

    const description = document.createElement('p');
    description.className = 'unified-navigation__stage-description';
    description.textContent = stage.description || '';

    topLine.appendChild(number);
    topLine.appendChild(label);
    stageNode.appendChild(topLine);
    stageNode.appendChild(title);
    stageNode.appendChild(description);

    const cluster = document.createElement('div');
    cluster.className = 'unified-navigation__branch-cluster';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'unified-navigation__branch-trigger';

    const panelId = `unified-navigation-panel-${index}`;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    const token = document.createElement('span');
    token.className = 'unified-navigation__branch-token';
    token.textContent = stage.number || '';

    const copy = document.createElement('span');
    copy.className = 'unified-navigation__branch-copy';

    const branchTitle = document.createElement('span');
    branchTitle.className = 'unified-navigation__branch-title';
    branchTitle.textContent = stage.branchTitle || stage.title || '';

    const branchLabel = document.createElement('span');
    branchLabel.className = 'unified-navigation__branch-label';
    branchLabel.textContent = stage.label || '';

    copy.appendChild(branchTitle);
    copy.appendChild(branchLabel);

    const icon = document.createElement('span');
    icon.className = 'unified-navigation__branch-icon';
    icon.setAttribute('aria-hidden', 'true');

    trigger.appendChild(token);
    trigger.appendChild(copy);
    trigger.appendChild(icon);

    const panel = document.createElement('div');
    panel.className = 'unified-navigation__branch-panel';
    panel.id = panelId;
    panel.hidden = true;

    const panelInner = document.createElement('div');
    panelInner.className = 'unified-navigation__branch-panel-inner';

    const panelFrame = document.createElement('div');
    panelFrame.className = 'unified-navigation__branch-panel-frame';

    const summary = document.createElement('div');
    summary.className = 'unified-navigation__branch-summary';

    const summaryTitle = document.createElement('h4');
    summaryTitle.className = 'unified-navigation__branch-summary-title';
    summaryTitle.textContent = stage.branchTitle || stage.title || '';

    const summaryText = document.createElement('p');
    summaryText.className = 'unified-navigation__branch-summary-text';
    summaryText.textContent = stage.branchText || stage.description || '';

    const steps = document.createElement('div');
    steps.className = 'unified-navigation__steps';

    (Array.isArray(stage.steps) ? stage.steps : []).forEach((step) => {
      steps.appendChild(createStepCard(step));
    });

    summary.appendChild(summaryTitle);
    summary.appendChild(summaryText);
    panelFrame.appendChild(summary);
    panelFrame.appendChild(steps);
    panelInner.appendChild(panelFrame);
    panel.appendChild(panelInner);

    cluster.appendChild(trigger);
    cluster.appendChild(panel);

    bindTrigger(trigger, cluster);

    item.appendChild(stageNode);
    item.appendChild(cluster);

    return item;
  }

  function render(data) {
    const stages = Array.isArray(data.stages) ? data.stages : [];
    const lastStage = stages[stages.length - 1] || null;

    eyebrowNode.textContent = data.activeStageLabel || '';
    titleNode.textContent = data.title || '';
    subtitleNode.textContent = data.subtitle || '';
    transitionNode.textContent = lastStage ? lastStage.description || lastStage.branchText || '' : '';

    stagesNode.innerHTML = '';
    stages.forEach((stage, index) => {
      stagesNode.appendChild(createStageItem(stage, index));
    });
  }

  async function init() {
    try {
      const response = await fetch(JSON_PATH, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.status}`);
      }

      const data = await response.json();
      render(data);
    } catch (error) {
      console.error('[unified-navigation] render failed', error);
      eyebrowNode.textContent = '';
      titleNode.textContent = 'Маршрут проекта временно недоступен';
      subtitleNode.textContent = 'Не удалось загрузить данные для интерактивной схемы.';
      transitionNode.textContent = '';
      stagesNode.innerHTML = '';
    }
  }

  init();
})();
