(function () {
  const root = document.querySelector('.unified-navigation');

  if (!root) {
    return;
  }

  const diagram = root.querySelector('[data-unified-navigation-diagram]');
  const nodesLayer = root.querySelector('[data-unified-navigation-nodes]');
  const edgesLayer = root.querySelector('.unified-navigation__edges');

  const SCENE_LAYOUT = {
    desktop: {
      contact: { x: 14, y: 28 },
      visit: { x: 39, y: 16 },
      brief: { x: 49, y: 26 },
      design: { x: 37, y: 43 },
      contract: { x: 61, y: 43 },
      build: { x: 73, y: 59 },
      delivery: { x: 79, y: 77 }
    },
    tablet: {
      contact: { x: 16, y: 24 },
      visit: { x: 39, y: 16 },
      brief: { x: 52, y: 25 },
      design: { x: 33, y: 43 },
      contract: { x: 61, y: 43 },
      build: { x: 68, y: 61 },
      delivery: { x: 72, y: 79 }
    },
    mobile: {
      contact: { x: 20, y: 16 },
      visit: { x: 57, y: 11 },
      brief: { x: 57, y: 24 },
      design: { x: 28, y: 39 },
      contract: { x: 64, y: 42 },
      build: { x: 44, y: 63 },
      delivery: { x: 71, y: 82 }
    }
  };

  const CLUSTER_TEMPLATES = {
    right3: [
      { x: 74, y: -62 },
      { x: 112, y: 0 },
      { x: 80, y: 68 }
    ],
    left3: [
      { x: -74, y: -62 },
      { x: -112, y: 0 },
      { x: -80, y: 68 }
    ],
    cross4: [
      { x: 0, y: -106 },
      { x: 106, y: 0 },
      { x: 0, y: 106 },
      { x: -106, y: 0 }
    ]
  };

  const TOOLTIP_COPY = {
    contact: {
      звонок: 'Первичный вход в проект',
      консультация: 'Обсуждаем задачу и формат',
      даты: 'Согласуем дату выезда'
    },
    visit: {
      замер: 'Фиксируем реальные размеры',
      предложения: 'Предлагаем варианты решения',
      уточнения: 'Снимаем оставшиеся вопросы'
    },
    brief: {
      эскиз: 'Собираем первичную схему',
      подтверждение: 'Подтверждаем следующий шаг',
      КП: 'Формируем коммерческое предложение'
    },
    design: {
      проект: 'Разрабатываем проект',
      правки: 'Вносим согласованные изменения',
      принятие: 'Фиксируем итоговый вариант'
    },
    contract: {
      выезд: 'Организуем встречу на подписание',
      подписание: 'Фиксируем обязательства сторон',
      цена: 'Закрепляем стоимость авансом'
    },
    build: {
      стройка: 'Запуск строительных работ',
      контроль: 'Контроль хода исполнения',
      уборка: 'Приводим объект в порядок',
      приёмка: 'Внутренняя приёмка прорабом'
    },
    delivery: {
      приёмка: 'Приёмка со стороны заказчика',
      документы: 'Подписываем закрывающие документы',
      оплата: 'Закрываем итоговый расчёт'
    }
  };

  const stages = [
    {
      key: 'contact',
      number: '01',
      title: 'Контакт',
      cluster: 'left3',
      children: ['звонок', 'консультация', 'даты']
    },
    {
      key: 'visit',
      number: '02',
      title: 'Визит',
      cluster: 'left3',
      children: ['замер', 'предложения', 'уточнения']
    },
    {
      key: 'brief',
      number: '03',
      title: 'Задание\nи КП',
      cluster: 'right3',
      children: ['эскиз', 'подтверждение', 'КП']
    },
    {
      key: 'design',
      number: '04',
      title: 'Проектирование',
      cluster: 'left3',
      children: ['проект', 'правки', 'принятие']
    },
    {
      key: 'contract',
      number: '05',
      title: 'Договор',
      cluster: 'right3',
      children: ['выезд', 'подписание', 'цена']
    },
    {
      key: 'build',
      number: '06',
      title: 'Реализация',
      cluster: 'cross4',
      children: ['стройка', 'контроль', 'уборка', 'приёмка']
    },
    {
      key: 'delivery',
      number: '07',
      title: 'Сдача',
      cluster: 'right3',
      children: ['приёмка', 'документы', 'оплата']
    }
  ];

  const connections = [
    ['contact', 'visit'],
    ['visit', 'brief'],
    ['brief', 'design'],
    ['brief', 'contract'],
    ['contract', 'build'],
    ['build', 'delivery']
  ];

  let activeStageKey = null;
  let activeTooltipKey = null;

  function getViewport() {
    if (window.matchMedia('(max-width: 720px)').matches) {
      return 'mobile';
    }
    if (window.matchMedia('(max-width: 1080px)').matches) {
      return 'tablet';
    }
    return 'desktop';
  }

  function getPosition(stage) {
    return SCENE_LAYOUT[getViewport()][stage.key];
  }

  function getClusterVectors(stage) {
    const viewport = getViewport();
    const scale = viewport === 'mobile' ? 0.62 : viewport === 'tablet' ? 0.82 : 1;

    return CLUSTER_TEMPLATES[stage.cluster].map(function (vector) {
      return {
        x: Math.round(vector.x * scale),
        y: Math.round(vector.y * scale)
      };
    });
  }

  function getTooltipPlacement(vector) {
    if (Math.abs(vector.y) > Math.abs(vector.x) && vector.y < 0) {
      return 'top';
    }
    if (Math.abs(vector.y) > Math.abs(vector.x) && vector.y > 0) {
      return 'bottom';
    }
    return vector.x < 0 ? 'left' : 'right';
  }

  function renderEdges() {
    edgesLayer.innerHTML = '';

    connections.forEach(function (connection) {
      const fromStage = stages.find(function (stage) {
        return stage.key === connection[0];
      });
      const toStage = stages.find(function (stage) {
        return stage.key === connection[1];
      });

      if (!fromStage || !toStage) {
        return;
      }

      const fromPoint = getPosition(fromStage);
      const toPoint = getPosition(toStage);
      const dx = toPoint.x - fromPoint.x;
      const dy = toPoint.y - fromPoint.y;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const edge = document.createElement('div');

      edge.className = 'unified-navigation__edge';
      edge.style.left = fromPoint.x + '%';
      edge.style.top = fromPoint.y + '%';
      edge.style.width = length + '%';
      edge.style.transform = 'rotate(' + angle + 'deg)';

      edgesLayer.appendChild(edge);
    });
  }

  function syncState() {
    nodesLayer.querySelectorAll('.unified-navigation__node').forEach(function (node) {
      const isStageActive = node.dataset.stageKey === activeStageKey;
      const button = node.querySelector('.unified-navigation__stage-button');

      node.classList.toggle('is-active', isStageActive);
      button.setAttribute('aria-expanded', String(isStageActive));

      node.querySelectorAll('.unified-navigation__child').forEach(function (child) {
        const isTooltipOpen = isStageActive && child.dataset.tooltipKey === activeTooltipKey;
        const bubble = child.querySelector('.unified-navigation__tooltip');

        child.classList.toggle('is-tooltip-open', isTooltipOpen);
        child.setAttribute('aria-expanded', String(isTooltipOpen));
        child.setAttribute('aria-pressed', String(isTooltipOpen));
        if (bubble) {
          bubble.hidden = !isTooltipOpen;
          bubble.setAttribute('aria-hidden', String(!isTooltipOpen));
        }
      });
    });
  }

  function closeTooltip() {
    if (!activeTooltipKey) {
      return;
    }

    activeTooltipKey = null;
    syncState();
  }

  function setActiveStage(nextStageKey) {
    const nextValue = activeStageKey === nextStageKey ? null : nextStageKey;

    if (activeStageKey !== nextValue) {
      activeTooltipKey = null;
    }

    activeStageKey = nextValue;
    syncState();
  }

  function toggleTooltip(stageKey, childLabel) {
    const tooltipKey = stageKey + ':' + childLabel;
    activeTooltipKey = activeTooltipKey === tooltipKey ? null : tooltipKey;
    syncState();
  }

  function createChild(stage, label, index) {
    const child = document.createElement('button');
    const vectors = getClusterVectors(stage);
    const vector = vectors[index] || { x: 0, y: 0 };
    const placement = getTooltipPlacement(vector);
    const tooltip = document.createElement('span');

    child.className = 'unified-navigation__child';
    child.type = 'button';
    child.textContent = label;
    child.dataset.tooltipKey = stage.key + ':' + label;
    child.dataset.tooltipPlacement = placement;
    child.style.setProperty('--child-x', vector.x + 'px');
    child.style.setProperty('--child-y', vector.y + 'px');
    child.style.transitionDelay = index * 70 + 'ms';
    child.setAttribute('aria-expanded', 'false');
    child.setAttribute('aria-pressed', 'false');
    child.setAttribute('aria-label', label + '. ' + TOOLTIP_COPY[stage.key][label]);

    tooltip.className = 'unified-navigation__tooltip unified-navigation__tooltip--' + placement;
    tooltip.textContent = TOOLTIP_COPY[stage.key][label];
    tooltip.hidden = true;
    tooltip.setAttribute('aria-hidden', 'true');

    child.appendChild(tooltip);

    child.addEventListener('pointerdown', function () {
      child.classList.add('is-pressed');
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (eventName) {
      child.addEventListener(eventName, function () {
        child.classList.remove('is-pressed');
      });
    });

    child.addEventListener('click', function (event) {
      event.stopPropagation();
      if (activeStageKey !== stage.key) {
        return;
      }
      toggleTooltip(stage.key, label);
    });

    return child;
  }

  function createStage(stage) {
    const node = document.createElement('article');
    const position = getPosition(stage);
    const button = document.createElement('button');
    const core = document.createElement('span');
    const number = document.createElement('span');
    const label = document.createElement('span');
    const children = document.createElement('div');

    node.className = 'unified-navigation__node';
    node.dataset.stageKey = stage.key;
    node.style.setProperty('--node-x', position.x);
    node.style.setProperty('--node-y', position.y);

    button.className = 'unified-navigation__stage-button';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Этап ' + stage.number + ': ' + stage.title.replace(/\n/g, ' '));

    core.className = 'unified-navigation__stage-core';
    number.className = 'unified-navigation__stage-number';
    number.textContent = stage.number;
    label.className = 'unified-navigation__stage-label';
    label.innerHTML = stage.title.replace(/\n/g, '<br />');

    children.className = 'unified-navigation__children';
    children.setAttribute('aria-hidden', 'true');

    stage.children.forEach(function (childLabel, index) {
      children.appendChild(createChild(stage, childLabel, index));
    });

    core.appendChild(number);
    core.appendChild(label);
    button.appendChild(core);
    node.appendChild(button);
    node.appendChild(children);

    button.addEventListener('pointerdown', function () {
      button.classList.add('is-pressed');
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (eventName) {
      button.addEventListener(eventName, function () {
        button.classList.remove('is-pressed');
      });
    });

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      setActiveStage(stage.key);
    });

    return node;
  }

  function render() {
    const previousStageKey = activeStageKey;
    const previousTooltipKey = activeTooltipKey;

    nodesLayer.innerHTML = '';
    stages.forEach(function (stage) {
      nodesLayer.appendChild(createStage(stage));
    });

    renderEdges();

    activeStageKey = previousStageKey;
    activeTooltipKey = previousTooltipKey;
    syncState();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('.unified-navigation__child') || event.target.closest('.unified-navigation__tooltip')) {
      return;
    }

    closeTooltip();
  });

  window.addEventListener('resize', render);

  render();
})();
