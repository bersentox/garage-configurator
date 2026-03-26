(() => {
  const FALLBACK_DATA = {
  "title": "Весь путь проекта — от звонка до сдачи",
  "subtitle": "Каждый этап связан со следующим, проходит согласование и контроль перед переходом дальше.",
  "stages": [
    {
      "number": "01",
      "title": "Контакт",
      "steps": [
        {
          "number": "01",
          "title": "Приём обращения",
          "detailTitle": "01 Приём обращения",
          "detailText": "Фиксируем исходный запрос и точку входа, чтобы дальнейшие действия опирались на подтверждённый контакт."
        },
        {
          "number": "02",
          "title": "Уточнение задачи и адреса участка",
          "detailTitle": "02 Уточнение задачи и адреса участка",
          "detailText": "Собираем ключевые вводные по задаче, локации и ограничениям участка до перехода к выезду."
        },
        {
          "number": "03",
          "title": "Согласование времени контакта и выезда",
          "detailTitle": "03 Согласование времени контакта и выезда",
          "detailText": "Подтверждаем следующий шаг, чтобы замер стартовал в заранее согласованном окне без потери контекста."
        }
      ]
    },
    {
      "number": "02",
      "title": "Замер",
      "steps": [
        {
          "number": "01",
          "title": "Выезд на участок",
          "detailTitle": "01 Выезд на участок",
          "detailText": "Начинаем процесс с фактического осмотра площадки, чтобы перейти от предположений к измеряемым данным."
        },
        {
          "number": "02",
          "title": "Фиксация ограничений и подъезда",
          "detailTitle": "02 Фиксация ограничений и подъезда",
          "detailText": "Документируем рельеф, подъезд, зазоры и все условия, которые влияют на проект и монтаж."
        },
        {
          "number": "03",
          "title": "Передача данных в расчётный контур",
          "detailTitle": "03 Передача данных в расчётный контур",
          "detailText": "Передаём подтверждённые размеры и ограничения дальше, чтобы коммерческое предложение строилось на реальной базе."
        }
      ]
    },
    {
      "number": "03",
      "title": "Задание и КП",
      "steps": [
        {
          "number": "01",
          "title": "Формирование задания на проектирование",
          "detailTitle": "01 Формирование задания на проектирование",
          "detailText": "Собираем входные данные в подтверждённый пакет, чтобы следующий шаг опирался на зафиксированные вводные, а не на догадки."
        },
        {
          "number": "02",
          "title": "Коммерческое предложение",
          "detailTitle": "02 Коммерческое предложение",
          "detailText": "Переводим задачу в понятный расчёт стоимости и состава работ, сохраняя связь с уже подтверждёнными параметрами."
        },
        {
          "number": "03",
          "title": "Отправление для подтверждения начала проектирования",
          "detailTitle": "03 Отправление для подтверждения начала проектирования",
          "detailText": "Фиксируем решение клиента по старту проектирования, чтобы без разрыва перейти к инженерной проработке."
        }
      ]
    },
    {
      "number": "04",
      "title": "Проектирование",
      "steps": [
        {
          "number": "01",
          "title": "Разработка проектной схемы",
          "detailTitle": "01 Разработка проектной схемы",
          "detailText": "Собираем конструктивную модель проекта, где ключевые узлы уже увязаны между собой как единая система."
        },
        {
          "number": "02",
          "title": "Проверка узлов и материалов",
          "detailTitle": "02 Проверка узлов и материалов",
          "detailText": "Сверяем материалы, нагрузки и спецификацию, чтобы не переносить инженерные риски в следующий этап."
        },
        {
          "number": "03",
          "title": "Согласование проектного решения",
          "detailTitle": "03 Согласование проектного решения",
          "detailText": "Подтверждаем итоговую схему с клиентом и внутри команды перед фиксацией договорных обязательств."
        }
      ]
    },
    {
      "number": "05",
      "title": "Договор",
      "steps": [
        {
          "number": "01",
          "title": "Фиксация состава работ",
          "detailTitle": "01 Фиксация состава работ",
          "detailText": "Подтверждаем объём работ и состав решения, чтобы в реализации не возникало плавающих трактовок."
        },
        {
          "number": "02",
          "title": "Подтверждение сроков и стоимости",
          "detailTitle": "02 Подтверждение сроков и стоимости",
          "detailText": "Закрепляем сроки, стоимость и порядок исполнения как управляемые обязательства сторон."
        },
        {
          "number": "03",
          "title": "Запуск исполнения по договору",
          "detailTitle": "03 Запуск исполнения по договору",
          "detailText": "После фиксации условий переводим проект в исполнение без повторного согласования уже утверждённых параметров."
        }
      ]
    },
    {
      "number": "06",
      "title": "Реализация",
      "steps": [
        {
          "number": "01",
          "title": "Подготовка производства и поставки",
          "detailTitle": "01 Подготовка производства и поставки",
          "detailText": "Готовим материалы, производство и логистику как связанную последовательность перед выходом на объект."
        },
        {
          "number": "02",
          "title": "Монтаж и контроль геометрии",
          "detailTitle": "02 Монтаж и контроль геометрии",
          "detailText": "Монтаж идёт вместе с промежуточной проверкой геометрии, чтобы качество сохранялось на каждом переходе."
        },
        {
          "number": "03",
          "title": "Финальная проверка перед сдачей",
          "detailTitle": "03 Финальная проверка перед сдачей",
          "detailText": "Перед передачей клиенту проводим финальную проверку, подтверждая готовность объекта к закрытию проекта."
        }
      ]
    },
    {
      "number": "07",
      "title": "Сдача",
      "steps": [
        {
          "number": "01",
          "title": "Приёмочный контроль объекта",
          "detailTitle": "01 Приёмочный контроль объекта",
          "detailText": "Проверяем объект по финальным критериям, чтобы передача результата опиралась на подтверждённое качество."
        },
        {
          "number": "02",
          "title": "Передача результата клиенту",
          "detailTitle": "02 Передача результата клиенту",
          "detailText": "Передаём результат, документы и подтверждения как завершённый пакет, а не как набор разрозненных файлов."
        },
        {
          "number": "03",
          "title": "Подтверждение закрытия проекта",
          "detailTitle": "03 Подтверждение закрытия проекта",
          "detailText": "Фиксируем закрытие проекта и убираем незавершённые хвосты, чтобы цикл завершился управляемо и прозрачно."
        }
      ]
    }
  ]
};

  const STAGE_TRANSITION_MS = 240;

  const getRoot = () => document.querySelector('[data-process-nav]') || document.querySelector('.process-nav');

  const clampIndex = (value, max) => {
    if (max <= 0) {
      return 0;
    }

    return Math.min(Math.max(value, 0), max - 1);
  };

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const normalizeData = (data) => {
    if (!data || !Array.isArray(data.stages)) {
      return null;
    }

    return {
      title: data.title || '',
      subtitle: data.subtitle || '',
      stages: data.stages.map((stage) => ({
        number: stage.number || '',
        title: stage.title || '',
        steps: Array.isArray(stage.steps)
          ? stage.steps.map((step) => ({
              number: step.number || '',
              title: step.title || '',
              detailTitle: step.detailTitle || '',
              detailText: step.detailText || ''
            }))
          : []
      }))
    };
  };

  const createRenderer = (root, data) => {
    const titleEl = root.querySelector('.process-nav__title');
    const subtitleEl = root.querySelector('.process-nav__subtitle');
    const timelineEl = root.querySelector('.process-nav__timeline');
    const branchEl = root.querySelector('.process-nav__branch');

    const state = {
      activeStageIndex: 0,
      expandedStepIndex: 0,
      data,
      isStageSwitching: false
    };

    const updateBranchAnchor = () => {
      if (window.matchMedia('(max-width: 960px)').matches) {
        branchEl.style.setProperty('--branch-offset', '0px');
        return;
      }

      const activeStageEl = timelineEl.querySelector(`[data-stage-index="${state.activeStageIndex}"]`);

      if (!activeStageEl) {
        return;
      }

      const timelineRect = timelineEl.getBoundingClientRect();
      const stageRect = activeStageEl.getBoundingClientRect();
      const stageCenterX = stageRect.left - timelineRect.left + stageRect.width / 2;
      const branchWidth = branchEl.getBoundingClientRect().width;
      const maxOffset = Math.max(timelineEl.clientWidth - branchWidth, 0);
      const offset = clampIndex(stageCenterX - branchWidth / 2, maxOffset + 1);

      branchEl.style.setProperty('--branch-offset', `${offset}px`);
    };

    const render = ({ entering = false } = {}) => {
      const activeStage = state.data.stages[state.activeStageIndex];
      const safeExpandedIndex = clampIndex(state.expandedStepIndex, activeStage.steps.length);

      titleEl.textContent = state.data.title;
      subtitleEl.textContent = state.data.subtitle;
      timelineEl.style.setProperty('--stage-count', String(state.data.stages.length));

      timelineEl.innerHTML = state.data.stages
        .map((stage, index) => {
          const activeClass = index === state.activeStageIndex ? ' is-active' : '';

          return `
            <button
              class="process-stage${activeClass}"
              type="button"
              role="tab"
              aria-selected="${index === state.activeStageIndex}"
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
      branchEl.classList.toggle('is-entering', entering);
      branchEl.innerHTML = activeStage.steps
        .map((step, index) => {
          const expandedClass = index === safeExpandedIndex ? ' is-expanded' : '';

          return `
            <article class="process-step${expandedClass}" style="--step-index:${index};">
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

      window.requestAnimationFrame(updateBranchAnchor);

      if (entering) {
        window.setTimeout(() => {
          branchEl.classList.remove('is-entering');
        }, 420);
      }
    };

    const switchStage = async (nextStageIndex) => {
      if (state.isStageSwitching || nextStageIndex === state.activeStageIndex) {
        return;
      }

      state.isStageSwitching = true;
      branchEl.classList.add('is-collapsing');
      await wait(STAGE_TRANSITION_MS);

      state.activeStageIndex = nextStageIndex;
      state.expandedStepIndex = 0;
      render({ entering: true });

      branchEl.classList.remove('is-collapsing');
      state.isStageSwitching = false;
    };

    timelineEl.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-stage-index]');

      if (!trigger) {
        return;
      }

      const nextStageIndex = Number.parseInt(trigger.dataset.stageIndex, 10);

      if (!Number.isNaN(nextStageIndex)) {
        switchStage(nextStageIndex);
      }
    });

    branchEl.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-step-index]');

      if (!trigger || state.isStageSwitching) {
        return;
      }

      const nextStepIndex = Number.parseInt(trigger.dataset.stepIndex, 10);

      if (!Number.isNaN(nextStepIndex) && nextStepIndex !== state.expandedStepIndex) {
        state.expandedStepIndex = nextStepIndex;
        render();
      }
    });

    window.addEventListener('resize', updateBranchAnchor);

    render({ entering: true });
  };

  const loadData = async () => {
    if (window.UNIFIED_NAV_DATA) {
      return normalizeData(window.UNIFIED_NAV_DATA) || FALLBACK_DATA;
    }

    try {
      const response = await fetch('./unified-navigation.content.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const fetchedData = await response.json();
      return normalizeData(fetchedData) || FALLBACK_DATA;
    } catch (error) {
      console.warn('[unified-navigation-v2] fetch failed, using inline fallback data', error);
      return FALLBACK_DATA;
    }
  };

  const init = async () => {
    console.log('[unified-navigation-v2] init');

    const root = getRoot();

    if (!root) {
      console.error('[unified-navigation-v2] root .process-nav not found');
      return;
    }

    const data = await loadData();

    if (!data.stages.length) {
      root.innerHTML = '<p class="process-nav__error">Нет данных для отображения.</p>';
      return;
    }

    createRenderer(root, data);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
