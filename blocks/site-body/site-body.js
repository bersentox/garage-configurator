(() => {
  "use strict";

  const implementationRoot = document.querySelector("#implementation-construction");

  if (implementationRoot) {
    const rows = implementationRoot.querySelectorAll(".implementation-construction__row[data-reveal]");

    if ("IntersectionObserver" in window && rows.length) {
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
    } else {
      rows.forEach((row) => row.classList.add("is-visible"));
    }

    const accordionGroups = implementationRoot.querySelectorAll(".implementation-construction__list[data-accordion-group]");

    const syncAccordionPanel = (item) => {
      const trigger = item.querySelector(".implementation-construction__trigger");
      const panel = item.querySelector(".implementation-construction__panel");
      const inner = panel?.querySelector(".implementation-construction__panel-inner");
      const isOpen = item.classList.contains("is-open");

      if (!trigger || !panel || !inner) {
        return;
      }

      trigger.setAttribute("aria-expanded", String(isOpen));
      panel.style.setProperty("--accordion-max-height", `${inner.scrollHeight}px`);
    };

    accordionGroups.forEach((group) => {
      const items = Array.from(group.querySelectorAll("[data-accordion-item]"));
      items.forEach((item) => syncAccordionPanel(item));

      group.addEventListener("click", (event) => {
        const trigger = event.target instanceof Element ? event.target.closest(".implementation-construction__trigger") : null;

        if (!trigger) {
          return;
        }

        const item = trigger.closest("[data-accordion-item]");

        if (!item) {
          return;
        }

        const willOpen = !item.classList.contains("is-open");

        items.forEach((entry) => {
          entry.classList.toggle("is-open", entry === item ? willOpen : false);
          syncAccordionPanel(entry);
        });
      });
    });

    window.addEventListener("resize", () => {
      implementationRoot.querySelectorAll("[data-accordion-item]").forEach((item) => syncAccordionPanel(item));
    });
  }

  const navigationRoot = document.querySelector("#unified-navigation");

  if (navigationRoot) {
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
  }

  const faqRoot = document.querySelector("#faq");

  if (!faqRoot) {
    return;
  }

  const faqData = {
    "01": {
      title: "Как формируется итоговая стоимость?",
      paragraphs: [
        "Итоговая стоимость собирается из подтверждённых параметров проекта: размеров, конструктивной схемы, материалов, основания, комплектации и условий монтажа.",
        "Сначала фиксируются вводные после контакта и замера, затем они переводятся в техническое задание и коммерческое предложение. Поэтому цена строится не на усреднённой оценке, а на реальной конфигурации объекта.",
        "До старта работ вы понимаете, из чего состоит бюджет, какие решения в него входят и какие этапы зафиксированы в договоре.",
      ],
    },
    "02": {
      title: "Могут ли появиться дополнительные платежи в процессе?",
      paragraphs: [
        "Нет, если параметры проекта подтверждены до запуска работ и зафиксированы в договоре.",
        "После замера и обсуждения собирается полное техническое задание, на основании которого рассчитывается состав решения. Именно это закрывает риск случайных доплат уже в процессе.",
        "Если вы решаете менять конфигурацию после согласования, это оформляется отдельно как новое решение. Поэтому вы всегда понимаете, за что платите и на каком этапе.",
      ],
    },
    "03": {
      title: "Фиксируется ли цена в договоре?",
      paragraphs: [
        "Да. После согласования состава работ, сроков и комплектации стоимость фиксируется в договоре.",
        "Это означает, что проект переводится из предварительного обсуждения в управляемую систему обязательств, где зафиксированы объём, стоимость и порядок исполнения.",
        "Такой подход защищает и клиента, и команду от разночтений по ходу реализации.",
      ],
    },
    "04": {
      title: "Сколько времени занимает строительство?",
      paragraphs: [
        "Срок зависит от размеров объекта, типа конструкции, основания, комплектации и условий площадки.",
        "Мы не называем срок наугад: сначала замеряем участок, собираем задачу и только после этого даём реалистичный календарь по этапам — от подготовки до сдачи.",
        "За счёт такой последовательности сроки не выглядят как обещание “на глаз”, а становятся частью согласованного маршрута проекта.",
      ],
    },
    "05": {
      title: "Что происходит после замера?",
      paragraphs: [
        "После замера все размеры, ограничения участка, подъезд и особенности площадки переходят в расчётный и проектный контур.",
        "На этой базе формируется техническое задание, затем коммерческое предложение и логика следующего шага — проектирование или фиксация условий.",
        "То есть замер не остаётся отдельным визитом, а сразу превращается в основу решения.",
      ],
    },
    "06": {
      title: "Кто отвечает за результат?",
      paragraphs: [
        "За проект отвечает команда, которая ведёт его как единую систему: от входных данных до сдачи объекта.",
        "Ответственность не дробится между случайными исполнителями по этапам — именно поэтому маршрут проекта заранее собран и связан между собой.",
        "Клиент понимает, кто ведёт процесс, на каком этапе находится проект и что подтверждено на текущий момент.",
      ],
    },
    "07": {
      title: "Что если в процессе обнаружатся ограничения участка?",
      paragraphs: [
        "Поэтому мы и начинаем с выезда, замера и фиксации ограничений ещё до проектных решений.",
        "Если на площадке есть перепад высот, сложный подъезд, ограничения по основанию или инженерные вводные, они должны попасть в проект до старта работ, а не после.",
        "Если новые обстоятельства действительно проявляются позже, они разбираются как отдельная зафиксированная вводная, а не как хаотичная проблема на монтаже.",
      ],
    },
    "08": {
      title: "Какие гарантии вы даёте после монтажа?",
      paragraphs: [
        "Гарантия распространяется на согласованный объём работ и конструктивные решения, которые были реализованы по проекту и договору.",
        "Но сама надёжность начинается раньше гарантии: с расчёта, спецификации, контроля узлов и проверки геометрии на каждом переходе.",
        "Именно поэтому итоговый результат опирается не только на обещание после монтажа, но и на предсказуемую систему качества до него.",
      ],
    },
    "09": {
      title: "Как понять, какой размер гаража мне нужен?",
      paragraphs: [
        "Размер определяется не только по габариту автомобиля, но и по сценарию использования: нужен ли запас под хранение, обслуживание, мастерскую или дополнительное оборудование.",
        "Мы связываем ваш сценарий с реальными ограничениями участка и предлагаем конфигурацию, которая работает на практике, а не только “влезает” по внешнему размеру.",
        "Так решение становится не абстрактным метражом, а понятной системой под конкретную задачу.",
      ],
    },
  };

  const faqList = faqRoot.querySelector(".faq__list");
  const faqItems = Array.from(faqRoot.querySelectorAll(".faq__item"));
  const faqDetail = faqRoot.querySelector(".faq__detail");
  const faqDetailTitle = faqRoot.querySelector(".faq__detail-title");
  const faqDetailText = faqRoot.querySelector(".faq__detail-text");

  const renderFaqDetail = (faqId) => {
    const faqEntry = faqData[faqId];

    if (!faqEntry || !faqDetail || !faqDetailTitle || !faqDetailText) {
      return;
    }

    faqDetail.classList.remove("is-visible");
    faqDetail.classList.add("is-updating");

    requestAnimationFrame(() => {
      faqDetailTitle.textContent = faqEntry.title;
      faqDetailText.innerHTML = faqEntry.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");

      requestAnimationFrame(() => {
        faqDetail.classList.remove("is-updating");
        faqDetail.classList.add("is-visible");
      });
    });
  };

  const activateFaq = (faqId, focusItem = false) => {
    const nextItem = faqItems.find((item) => item.dataset.faqId === faqId);

    if (!nextItem || !faqDetail) {
      return;
    }

    faqItems.forEach((item) => {
      const isActive = item === nextItem;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    faqList?.setAttribute("data-active-faq", faqId);
    faqDetail.setAttribute("aria-labelledby", nextItem.id);
    renderFaqDetail(faqId);

    if (focusItem) {
      nextItem.focus();
    }
  };

  faqItems.forEach((item) => {
    item.addEventListener("click", () => activateFaq(item.dataset.faqId || "01"));

    item.addEventListener("keydown", (event) => {
      const currentIndex = faqItems.indexOf(item);

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const nextItem = faqItems[(currentIndex + 1) % faqItems.length];
        activateFaq(nextItem.dataset.faqId || "01", true);
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        const previousItem = faqItems[(currentIndex - 1 + faqItems.length) % faqItems.length];
        activateFaq(previousItem.dataset.faqId || "01", true);
      }

      if (event.key === "Home") {
        event.preventDefault();
        activateFaq(faqItems[0]?.dataset.faqId || "01", true);
      }

      if (event.key === "End") {
        event.preventDefault();
        activateFaq(faqItems[faqItems.length - 1]?.dataset.faqId || "09", true);
      }
    });
  });

  if (faqList) {
    faqList.setAttribute("data-active-faq", "01");
  }

  activateFaq(faqItems.find((item) => item.classList.contains("is-active"))?.dataset.faqId || "01");
})();
