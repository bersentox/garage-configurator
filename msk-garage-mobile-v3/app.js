(() => {
  const data = window.MSK_GARAGE_V3_DATA;
  const root = document.getElementById('garage-v3-root');
  const feed = document.getElementById('feed');
  const sectorHud = document.getElementById('sectorHud');
  const sectorToast = document.getElementById('sectorToast');
  const globalLeadButton = document.getElementById('globalLeadButton');
  const quickCall = document.getElementById('quickCall');
  const modal = document.getElementById('leadModal');
  const leadIntro = document.getElementById('leadIntro');
  const leadCode = document.getElementById('leadCode');
  const messengerButtons = document.getElementById('messengerButtons');
  const copyLeadText = document.getElementById('copyLeadText');
  const detailView = document.getElementById('detailView');
  const detailFeed = document.getElementById('detailFeed');
  const detailClose = document.getElementById('detailClose');
  const detailCode = document.getElementById('detailCode');

  let activeCard = null;
  let activeLeadText = '';
  let toastTimer = null;
  let lastSectorId = '';

  const moneyNote = 'Цены на сайте являются ориентиром. Точный расчет зависит от участка, фундамента, доставки и комплектации.';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function encodeMessage(message) {
    return encodeURIComponent(message);
  }

  function getCardLeadText(card) {
    if (!card) {
      return 'Хочу подобрать и посчитать гараж под мой участок';
    }

    return `Хочу получить расчет по гаражу #${card.code}. Интересует ${card.title} ${card.size}, ${card.price}.`;
  }

  function buildMessengerUrl(channel, message) {
    const contact = data.contact || {};
    const encoded = encodeMessage(message);

    if (channel === 'whatsapp') return `${contact.whatsapp}?text=${encoded}`;
    if (channel === 'telegram') return `${contact.telegram}?start=${encoded}`;
    if (channel === 'vk') return contact.vk || '#';
    if (channel === 'max') return contact.max || '#';
    if (channel === 'instagram') return contact.instagram || '#';
    if (channel === 'call') return contact.phoneHref || 'tel:+79000000000';

    return '#';
  }

  function getAllCards() {
    return data.sectors.flatMap((sector) => (sector.cards || []).map((card) => ({ ...card, sector })));
  }

  function renderHero(sector) {
    return `
      <section class="slide hero-slide" data-sector-id="${sector.id}" data-sector-number="${sector.number}" data-sector-title="${escapeHtml(sector.title)}" data-sector-subtitle="${escapeHtml(sector.subtitle)}">
        <div class="slide-inner">
          <div>
            <span class="hero-badge">Вингсьют-каталог</span>
            <h1 class="hero-title">Листайте гаражи <span>с ценами</span></h1>
            <p class="hero-text">Увидели похожий — получите расчет в мессенджер. Не знаете размер — подберём за вас.</p>
            <p class="hero-note">Никаких фильтров и сложного выбора. Просто летите по вариантам от компактных гаражей до больших боксов.</p>
            <div class="hero-actions">
              <a class="hero-action" href="#first-garage">Начать смотреть</a>
              <button class="action-secondary" type="button" data-global-lead>Подобрать за меня</button>
            </div>
            <div class="scroll-cue">Ниже — лента по возрастанию размера ↓</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderCard(card, index, sector) {
    const isFirstGarage = index === 0 ? 'id="first-garage"' : '';
    const facts = (card.facts || []).map((fact) => `<span>${escapeHtml(fact)}</span>`).join('');
    const fantasyClass = card.fantasy ? ' fantasy' : '';

    return `
      <section ${isFirstGarage} class="slide garage-slide${fantasyClass}" data-tone="${escapeHtml(card.tone || 'graphite')}" data-code="${escapeHtml(card.code)}" data-sector-id="${sector.id}" data-sector-number="${sector.number}" data-sector-title="${escapeHtml(sector.title)}" data-sector-subtitle="${escapeHtml(sector.subtitle)}">
        <div class="slide-inner">
          <div class="garage-stage" role="img" aria-label="${escapeHtml(card.title)} ${escapeHtml(card.size)}">
            <div class="garage-art"></div>
            <div class="size-plate">${escapeHtml(card.size)}</div>
          </div>
          <article class="card-copy">
            <span class="card-badge">Сектор ${sector.number} · ${escapeHtml(sector.title)}</span>
            <div class="card-title-row">
              <div>
                <h2 class="card-title">${escapeHtml(card.title)}</h2>
                <div class="card-price">${escapeHtml(card.price)}</div>
              </div>
            </div>
            <p class="card-offer">${escapeHtml(card.offer)}</p>
            <p class="card-accent">${escapeHtml(card.accent)}</p>
            <div class="fact-list">${facts}</div>
            <div class="card-actions">
              <button class="action-primary" type="button" data-lead-code="${escapeHtml(card.code)}">Хочу такой</button>
              <button class="action-secondary" type="button" data-detail-code="${escapeHtml(card.code)}">Подробнее</button>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderFooterSlide() {
    return `
      <section class="slide footer-slide" data-tone="night" data-sector-id="landing" data-sector-number="07" data-sector-title="Финальная посадка" data-sector-subtitle="Подберём реальный гараж">
        <div class="slide-inner">
          <article class="card-copy">
            <span class="card-badge">Финальная посадка</span>
            <h2 class="card-title">Не нашли точный вариант?</h2>
            <div class="card-price">Подберём за вас</div>
            <p class="card-offer">Вы видели варианты. Теперь можно не гадать — мы подберём гараж под участок, машины и бюджет.</p>
            <div class="fact-list">
              <span>договор</span>
              <span>смета</span>
              <span>выезд</span>
              <span>гарантия</span>
              <span>Москва и МО</span>
            </div>
            <p class="card-accent">${moneyNote}</p>
            <div class="card-actions">
              <button class="action-primary" type="button" data-global-lead>Подобрать и посчитать</button>
              <a class="action-secondary" href="${escapeHtml(data.contact.phoneHref)}">Позвонить</a>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderFeed() {
    let cardIndex = 0;
    const html = data.sectors.map((sector) => {
      if (sector.type === 'hero') return renderHero(sector);
      return (sector.cards || []).map((card) => renderCard(card, cardIndex++, sector)).join('');
    }).join('') + renderFooterSlide();

    feed.innerHTML = html;
  }

  function updateHudFromSlide(slide) {
    if (!slide) return;

    const sectorId = slide.dataset.sectorId;
    const number = slide.dataset.sectorNumber || '00';
    const title = slide.dataset.sectorTitle || 'Сектор';
    const subtitle = slide.dataset.sectorSubtitle || '';

    sectorHud.innerHTML = `
      <span class="sector-kicker">Сектор ${escapeHtml(number)}</span>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(subtitle)}</small>
    `;

    if (sectorId && sectorId !== lastSectorId) {
      lastSectorId = sectorId;
      showSectorToast(`Сектор ${number}: ${title}`);
    }
  }

  function showSectorToast(text) {
    sectorToast.textContent = text;
    sectorToast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => sectorToast.classList.remove('visible'), 1100);
  }

  function setupSectorObserver() {
    const slides = [...feed.querySelectorAll('.slide')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) updateHudFromSlide(visible.target);
    }, {
      root: feed,
      threshold: [0.58, 0.72, 0.9]
    });

    slides.forEach((slide) => observer.observe(slide));
    updateHudFromSlide(slides[0]);
  }

  function openLead(card) {
    activeCard = card || null;
    activeLeadText = getCardLeadText(card);

    if (card) {
      leadIntro.textContent = `${card.title} ${card.size}. ${card.offer}. Нажмите мессенджер — сообщение с кодом уже будет готово.`;
      leadCode.textContent = `Код гаража: #${card.code}`;
    } else {
      leadIntro.textContent = 'Напишите нам в мессенджер. Мы подберём гараж под участок, машины, бюджет и задачи.';
      leadCode.textContent = 'Без кода: подбор под задачу';
    }

    renderMessengerButtons(activeLeadText);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeLead() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function renderMessengerButtons(message) {
    const items = [
      ['whatsapp', 'WhatsApp'],
      ['telegram', 'Telegram'],
      ['call', 'Позвонить'],
      ['vk', 'VK'],
      ['max', 'MAX'],
      ['instagram', 'Instagram']
    ];

    messengerButtons.innerHTML = items.map(([channel, label]) => {
      const url = buildMessengerUrl(channel, message);
      return `<a href="${escapeHtml(url)}" target="${channel === 'call' ? '_self' : '_blank'}" rel="noopener">${label}</a>`;
    }).join('');
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(activeLeadText || getCardLeadText(null));
      copyLeadText.textContent = 'Сообщение скопировано';
      setTimeout(() => { copyLeadText.textContent = 'Скопировать сообщение'; }, 1400);
    } catch (error) {
      copyLeadText.textContent = 'Не удалось скопировать';
      setTimeout(() => { copyLeadText.textContent = 'Скопировать сообщение'; }, 1400);
    }
  }

  function openDetail(card) {
    if (!card) return;
    activeCard = card;
    detailCode.textContent = `#${card.code}`;
    detailFeed.innerHTML = renderDetailFeed(card);
    detailView.classList.add('open');
    detailView.setAttribute('aria-hidden', 'false');
    detailFeed.scrollTo({ top: 0, behavior: 'auto' });
  }

  function closeDetail() {
    detailView.classList.remove('open');
    detailView.setAttribute('aria-hidden', 'true');
  }

  function renderDetailFeed(card) {
    const cards = data.detailCards[card.code] || data.detailCards.default;
    const intro = `
      <section class="slide detail-slide" data-tone="${escapeHtml(card.tone || 'graphite')}">
        <div class="slide-inner">
          <article class="detail-card">
            <span class="detail-badge">Внутренняя лента</span>
            <h2 class="detail-title">${escapeHtml(card.title)} <span>${escapeHtml(card.size)}</span></h2>
            <p class="detail-text">${escapeHtml(card.offer)}. ${escapeHtml(card.accent)}</p>
            <button class="detail-cta" type="button" data-lead-code="${escapeHtml(card.code)}">Получить расчет по этому гаражу</button>
          </article>
        </div>
      </section>
    `;

    const detailSlides = cards.map((item, index) => `
      <section class="slide detail-slide" data-tone="${escapeHtml(card.tone || 'graphite')}">
        <div class="slide-inner">
          <article class="detail-card">
            <span class="detail-badge">${String(index + 1).padStart(2, '0')} · ${escapeHtml(card.title)}</span>
            <h2 class="detail-title">${escapeHtml(item.title)}</h2>
            <p class="detail-text">${escapeHtml(item.text)}</p>
            ${index % 3 === 2 ? `<button class="detail-cta" type="button" data-lead-code="${escapeHtml(card.code)}">Хочу такой</button>` : ''}
          </article>
        </div>
      </section>
    `).join('');

    const outro = `
      <section class="slide detail-slide" data-tone="night">
        <div class="slide-inner">
          <article class="detail-card">
            <span class="detail-badge">Парашют</span>
            <h2 class="detail-title">Теперь закрепим вариант</h2>
            <p class="detail-text">Отправьте код #${escapeHtml(card.code)}. Цена придёт сразу, а смета и пример проекта откроются после коротких уточнений.</p>
            <button class="detail-cta" type="button" data-lead-code="${escapeHtml(card.code)}">Получить в мессенджер</button>
          </article>
        </div>
      </section>
    `;

    return intro + detailSlides + outro;
  }

  function findCardByCode(code) {
    return getAllCards().find((card) => card.code === code);
  }

  function bindEvents() {
    quickCall.href = data.contact.phoneHref || 'tel:+79000000000';

    document.addEventListener('click', (event) => {
      const leadButton = event.target.closest('[data-lead-code]');
      const detailButton = event.target.closest('[data-detail-code]');
      const globalLead = event.target.closest('[data-global-lead');
      const closeModal = event.target.closest('[data-close-modal]');

      if (leadButton) {
        const card = findCardByCode(leadButton.dataset.leadCode);
        openLead(card);
      }

      if (detailButton) {
        const card = findCardByCode(detailButton.dataset.detailCode);
        openDetail(card);
      }

      if (globalLead) openLead(null);
      if (closeModal) closeLead();
    });

    globalLeadButton.addEventListener('click', () => openLead(null));
    copyLeadText.addEventListener('click', copyText);
    detailClose.addEventListener('click', closeDetail);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLead();
        closeDetail();
      }
    });
  }

  function init() {
    renderFeed();
    bindEvents();
    setupSectorObserver();
  }

  init();
})();
