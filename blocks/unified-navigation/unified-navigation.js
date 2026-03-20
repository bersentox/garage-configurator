(function () {
  const APP_ID = 'unified-navigation-app';
  const MOUNT_FLAG = 'unifiedNavigationMounted';
  const TEMPLATE = `
    <section class="unified-navigation" aria-labelledby="unified-navigation-title">
      <div class="unified-navigation__shell">
        <header class="unified-navigation__intro">
          <p class="unified-navigation__eyebrow">DIGITAL PROCESS MAP</p>
          <h2 id="unified-navigation-title" class="unified-navigation__title">
            Весь путь проекта —<br />от контакта до сдачи
          </h2>
          <p class="unified-navigation__subtitle">
            Схема этапов с радиальным раскрытием. Нажмите на кружок для подробностей.
          </p>
        </header>
        <div class="unified-navigation__diagram" data-unified-navigation-diagram>
          <div class="unified-navigation__grid" aria-hidden="true"></div>
          <div class="unified-navigation__edges" aria-hidden="true"></div>
          <div class="unified-navigation__nodes" data-unified-navigation-nodes></div>
          <div class="unified-navigation__tooltip-layer" data-unified-navigation-tooltip-layer aria-hidden="true"></div>
        </div>
        <p class="unified-navigation__bottom">
          Оставьте номер ниже и запустите первый этап.
        </p>
      </div>
    </section>
  `;
  const appRoot = document.getElementById(APP_ID);

  if (!appRoot) {
    return;
  }

  if (!appRoot.querySelector('.unified-navigation')) {
    appRoot.innerHTML = TEMPLATE;
  }

  if (appRoot.dataset[MOUNT_FLAG] === 'true') {
    return;
  }

  appRoot.dataset[MOUNT_FLAG] = 'true';

  const root = appRoot.querySelector('.unified-navigation');

  if (!root) {
    return;
  }

  const diagram = root.querySelector('[data-unified-navigation-diagram]');
  const nodesLayer = root.querySelector('[data-unified-navigation-nodes]');
  const edgesLayer = root.querySelector('.unified-navigation__edges');
  const tooltipLayer = root.querySelector('[data-unified-navigation-tooltip-layer]');

  const SCENE_LAYOUT = {
    desktop: {
      contact: { x: 14, y: 28 },
      visit: { x: 32, y: 16 },
      brief: { x: 49, y: 26 },
      design: { x: 37, y: 43 },
      contract: { x: 61, y: 43 },
      build: { x: 73, y: 59 },
      delivery: { x: 79, y: 77 }
    },
    tablet: {
      contact: { x: 16, y: 24 },
      visit: { x: 32, y: 16 },
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
      звонок: 'Отвечаем за несколько минут',
      консультация: 'Уточняем задачу, формат и детали',
      даты: 'Согласуем дату визита менеджера и замерщика'
    },
    visit: {
      замер: 'Фиксируем размеры объекта и высоты',
      предложения: 'Предлагаем варианты решения',
      уточнения: 'Снимаем спорные вопросы'
    },
    brief: {
      эскиз: 'Собираем базовую схему',
      подтверждение: 'Подтверждаем следующий шаг',
      КП: 'Готовим коммерческое предложение'
    },
    design: {
      проект: 'Разрабатываем рабочую схему',
      правки: 'Вносим согласованные изменения',
      принятие: 'Фиксируем итоговый вариант'
    },
    contract: {
      выезд: 'Организуем подписание',
      подписание: 'Закрепляем условия сторон',
      цена: 'Фиксируем стоимость авансом'
    },
    build: {
      стройка: 'Запускаем строительные работы',
      контроль: 'Контролируем ход исполнения',
      уборка: 'Приводим объект в порядок, вывозим мусор',
      приёмка: 'Проводим внутреннюю приёмку прорабом'
    },
    delivery: {
      приёмка: 'Заказчик принимает объект',
      документы: 'Подписываем документы',
      оплата: 'Закрываем окончательный расчёт'
    }
  };

  const stages = [
    {
      key: 'contact',
      number: '01',
      title: 'Контакт',
      cluster: 'left3',
      children: [
        {
          label: 'звонок',
          tooltipCorner: 'bottom-right',
          tooltipOrbitAngle: 225,
          tooltipDistance: 10
        },
        {
          label: 'консультация',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 180,
          tooltipDistance: 10
        },
        {
          label: 'даты',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 140,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'visit',
      number: '02',
      title: 'Визит',
      cluster: 'left3',
      children: [
        {
          label: 'замер',
          tooltipCorner: 'bottom-right',
          tooltipOrbitAngle: 225,
          tooltipDistance: 10
        },
        {
          label: 'предложения',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 180,
          tooltipDistance: 10
        },
        {
          label: 'уточнения',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 140,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'brief',
      number: '03',
      title: 'Задание\nи КП',
      cluster: 'right3',
      children: [
        {
          label: 'эскиз',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 315,
          tooltipDistance: 10
        },
        {
          label: 'подтверждение',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 315,
          tooltipDistance: 10
        },
        {
          label: 'КП',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 320,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'design',
      number: '04',
      title: 'Проектирование',
      cluster: 'left3',
      children: [
        {
          label: 'проект',
          tooltipCorner: 'bottom-right',
          tooltipOrbitAngle: 225,
          tooltipDistance: 10
        },
        {
          label: 'правки',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 180,
          tooltipDistance: 10
        },
        {
          label: 'принятие',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 140,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'contract',
      number: '05',
      title: 'Договор',
      cluster: 'right3',
      children: [
        {
          label: 'выезд',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 315,
          tooltipDistance: 10
        },
        {
          label: 'подписание',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 0,
          tooltipDistance: 10
        },
        {
          label: 'цена',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 40,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'build',
      number: '06',
      title: 'Реализация',
      cluster: 'cross4',
      children: [
        {
          label: 'стройка',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 300,
          tooltipDistance: 10
        },
        {
          label: 'контроль',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 0,
          tooltipDistance: 10
        },
        {
          label: 'уборка',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 60,
          tooltipDistance: 10
        },
        {
          label: 'приёмка',
          tooltipCorner: 'top-right',
          tooltipOrbitAngle: 180,
          tooltipDistance: 10
        }
      ]
    },
    {
      key: 'delivery',
      number: '07',
      title: 'Сдача',
      cluster: 'right3',
      children: [
        {
          label: 'приёмка',
          tooltipCorner: 'bottom-left',
          tooltipOrbitAngle: 315,
          tooltipDistance: 10
        },
        {
          label: 'документы',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 0,
          tooltipDistance: 10
        },
        {
          label: 'оплата',
          tooltipCorner: 'top-left',
          tooltipOrbitAngle: 40,
          tooltipDistance: 10
        }
      ]
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


  const TOOLTIP_CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const TOOLTIP_PADDING = 8;

  function normalizeChildConfig(child) {
    if (!child || typeof child !== 'object') {
      return {
        label: '',
        tooltipCorner: 'top-left',
        tooltipOrbitAngle: 0,
        tooltipDistance: 10
      };
    }

    return {
      label: typeof child.label === 'string' ? child.label : '',
      tooltipCorner: TOOLTIP_CORNERS.indexOf(child.tooltipCorner) !== -1 ? child.tooltipCorner : 'top-left',
      tooltipOrbitAngle: Number.isFinite(child.tooltipOrbitAngle) ? child.tooltipOrbitAngle : 0,
      tooltipDistance: 10
    };
  }

  function getManualTooltipAnchorOffset(corner, tooltipWidth, tooltipHeight) {
    if (corner === 'top-right') {
      return { x: tooltipWidth, y: 0 };
    }

    if (corner === 'bottom-left') {
      return { x: 0, y: tooltipHeight };
    }

    if (corner === 'bottom-right') {
      return { x: tooltipWidth, y: tooltipHeight };
    }

    return { x: 0, y: 0 };
  }

  function getManualTooltipBounds(trigger, tooltipWidth, tooltipHeight) {
    const tooltipCorner = trigger.dataset.tooltipCorner;
    const orbitAngle = Number(trigger.dataset.tooltipOrbitAngle);

    if (TOOLTIP_CORNERS.indexOf(tooltipCorner) === -1 || !Number.isFinite(orbitAngle)) {
      return null;
    }

    const childRect = trigger.getBoundingClientRect();
    const sceneRect = diagram.getBoundingClientRect();
    const childCenterX = childRect.left - sceneRect.left + childRect.width / 2;
    const childCenterY = childRect.top - sceneRect.top + childRect.height / 2;
    const childRadius = Math.max(childRect.width, childRect.height) / 2;
    const angleInRadians = orbitAngle * (Math.PI / 180);
    const directionX = Math.cos(angleInRadians);
    const directionY = Math.sin(angleInRadians);
    const tooltipDistance = Number(trigger.dataset.tooltipDistance) || 0;
    const anchorX = childCenterX + directionX * (childRadius + tooltipDistance);
    const anchorY = childCenterY + directionY * (childRadius + tooltipDistance);
    const cornerOffset = getManualTooltipAnchorOffset(tooltipCorner, tooltipWidth, tooltipHeight);

    const left = anchorX - cornerOffset.x;
    const top = anchorY - cornerOffset.y;

    return {
      left: left,
      top: top,
      right: left + tooltipWidth,
      bottom: top + tooltipHeight
    };
  }
  let activeStageKey = null;
  let activeTooltipKey = null;
  let activeTooltipTrigger = null;
  const overlayTooltip = document.createElement('div');
  const overlayTooltipContent = document.createElement('span');
  const overlayTooltipTail = document.createElement('span');

  overlayTooltip.className = 'unified-navigation__tooltip';
  overlayTooltip.hidden = true;
  overlayTooltip.setAttribute('aria-hidden', 'true');
  overlayTooltipContent.className = 'unified-navigation__tooltip-content';
  overlayTooltipTail.className = 'unified-navigation__tooltip-tail';
  overlayTooltipTail.setAttribute('aria-hidden', 'true');
  overlayTooltip.appendChild(overlayTooltipContent);
  overlayTooltip.appendChild(overlayTooltipTail);
  tooltipLayer.appendChild(overlayTooltip);

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


function renderEdges() {
  edgesLayer.innerHTML = '';

  const layerRect = edgesLayer.getBoundingClientRect();

  connections.forEach(function (connection) {
    const fromNode = nodesLayer.querySelector('[data-stage-key="' + connection[0] + '"]');
    const toNode = nodesLayer.querySelector('[data-stage-key="' + connection[1] + '"]');

    if (!fromNode || !toNode) {
      return;
    }

    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();

    const fromX = fromRect.left - layerRect.left + fromRect.width / 2;
    const fromY = fromRect.top - layerRect.top + fromRect.height / 2;
    const toX = toRect.left - layerRect.left + toRect.width / 2;
    const toY = toRect.top - layerRect.top + toRect.height / 2;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const edge = document.createElement('div');
    edge.className = 'unified-navigation__edge';
    edge.style.left = fromX + 'px';
    edge.style.top = fromY + 'px';
    edge.style.width = length + 'px';
    edge.style.transform = 'rotate(' + angle + 'deg)';

    edgesLayer.appendChild(edge);
  });
}

  function hideOverlayTooltip() {
    overlayTooltip.hidden = true;
    overlayTooltip.setAttribute('aria-hidden', 'true');
    overlayTooltip.className = 'unified-navigation__tooltip';
    overlayTooltipContent.textContent = '';
    overlayTooltip.style.left = '';
    overlayTooltip.style.top = '';
    overlayTooltip.style.removeProperty('--tooltip-tail-x');
    overlayTooltip.style.removeProperty('--tooltip-tail-y');
    delete overlayTooltip.dataset.tailSide;
  }

  function getTooltipTailGeometry(bounds, anchorX, anchorY) {
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    const deltaX = anchorX - centerX;
    const deltaY = anchorY - centerY;
    const halfWidth = (bounds.right - bounds.left) / 2;
    const halfHeight = (bounds.bottom - bounds.top) / 2;
    const safeDeltaX = Math.abs(deltaX) < 0.001 ? (deltaX < 0 ? -0.001 : 0.001) : deltaX;
    const safeDeltaY = Math.abs(deltaY) < 0.001 ? (deltaY < 0 ? -0.001 : 0.001) : deltaY;
    const scaleX = halfWidth / Math.abs(safeDeltaX);
    const scaleY = halfHeight / Math.abs(safeDeltaY);
    const intersectionScale = Math.min(scaleX, scaleY);
    const edgeX = centerX + deltaX * intersectionScale;
    const edgeY = centerY + deltaY * intersectionScale;
    const side = scaleX < scaleY ? (deltaX < 0 ? 'left' : 'right') : (deltaY < 0 ? 'top' : 'bottom');

    return {
      side: side,
      x: edgeX - bounds.left,
      y: edgeY - bounds.top
    };
  }

  function positionOverlayTooltip() {
    if (!activeTooltipTrigger || !tooltipLayer.contains(overlayTooltip) || overlayTooltip.hidden) {
      return;
    }

    const childRect = activeTooltipTrigger.getBoundingClientRect();
    const sceneRect = diagram.getBoundingClientRect();
    const anchorX = childRect.left - sceneRect.left + childRect.width / 2;
    const anchorY = childRect.top - sceneRect.top + childRect.height / 2;
    const tooltipWidth = overlayTooltip.offsetWidth;
    const tooltipHeight = overlayTooltip.offsetHeight;
    const manualBounds = getManualTooltipBounds(activeTooltipTrigger, tooltipWidth, tooltipHeight);

    if (!manualBounds) {
      hideOverlayTooltip();
      return;
    }

    const clampedLeft = Math.min(
      Math.max(manualBounds.left, TOOLTIP_PADDING),
      Math.max(TOOLTIP_PADDING, sceneRect.width - TOOLTIP_PADDING - tooltipWidth)
    );
    const clampedTop = Math.min(
      Math.max(manualBounds.top, TOOLTIP_PADDING),
      Math.max(TOOLTIP_PADDING, sceneRect.height - TOOLTIP_PADDING - tooltipHeight)
    );
    const tooltipBounds = {
      left: clampedLeft,
      top: clampedTop,
      right: clampedLeft + tooltipWidth,
      bottom: clampedTop + tooltipHeight
    };
    const tail = getTooltipTailGeometry(tooltipBounds, anchorX, anchorY);

    overlayTooltip.className = 'unified-navigation__tooltip is-visible';
    overlayTooltip.style.left = tooltipBounds.left + 'px';
    overlayTooltip.style.top = tooltipBounds.top + 'px';
    overlayTooltip.style.setProperty('--tooltip-tail-x', tail.x + 'px');
    overlayTooltip.style.setProperty('--tooltip-tail-y', tail.y + 'px');
    overlayTooltip.dataset.tailSide = tail.side;
  }

  function syncState() {
    nodesLayer.querySelectorAll('.unified-navigation__node').forEach(function (node) {
      const isStageActive = node.dataset.stageKey === activeStageKey;
      const button = node.querySelector('.unified-navigation__stage-button');

      node.classList.toggle('is-active', isStageActive);
      button.setAttribute('aria-expanded', String(isStageActive));

      node.querySelectorAll('.unified-navigation__child').forEach(function (child) {
        const isTooltipOpen = isStageActive && child.dataset.tooltipKey === activeTooltipKey;

        child.classList.toggle('is-tooltip-open', isTooltipOpen);
        child.setAttribute('aria-expanded', String(isTooltipOpen));
        child.setAttribute('aria-pressed', String(isTooltipOpen));
      });
    });

    if (!activeTooltipKey || !activeTooltipTrigger) {
      hideOverlayTooltip();
      return;
    }

    overlayTooltip.className = 'unified-navigation__tooltip';
    overlayTooltipContent.textContent = activeTooltipTrigger.dataset.tooltipText || '';
    overlayTooltip.hidden = false;
    overlayTooltip.setAttribute('aria-hidden', 'false');
    positionOverlayTooltip();
  }

  function closeTooltip() {
    if (!activeTooltipKey) {
      return;
    }

    activeTooltipKey = null;
    activeTooltipTrigger = null;
    syncState();
  }

  function setActiveStage(nextStageKey) {
    const nextValue = activeStageKey === nextStageKey ? null : nextStageKey;

    if (activeStageKey !== nextValue) {
      activeTooltipKey = null;
      activeTooltipTrigger = null;
    }

    activeStageKey = nextValue;
    syncState();
  }

  function toggleTooltip(trigger, stageKey, childLabel) {
    const tooltipKey = stageKey + ':' + childLabel;
    const isSameTooltip = activeTooltipKey === tooltipKey;

    activeTooltipKey = isSameTooltip ? null : tooltipKey;
    activeTooltipTrigger = isSameTooltip ? null : trigger;
    syncState();
  }

  function createChild(stage, childConfig, index) {
    const child = document.createElement('button');
    const normalizedChild = normalizeChildConfig(childConfig);
    const label = normalizedChild.label;
    const vectors = getClusterVectors(stage);
    const vector = vectors[index] || { x: 0, y: 0 };
    child.className = 'unified-navigation__child';
    child.type = 'button';
    child.textContent = label;
    child.dataset.tooltipKey = stage.key + ':' + label;
    child.dataset.tooltipText = TOOLTIP_COPY[stage.key][label];
    if (normalizedChild.tooltipCorner) {
      child.dataset.tooltipCorner = normalizedChild.tooltipCorner;
      child.dataset.tooltipOrbitAngle = String(normalizedChild.tooltipOrbitAngle);
    }
    if (Number.isFinite(normalizedChild.tooltipDistance)) {
      child.dataset.tooltipDistance = String(normalizedChild.tooltipDistance);
    }
    child.style.setProperty('--child-x', vector.x + 'px');
    child.style.setProperty('--child-y', vector.y + 'px');
    child.style.transitionDelay = index * 70 + 'ms';
    child.setAttribute('aria-expanded', 'false');
    child.setAttribute('aria-pressed', 'false');
    child.setAttribute('aria-label', label + '. ' + TOOLTIP_COPY[stage.key][label]);

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
      toggleTooltip(child, stage.key, label);
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

    if (previousTooltipKey) {
      activeTooltipTrigger = nodesLayer.querySelector('[data-tooltip-key="' + previousTooltipKey + '"]');
    }

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

  window.addEventListener('resize', function () {
    render();
    positionOverlayTooltip();
  });

  render();
})();
