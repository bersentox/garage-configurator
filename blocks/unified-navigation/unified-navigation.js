(function () {
  const root = document.querySelector('.unified-navigation');

  if (!root) {
    return;
  }

  const nodesLayer = root.querySelector('[data-unified-navigation-nodes]');
  const edgesLayer = root.querySelector('.unified-navigation__edges');

  const stages = [
    {
      number: '01',
      title: 'Контакт',
      size: 112,
      position: { desktop: { x: 10, y: 32 }, mobile: { x: 18, y: 18 } },
      children: ['звонок', 'консультация', 'даты']
    },
    {
      number: '02',
      title: 'Визит',
      size: 118,
      position: { desktop: { x: 38, y: 14 }, mobile: { x: 56, y: 10 } },
      children: ['замер', 'предложения', 'уточнения']
    },
    {
      number: '03',
      title: 'Задание\nи КП',
      size: 124,
      position: { desktop: { x: 47, y: 29 }, mobile: { x: 56, y: 28 } },
      children: ['эскиз', 'подтверждение', 'КП']
    },
    {
      number: '04',
      title: 'Проектирование',
      size: 116,
      position: { desktop: { x: 36, y: 49 }, mobile: { x: 26, y: 45 } },
      children: ['проект', 'правки', 'принятие']
    },
    {
      number: '05',
      title: 'Договор',
      size: 118,
      position: { desktop: { x: 57, y: 49 }, mobile: { x: 62, y: 48 } },
      children: ['выезд', 'подписание', 'цена']
    },
    {
      number: '06',
      title: 'Реализация',
      size: 118,
      position: { desktop: { x: 70, y: 66 }, mobile: { x: 42, y: 71 } },
      children: ['стройка', 'контроль', 'уборка', 'приёмка']
    },
    {
      number: '07',
      title: 'Сдача',
      size: 104,
      position: { desktop: { x: 76, y: 86 }, mobile: { x: 72, y: 88 } },
      children: ['приёмка', 'документы', 'оплата']
    }
  ];

  const connections = [
    ['01', '02'],
    ['02', '03'],
    ['03', '04'],
    ['03', '05'],
    ['05', '06'],
    ['06', '07']
  ];

  let activeStageNumber = null;

  function isMobileLayout() {
    return window.matchMedia('(max-width: 1080px)').matches;
  }

  function getPosition(stage) {
    return isMobileLayout() ? stage.position.mobile : stage.position.desktop;
  }

  function getChildVectors(count) {
    if (count === 4) {
      return [
        { x: 0, y: -92 },
        { x: 92, y: 0 },
        { x: 0, y: 92 },
        { x: -92, y: 0 }
      ];
    }

    return [
      { x: 0, y: -88 },
      { x: 88, y: 0 },
      { x: 0, y: 88 }
    ];
  }

  function renderEdges() {
    edgesLayer.innerHTML = '';

    connections.forEach(function (connection) {
      const from = stages.find(function (stage) {
        return stage.number === connection[0];
      });
      const to = stages.find(function (stage) {
        return stage.number === connection[1];
      });

      if (!from || !to) {
        return;
      }

      const fromPoint = getPosition(from);
      const toPoint = getPosition(to);
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

  function createChild(label, index, total) {
    const child = document.createElement('div');
    const vectors = getChildVectors(total);
    const vector = vectors[index] || { x: 0, y: 0 };

    child.className = 'unified-navigation__child';
    child.textContent = label;
    child.style.setProperty('--child-x', vector.x + 'px');
    child.style.setProperty('--child-y', vector.y + 'px');
    child.style.transitionDelay = index * 80 + 'ms';

    return child;
  }

  function setActiveStage(nextStageNumber) {
    activeStageNumber = activeStageNumber === nextStageNumber ? null : nextStageNumber;

    nodesLayer.querySelectorAll('.unified-navigation__node').forEach(function (node) {
      const isActive = node.dataset.stageNumber === activeStageNumber;
      const button = node.querySelector('.unified-navigation__stage-button');
      node.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', String(isActive));
    });
  }

  function createStage(stage) {
    const node = document.createElement('article');
    const position = getPosition(stage);

    node.className = 'unified-navigation__node';
    node.dataset.stageNumber = stage.number;
    node.style.setProperty('--node-size', stage.size + 'px');
    node.style.setProperty('--node-x', position.x);
    node.style.setProperty('--node-y', position.y);
    node.style.setProperty('--node-x-mobile', stage.position.mobile.x);
    node.style.setProperty('--node-y-mobile', stage.position.mobile.y);

    const button = document.createElement('button');
    button.className = 'unified-navigation__stage-button';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Этап ' + stage.number + ': ' + stage.title.replace(/\n/g, ' '));

    const core = document.createElement('span');
    core.className = 'unified-navigation__stage-core';

    const number = document.createElement('span');
    number.className = 'unified-navigation__stage-number';
    number.textContent = stage.number;

    const label = document.createElement('span');
    label.className = 'unified-navigation__stage-label';
    label.innerHTML = stage.title.replace(/\n/g, '<br />');

    const children = document.createElement('div');
    children.className = 'unified-navigation__children';
    children.setAttribute('aria-hidden', 'true');

    stage.children.forEach(function (childLabel, index) {
      children.appendChild(createChild(childLabel, index, stage.children.length));
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

    button.addEventListener('click', function () {
      setActiveStage(stage.number);
    });

    return node;
  }

  function render() {
    nodesLayer.innerHTML = '';
    stages.forEach(function (stage) {
      nodesLayer.appendChild(createStage(stage));
    });
    renderEdges();
    setActiveStage(activeStageNumber);
  }

  window.addEventListener('resize', render);

  render();
})();
