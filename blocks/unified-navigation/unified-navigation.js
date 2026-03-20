(function () {
  const root = document.querySelector('.unified-navigation');

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
      children: [
  'эскиз',
  {
    label: 'подтверждение',
    tooltipCorner: 'bottom-left',
    tooltipOrbitAngle: 225,
    tooltipDistance: 6
  },
  {
    label: 'КП',
    tooltipCorner: 'bottom-left',
    tooltipOrbitAngle: 225,
    tooltipDistance: 6
  }
]
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


  const TOOLTIP_CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const MANUAL_TOOLTIP_RADIUS = 16;

  function normalizeChildConfig(child) {
    if (typeof child === 'string') {
      return { label: child };
    }

    if (!child || typeof child !== 'object') {
      return { label: '' };
    }

    const normalized = {
      label: typeof child.label === 'string' ? child.label : ''
    };

    if (TOOLTIP_CORNERS.indexOf(child.tooltipCorner) !== -1 && Number.isFinite(child.tooltipOrbitAngle)) {
      normalized.tooltipCorner = child.tooltipCorner;
      normalized.tooltipOrbitAngle = child.tooltipOrbitAngle;
    }

    if (Number.isFinite(child.tooltipDistance)) {
      normalized.tooltipDistance = child.tooltipDistance;
    }

    return normalized;
  }

  function getManualTooltipCornerOffset(corner, tooltipWidth, tooltipHeight) {
    const tooltipRadius = Math.min(MANUAL_TOOLTIP_RADIUS, tooltipWidth / 2, tooltipHeight / 2);
    const cornerInset = tooltipRadius * (1 - Math.SQRT1_2);

    if (corner === 'top-right') {
      return { x: tooltipWidth - cornerInset, y: cornerInset };
    }

    if (corner === 'bottom-left') {
      return { x: cornerInset, y: tooltipHeight - cornerInset };
    }

    if (corner === 'bottom-right') {
      return { x: tooltipWidth - cornerInset, y: tooltipHeight - cornerInset };
    }

    return { x: cornerInset, y: cornerInset };
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
    const cornerOffset = getManualTooltipCornerOffset(tooltipCorner, tooltipWidth, tooltipHeight);

    return {
      corner: tooltipCorner,
      left: anchorX - cornerOffset.x,
      top: anchorY - cornerOffset.y
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
    overlayTooltip.style.removeProperty('--tooltip-tail-offset');
  }

  function getPlacementCoordinates(anchorX, anchorY, tooltipWidth, tooltipHeight, placement, gap) {
    const horizontalCenter = anchorX - tooltipWidth / 2;
    const verticalCenter = anchorY - tooltipHeight / 2;

    if (placement === 'left') {
      return {
        left: anchorX - gap,
        top: verticalCenter
      };
    }

    if (placement === 'top') {
      return {
        left: horizontalCenter,
        top: anchorY - gap
      };
    }

    if (placement === 'bottom') {
      return {
        left: horizontalCenter,
        top: anchorY + gap
      };
    }

    if (placement === 'top-right') {
      return {
        left: anchorX + gap,
        top: anchorY - gap
      };
    }

    if (placement === 'top-left') {
      return {
        left: anchorX - gap,
        top: anchorY - gap
      };
    }

    if (placement === 'bottom-left') {
      return {
        left: anchorX - gap,
        top: anchorY + gap
      };
    }

    if (placement === 'bottom-right') {
      return {
        left: anchorX + gap,
        top: anchorY + gap
      };
    }

    return {
      left: anchorX + gap,
      top: verticalCenter
    };
  }

  function getPlacementBounds(coords, tooltipWidth, tooltipHeight, placement) {
    let left = coords.left;
    let top = coords.top;

    if (placement === 'left' || placement === 'top-left' || placement === 'bottom-left') {
      left -= tooltipWidth;
    } else if (placement === 'top' || placement === 'bottom') {
      left -= tooltipWidth / 2;
    }

    if (placement === 'top-right' || placement === 'top-left' || placement === 'top') {
      top -= tooltipHeight;
    }

    return {
      left: left,
      top: top,
      right: left + tooltipWidth,
      bottom: top + tooltipHeight
    };
  }

  function getPreferredPlacements(anchorX, anchorY, layerRect) {
    const leftHalf = anchorX < layerRect.width / 2;
    const nearTop = anchorY < layerRect.height * 0.22;
    const nearBottom = anchorY > layerRect.height * 0.78;
    const nearCenterX = Math.abs(anchorX - layerRect.width / 2) < layerRect.width * 0.12;

    if (nearTop) {
      return leftHalf ? ['bottom-right', 'bottom', 'right', 'bottom-left', 'left', 'top-right', 'top-left'] : ['bottom-left', 'bottom', 'left', 'bottom-right', 'right', 'top-left', 'top-right'];
    }

    if (nearBottom) {
      return leftHalf ? ['top-right', 'top', 'right', 'top-left', 'left', 'bottom-right', 'bottom-left'] : ['top-left', 'top', 'left', 'top-right', 'right', 'bottom-left', 'bottom-right'];
    }

    if (nearCenterX) {
      return ['top', 'bottom', leftHalf ? 'right' : 'left', leftHalf ? 'top-right' : 'top-left', leftHalf ? 'bottom-right' : 'bottom-left', leftHalf ? 'left' : 'right'];
    }

    return leftHalf ? ['right', 'bottom-right', 'top-right', 'bottom', 'top', 'left', 'bottom-left', 'top-left'] : ['left', 'bottom-left', 'top-left', 'bottom', 'top', 'right', 'bottom-right', 'top-right'];
  }

  function getTailOffset(placement, bounds, anchorX, anchorY) {
    const tailPadding = 18;

    if (placement === 'left' || placement === 'right') {
      const offset = anchorY - bounds.top;
      return Math.max(tailPadding, Math.min(bounds.bottom - bounds.top - tailPadding, offset)) + 'px';
    }

    const offset = anchorX - bounds.left;
    return Math.max(tailPadding, Math.min(bounds.right - bounds.left - tailPadding, offset)) + 'px';
  }

  function positionOverlayTooltip() {
    if (!activeTooltipTrigger || !tooltipLayer.contains(overlayTooltip) || overlayTooltip.hidden) {
      return;
    }

    const childRect = activeTooltipTrigger.getBoundingClientRect();
    const sceneRect = diagram.getBoundingClientRect();
    const anchorX = childRect.left - sceneRect.left + childRect.width / 2;
    const anchorY = childRect.top - sceneRect.top + childRect.height / 2;
    const gap = Math.max(12, Math.min(20, Math.round(Math.max(childRect.width, childRect.height) * 0.28)));
    const tooltipWidth = overlayTooltip.offsetWidth;
    const tooltipHeight = overlayTooltip.offsetHeight;
    const manualBounds = getManualTooltipBounds(activeTooltipTrigger, tooltipWidth, tooltipHeight);

    if (manualBounds) {
      overlayTooltip.className = 'unified-navigation__tooltip unified-navigation__tooltip--manual unified-navigation__tooltip--corner-' + manualBounds.corner + ' is-visible';
      overlayTooltip.style.left = manualBounds.left + 'px';
      overlayTooltip.style.top = manualBounds.top + 'px';
      overlayTooltip.style.removeProperty('--tooltip-tail-offset');
      return;
    }

    const padding = 8;
    const placements = getPreferredPlacements(anchorX, anchorY, sceneRect);
    let selectedPlacement = placements[0];
    let selectedCoords = getPlacementCoordinates(anchorX, anchorY, tooltipWidth, tooltipHeight, selectedPlacement, gap);
    let bestOverflow = Number.POSITIVE_INFINITY;

    placements.forEach(function (placement) {
      const coords = getPlacementCoordinates(anchorX, anchorY, tooltipWidth, tooltipHeight, placement, gap);
      const bounds = getPlacementBounds(coords, tooltipWidth, tooltipHeight, placement);
      const overflow =
        Math.max(0, padding - bounds.left) +
        Math.max(0, padding - bounds.top) +
        Math.max(0, bounds.right - (sceneRect.width - padding)) +
        Math.max(0, bounds.bottom - (sceneRect.height - padding));

      if (overflow < bestOverflow) {
        bestOverflow = overflow;
        selectedPlacement = placement;
        selectedCoords = coords;
      }
    });

    const bounds = getPlacementBounds(selectedCoords, tooltipWidth, tooltipHeight, selectedPlacement);
    const shiftX = bounds.left < padding ? padding - bounds.left : bounds.right > sceneRect.width - padding ? sceneRect.width - padding - bounds.right : 0;
    const shiftY = bounds.top < padding ? padding - bounds.top : bounds.bottom > sceneRect.height - padding ? sceneRect.height - padding - bounds.bottom : 0;

    const shiftedBounds = {
      left: bounds.left + shiftX,
      top: bounds.top + shiftY,
      right: bounds.right + shiftX,
      bottom: bounds.bottom + shiftY
    };

    overlayTooltip.className = 'unified-navigation__tooltip unified-navigation__tooltip--' + selectedPlacement + ' is-visible';
    overlayTooltip.style.left = selectedCoords.left + shiftX + 'px';
    overlayTooltip.style.top = selectedCoords.top + shiftY + 'px';
    overlayTooltip.style.setProperty('--tooltip-tail-offset', getTailOffset(selectedPlacement, shiftedBounds, anchorX, anchorY));
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
