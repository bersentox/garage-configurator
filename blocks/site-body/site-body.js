(() => {
  "use strict";

  const implementationRoot = document.querySelector("#implementation-construction");

  if (implementationRoot && "IntersectionObserver" in window) {
    const rows = implementationRoot.querySelectorAll(".implementation-construction__row[data-reveal]");

    if (rows.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const row = entry.target;
            const order = Number(row.querySelector(".implementation-construction__number")?.textContent || 0);
            row.style.transitionDelay = `${Math.min(order * 45, 270)}ms`;
            row.classList.add("is-visible");
            observer.unobserve(row);
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      rows.forEach((row) => observer.observe(row));
    }
  }

  const navigationRoot = document.querySelector("#unified-navigation");

  if (!navigationRoot) {
    return;
  }

  const navigationData = {
    "01": {
      title: "Контакт",
      label: "связь",
      description: "Первичный запрос принят, цели проекта уточнены, вход в процесс подтверждён ответственным менеджером.",
      branchTitle: "01 Контакт",
      branchText: "Формируем управляемый вход в проект: запрос, первичные данные и план следующего шага собираются в единую точку.",
      steps: [
        {
          number: "01",
          title: "Приём обращения",
          label: "канал связи",
          detailTitle: "01 Приём обращения",
          detailText: "Фиксируем исходный запрос и точку входа, чтобы дальнейшие действия опирались на подтверждённый контакт.",
        },
        {
          number: "02",
          title: "Уточнение задачи и адреса участка",
          label: "контекст проекта",
          detailTitle: "02 Уточнение задачи и адреса участка",
          detailText: "Собираем ключевые вводные по задаче, локации и ограничениям участка до перехода к выезду.",
        },
        {
          number: "03",
          title: "Согласование времени контакта и выезда",
          label: "переход к замеру",
          detailTitle: "03 Согласование времени контакта и выезда",
          detailText: "Подтверждаем следующий шаг, чтобы замер стартовал в заранее согласованном окне без потери контекста.",
        },
      ],
    },
    "02": {
      title: "Замер",
      label: "выезд",
      description: "Площадка обследована, геометрия и ограничения участка зафиксированы до проектных решений.",
      branchTitle: "02 Замер",
      branchText: "Замер связывает ожидание клиента с реальной площадкой: все критические параметры фиксируются перед расчётом.",
      steps: [
        {
          number: "01",
          title: "Выезд на участок",
          label: "геометрия",
          detailTitle: "01 Выезд на участок",
          detailText: "Начинаем процесс с фактического осмотра площадки, чтобы перейти от предположений к измеряемым данным.",
        },
        {
          number: "02",
          title: "Фиксация ограничений и подъезда",
          label: "условия площадки",
          detailTitle: "02 Фиксация ограничений и подъезда",
          detailText: "Документируем рельеф, подъезд, зазоры и все условия, которые влияют на проект и монтаж.",
        },
        {
          number: "03",
          title: "Передача данных в расчётный контур",
          label: "основа КП",
          detailTitle: "03 Передача данных в расчётный контур",
          detailText: "Передаём подтверждённые размеры и ограничения дальше, чтобы коммерческое предложение строилось на реальной базе.",
        },
      ],
    },
    "03": {
      title: "Задание и КП",
      label: "подтверждение",
      description: "Входные данные собраны, расчёт отправлен на подтверждение и связан со следующим проектным этапом.",
      branchTitle: "03 Задание и КП",
      branchText: "Проектируем маршрут подтверждения, чтобы отправить расчёт и согласование без разрыва процесса.",
      steps: [
        {
          number: "01",
          title: "Формирование задания на проектирование",
          label: "входные данные",
          detailTitle: "01 Формирование задания на проектирование",
          detailText: "Собираем входные данные в подтверждённый пакет, чтобы следующий шаг опирался на зафиксированные вводные, а не на догадки.",
        },
        {
          number: "02",
          title: "Коммерческое предложение",
          label: "расчёт стоимости",
          detailTitle: "02 Коммерческое предложение",
          detailText: "Переводим задачу в понятный расчёт стоимости и состава работ, сохраняя связь с уже подтверждёнными параметрами.",
        },
        {
          number: "03",
          title: "Отправление для подтверждения начала проектирования",
          label: "отправка цены",
          detailTitle: "03 Отправление для подтверждения начала проектирования",
          detailText: "Фиксируем решение клиента по старту проектирования, чтобы без разрыва перейти к инженерной проработке.",
        },
      ],
    },
    "04": {
      title: "Проектирование",
      label: "утверждение",
      description: "Инженерное решение собрано, узлы и материалы согласованы перед юридической фиксацией.",
      branchTitle: "04 Проектирование",
      branchText: "После подтверждения КП инженерная схема детализируется и проходит внутреннюю проверку перед договором.",
      steps: [
        {
          number: "01",
          title: "Разработка проектной схемы",
          label: "конструкция",
          detailTitle: "01 Разработка проектной схемы",
          detailText: "Собираем конструктивную модель проекта, где ключевые узлы уже увязаны между собой как единая система.",
        },
        {
          number: "02",
          title: "Проверка узлов и материалов",
          label: "спецификация",
          detailTitle: "02 Проверка узлов и материалов",
          detailText: "Сверяем материалы, нагрузки и спецификацию, чтобы не переносить инженерные риски в следующий этап.",
        },
        {
          number: "03",
          title: "Согласование проектного решения",
          label: "утверждение",
          detailTitle: "03 Согласование проектного решения",
          detailText: "Подтверждаем итоговую схему с клиентом и внутри команды перед фиксацией договорных обязательств.",
        },
      ],
    },
    "05": {
      title: "Договор",
      label: "фиксация",
      description: "Сроки, стоимость и обязательства закреплены, проект переводится в управляемую реализацию.",
      branchTitle: "05 Договор",
      branchText: "Договор не завершает подготовку, а превращает её в исполняемый контур с понятными обязательствами.",
      steps: [
        {
          number: "01",
          title: "Фиксация состава работ",
          label: "объём",
          detailTitle: "01 Фиксация состава работ",
          detailText: "Подтверждаем объём работ и состав решения, чтобы в реализации не возникало плавающих трактовок.",
        },
        {
          number: "02",
          title: "Подтверждение сроков и стоимости",
          label: "условия",
          detailTitle: "02 Подтверждение сроков и стоимости",
          detailText: "Закрепляем сроки, стоимость и порядок исполнения как управляемые обязательства сторон.",
        },
        {
          number: "03",
          title: "Запуск исполнения по договору",
          label: "старт работ",
          detailTitle: "03 Запуск исполнения по договору",
          detailText: "После фиксации условий переводим проект в исполнение без повторного согласования уже утверждённых параметров.",
        },
      ],
    },
    "06": {
      title: "Реализация",
      label: "сдача",
      description: "Производство, поставка и монтаж идут по утверждённому сценарию с промежуточным контролем качества.",
      branchTitle: "06 Реализация",
      branchText: "Выполнение работ идёт как последовательность контрольных точек, а не как набор разрозненных операций.",
      steps: [
        {
          number: "01",
          title: "Подготовка производства и поставки",
          label: "комплектация",
          detailTitle: "01 Подготовка производства и поставки",
          detailText: "Готовим материалы, производство и логистику как связанную последовательность перед выходом на объект.",
        },
        {
          number: "02",
          title: "Монтаж и контроль геометрии",
          label: "исполнение",
          detailTitle: "02 Монтаж и контроль геометрии",
          detailText: "Монтаж идёт вместе с промежуточной проверкой геометрии, чтобы качество сохранялось на каждом переходе.",
        },
        {
          number: "03",
          title: "Финальная проверка перед сдачей",
          label: "контроль",
          detailTitle: "03 Финальная проверка перед сдачей",
          detailText: "Перед передачей клиенту проводим финальную проверку, подтверждая готовность объекта к закрытию проекта.",
        },
      ],
    },
    "07": {
      title: "Сдача",
      label: "передача",
      description: "Объект принят, результат проверен и передан клиенту как завершённая управляемая система.",
      branchTitle: "07 Сдача",
      branchText: "Завершаем процесс контролируемой передачей результата и подтверждением соответствия проекту.",
      steps: [
        {
          number: "01",
          title: "Приёмочный контроль объекта",
          label: "проверка",
          detailTitle: "01 Приёмочный контроль объекта",
          detailText: "Проверяем объект по финальным критериям, чтобы передача результата опиралась на подтверждённое качество.",
        },
        {
          number: "02",
          title: "Передача результата клиенту",
          label: "документы",
          detailTitle: "02 Передача результата клиенту",
          detailText: "Передаём результат, документы и подтверждения как завершённый пакет, а не как набор разрозненных файлов.",
        },
        {
          number: "03",
          title: "Подтверждение закрытия проекта",
          label: "завершение",
          detailTitle: "03 Подтверждение закрытия проекта",
          detailText: "Фиксируем закрытие проекта и убираем незавершённые хвосты, чтобы цикл завершился управляемо и прозрачно.",
        },
      ],
    },
  };

  const map = navigationRoot.querySelector(".unified-navigation__map");
  const nodes = Array.from(navigationRoot.querySelectorAll(".unified-navigation__node"));
  const branch = navigationRoot.querySelector(".unified-navigation__branch");
  const branchTitle = navigationRoot.querySelector(".unified-navigation__branch-title");
  const branchText = navigationRoot.querySelector(".unified-navigation__branch-text");
  const branchList = navigationRoot.querySelector(".unified-navigation__branch-list");
  const detail = navigationRoot.querySelector(".unified-navigation__detail");
  const detailStatus = navigationRoot.querySelector(".unified-navigation__detail-status");
  const detailTitle = navigationRoot.querySelector(".unified-navigation__detail-title");
  const detailText = navigationRoot.querySelector(".unified-navigation__detail-text");
  let activeSubstepByStage = Object.fromEntries(Object.keys(navigationData).map((stageId) => [stageId, "01"]));

  const renderDetail = (stageId, stepNumber) => {
    const stage = navigationData[stageId];
    const step = stage?.steps.find((item) => item.number === stepNumber) || stage?.steps[0];

    if (!stage || !step || !detail || !detailStatus || !detailTitle || !detailText) {
      return;
    }

    detail.classList.remove("is-visible");
    detail.classList.add("is-updating");

    requestAnimationFrame(() => {
      detailStatus.textContent = `${stageId} ${stage.title}`;
      detailTitle.textContent = `${step.number} ${step.title}`;
      detailText.textContent = step.detailText;

      requestAnimationFrame(() => {
        detail.classList.remove("is-updating");
        detail.classList.add("is-visible");
      });
    });
  };

  const renderBranch = (stageId) => {
    const stage = navigationData[stageId];

    if (!stage || !map || !branch || !branchTitle || !branchText || !branchList) {
      return;
    }

    map.dataset.activeStage = stageId;

    nodes.forEach((node, index) => {
      const nodeStage = node.dataset.stage || "";
      const isActive = nodeStage === stageId;
      const isComplete = Number(nodeStage) < Number(stageId);

      node.classList.toggle("is-active", isActive);
      node.classList.toggle("is-complete", isComplete);
      node.setAttribute("aria-selected", String(isActive));
      node.tabIndex = isActive ? 0 : -1;

      if (isActive) {
        branch.setAttribute("aria-labelledby", node.id);
      }

      node.style.setProperty("--node-order", String(index));
    });

    branch.classList.remove("is-animating");
    void branch.offsetWidth;
    branch.classList.add("is-animating");

    branchTitle.textContent = stage.branchTitle;
    branchText.textContent = stage.branchText;

    const activeStep = stage.steps.some((step) => step.number === activeSubstepByStage[stageId])
      ? activeSubstepByStage[stageId]
      : stage.steps[0]?.number || "01";

    activeSubstepByStage = {
      ...activeSubstepByStage,
      [stageId]: activeStep,
    };

    branchList.innerHTML = `
      <ol class="unified-navigation__subflow" aria-label="Подэтапы ${stage.branchTitle}">
        ${stage.steps
          .map((step, index) => `
            <li class="unified-navigation__subflow-item" style="--subnode-index:${index}">
              <button
                class="unified-navigation__subnode${step.number === activeStep ? " is-active" : ""}"
                type="button"
                data-stage="${stageId}"
                data-step="${step.number}"
                aria-pressed="${String(step.number === activeStep)}"
              >
                <span class="unified-navigation__subnode-number">${step.number}</span>
                <span class="unified-navigation__subnode-copy">
                  <span class="unified-navigation__subnode-title">${step.title}</span>
                  <span class="unified-navigation__subnode-label">${step.label}</span>
                </span>
              </button>
              ${index < stage.steps.length - 1 ? '<span class="unified-navigation__subnode-connector" aria-hidden="true"></span>' : ""}
            </li>
          `)
          .join("")}
      </ol>
    `;

    branchList.querySelectorAll(".unified-navigation__subnode").forEach((subnode) => {
      const stageKey = subnode.getAttribute("data-stage") || stageId;
      const stepKey = subnode.getAttribute("data-step") || activeStep;

      subnode.addEventListener("click", () => {
        activeSubstepByStage = {
          ...activeSubstepByStage,
          [stageKey]: stepKey,
        };

        branchList.querySelectorAll(".unified-navigation__subnode").forEach((item) => {
          const isActive = item === subnode;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        renderDetail(stageKey, stepKey);
      });
    });

    renderDetail(stageId, activeStep);
  };

  const activateStage = (stageId, focusNode = false) => {
    if (!navigationData[stageId]) {
      return;
    }

    renderBranch(stageId);

    if (focusNode) {
      const activeNode = nodes.find((node) => node.dataset.stage === stageId);
      activeNode?.focus();
    }
  };

  nodes.forEach((node) => {
    node.addEventListener("click", () => activateStage(node.dataset.stage || "03", false));

    node.addEventListener("keydown", (event) => {
      const currentIndex = nodes.indexOf(node);

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const nextNode = nodes[(currentIndex + 1) % nodes.length];
        activateStage(nextNode.dataset.stage || "03", true);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const previousNode = nodes[(currentIndex - 1 + nodes.length) % nodes.length];
        activateStage(previousNode.dataset.stage || "03", true);
      }

      if (event.key === "Home") {
        event.preventDefault();
        activateStage(nodes[0]?.dataset.stage || "01", true);
      }

      if (event.key === "End") {
        event.preventDefault();
        activateStage(nodes[nodes.length - 1]?.dataset.stage || "07", true);
      }
    });
  });

  activateStage(map?.dataset.activeStage || "03");
})();
