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
      status: "Запрос зарегистрирован, исходные вводные собраны для перехода к замеру.",
      detail: "После фиксации контакта согласуем формат выезда и перечень исходных данных.",
      branchTitle: "01 Контакт",
      branchText: "Формируем управляемый вход в проект: запрос, первичные данные и план следующего шага собираются в единую точку.",
      progress: 9,
      steps: [
        { number: "01", title: "Приём обращения", label: "канал связи" },
        { number: "02", title: "Уточнение задачи и адреса участка", label: "контекст проекта" },
        { number: "03", title: "Согласование времени контакта и выезда", label: "переход к замеру" },
        { terminal: true, title: "при согласовании — замер" },
      ],
    },
    "02": {
      title: "Замер",
      label: "выезд",
      description: "Площадка обследована, геометрия и ограничения участка зафиксированы до проектных решений.",
      status: "Размеры, рельеф и точки подключения собраны для постановки задания и расчёта.",
      detail: "Следующий переход основан на подтверждённых данных участка, а не на предположениях.",
      branchTitle: "02 Замер",
      branchText: "Замер связывает ожидание клиента с реальной площадкой: все критические параметры фиксируются перед расчётом.",
      progress: 23,
      steps: [
        { number: "01", title: "Выезд на участок", label: "геометрия" },
        { number: "02", title: "Фиксация ограничений и подъезда", label: "условия площадки" },
        { number: "03", title: "Передача данных в расчётный контур", label: "основа КП" },
        { terminal: true, title: "подтверждённый замер — к заданию и КП" },
      ],
    },
    "03": {
      title: "Задание и КП",
      label: "подтверждение",
      description: "Входные данные собраны, расчёт отправлен на подтверждение и связан со следующим проектным этапом.",
      status: "Входные данные подготовлены, расчёт отправлен на подтверждение.",
      detail: "При подтверждении — переход к следующему этапу без повторного сбора вводных.",
      branchTitle: "03 Задание и КП",
      branchText: "Проектируем маршрут подтверждения, чтобы отправить расчёт и согласование без разрыва процесса.",
      progress: 41,
      steps: [
        { number: "01", title: "Формирование задания на проектирование", label: "входные данные" },
        { number: "02", title: "Коммерческое предложение", label: "расчёт стоимости" },
        { number: "03", title: "Отправление для подтверждения начала проектирования", label: "отправка цены" },
        { terminal: true, title: "при подтверждении — проектирование" },
      ],
    },
    "04": {
      title: "Проектирование",
      label: "утверждение",
      description: "Инженерное решение собрано, узлы и материалы согласованы перед юридической фиксацией.",
      status: "Проект утверждается, спецификация и логика конструкции готовы к фиксации в договоре.",
      detail: "Контрольный переход исключает разрыв между идеей, расчётом и договорными обязательствами.",
      branchTitle: "04 Проектирование",
      branchText: "После подтверждения КП инженерная схема детализируется и проходит внутреннюю проверку перед договором.",
      progress: 58,
      steps: [
        { number: "01", title: "Разработка проектной схемы", label: "конструкция" },
        { number: "02", title: "Проверка узлов и материалов", label: "спецификация" },
        { number: "03", title: "Согласование проектного решения", label: "утверждение" },
        { terminal: true, title: "после утверждения — договор" },
      ],
    },
    "05": {
      title: "Договор",
      label: "фиксация",
      description: "Сроки, стоимость и обязательства закреплены, проект переводится в управляемую реализацию.",
      status: "Юридические параметры зафиксированы, запуск производства и монтажа подтверждён.",
      detail: "После фиксации условий система переходит к исполнению без плавающих вводных.",
      branchTitle: "05 Договор",
      branchText: "Договор не завершает подготовку, а превращает её в исполняемый контур с понятными обязательствами.",
      progress: 72,
      steps: [
        { number: "01", title: "Фиксация состава работ", label: "объём" },
        { number: "02", title: "Подтверждение сроков и стоимости", label: "условия" },
        { number: "03", title: "Запуск исполнения по договору", label: "старт работ" },
        { terminal: true, title: "договор активен — реализация" },
      ],
    },
    "06": {
      title: "Реализация",
      label: "сдача",
      description: "Производство, поставка и монтаж идут по утверждённому сценарию с промежуточным контролем качества.",
      status: "Работы выполняются по согласованному графику, объект готовится к финальной приёмке.",
      detail: "Контроль на этапе реализации удерживает качество до самой сдачи объекта.",
      branchTitle: "06 Реализация",
      branchText: "Выполнение работ идёт как последовательность контрольных точек, а не как набор разрозненных операций.",
      progress: 88,
      steps: [
        { number: "01", title: "Подготовка производства и поставки", label: "комплектация" },
        { number: "02", title: "Монтаж и контроль геометрии", label: "исполнение" },
        { number: "03", title: "Финальная проверка перед сдачей", label: "контроль" },
        { terminal: true, title: "после проверки — сдача" },
      ],
    },
    "07": {
      title: "Сдача",
      label: "передача",
      description: "Объект принят, результат проверен и передан клиенту как завершённая управляемая система.",
      status: "Итоговый контроль завершён, объект передан с подтверждением результата.",
      detail: "Финальный узел фиксирует завершение цикла и закрывает проект без незавершённых решений.",
      branchTitle: "07 Сдача",
      branchText: "Завершаем процесс контролируемой передачей результата и подтверждением соответствия проекту.",
      progress: 100,
      steps: [
        { number: "01", title: "Приёмочный контроль объекта", label: "проверка" },
        { number: "02", title: "Передача результата клиенту", label: "документы" },
        { number: "03", title: "Подтверждение закрытия проекта", label: "завершение" },
        { terminal: true, title: "цикл завершён" },
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

  const renderBranch = (stageId) => {
    const stage = navigationData[stageId];

    if (!stage || !map || !branch || !branchTitle || !branchText || !branchList || !detail || !detailStatus || !detailTitle || !detailText) {
      return;
    }

    map.dataset.activeStage = stageId;
    map.style.setProperty("--un-progress", `${stage.progress}%`);

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

    branchList.innerHTML = stage.steps
      .map((step, index) => {
        if (step.terminal) {
          return `
            <div class="unified-navigation__subnode unified-navigation__subnode-terminal" style="--subnode-index:${index}">
              <p class="unified-navigation__subnode-title">${step.title}</p>
            </div>
          `;
        }

        return `
          <div class="unified-navigation__subnode" style="--subnode-index:${index}">
            <span class="unified-navigation__subnode-number">${step.number}</span>
            <div class="unified-navigation__subnode-copy">
              <p class="unified-navigation__subnode-title">${step.title}</p>
            </div>
            <span class="unified-navigation__subnode-label">${step.label}</span>
          </div>
        `;
      })
      .join("");

    detailStatus.textContent = `${stageId} ${stage.title}`;
    detailTitle.textContent = stage.status;
    detailText.textContent = stage.detail;

    detail.classList.remove("is-visible");
    requestAnimationFrame(() => detail.classList.add("is-visible"));
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
