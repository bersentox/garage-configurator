(() => {
  const data = window.MSK_GARAGE_V3_DATA;
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

  let activeLeadText = '';
  let toastTimer = null;
  let lastSectorId = '';

  const moneyNote = 'Цены на сайте являются ориентиром. Точный расчет зависит от участка, фундамента, доставки и комплектации.';

  function esc(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function allCards() {
    return data.sectors.flatMap((sector) => (sector.cards || []).map((card) => ({ ...card, sector })));
  }

  function findCard(code) {
    return allCards().find((card) => card.code === code);
  }

  function leadText(card) {
    if (!card) return 'Хочу подобрать и посчитать гараж под мой участок';
    return `Хочу получить расчет по гаражу #${card.code}. Интересует ${card.title} ${card.size}, ${card.price}.`;
  }

  function messengerUrl(channel, message) {
    const contact = data.contact || {};
    const encoded = encodeURIComponent(message);
    if (channel === 'whatsapp') return `${contact.whatsapp}?text=${encoded}`;
    if (channel === 'telegram') return `${contact.telegram}?start=${encoded}`;
    if (channel === 'call') return contact.phoneHref || 'tel:+79000000000';
    if (channel === 'vk') return contact.vk || '#';
    if (channel === 'max') return contact.max || '#';
    if (channel === 'instagram') return contact.instagram || '#';
    return '#';
  }

  function heroSlide(sector) {
    return `
      <section class="slide hero-slide" data-sector-id="${sector.id}" data-sector-number="${sector.number}" data-sector-title="${esc(sector.title)}" data-sector-subtitle="${esc(sector.subtitle)}">
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
      </section>`;
  }

  function garageSlide(card, index, sector) {
    const facts = (card.facts || []).map((fact) => `<span>${esc(fact)}</span>`).join('');
    const firstId = index === 0 ? 'id="first-garage"' : '';
    return `
      <section ${firstId} class="slide garage-slide${card.fantasy ? ' fantasy' : ''}" data-tone="${esc(card.tone || 'graphite')}" data-code="${esc(card.code)}" data-sector-id="${sector.id}" data-sector-number="${sector.number}" data-sector-title="${esc(sector.title)}" data-sector-subtitle="${esc(sector.subtitle)}">
        <div class="slide-inner">
          <div class="garage-stage" role="img" aria-label="${esc(card.title)} ${esc(card.size)}">
            <div class="garage-art"></div>
            <div class="size-plate">${esc(card.size)}</div>
          </div>
          <article class="card-copy">
            <span class="card-badge">Сектор ${sector.number} · ${esc(sector.title)}</span>
            <div class="card-title-row"><div><h2 class="card-title">${esc(card.title)}</h2><div class="card-price">${esc(card.price)}</div></div></div>
            <p class="card-offer">${esc(card.offer)}</p>
            <p class="card-accent">${esc(card.accent)}</p>
            <div class="fact-list">${facts}</div>
            <div class="card-actions">
              <button class="action-primary" type="button" data-lead-code="${esc(card.code)}">Хочу такой</button>
              <button class="action-secondary" type="button" data-detail-code="${esc(card.code)}">Подробнее</button>
            </div>
          </article>
        </div>
      </section>`;
  }

  function footerSlide() {
    return `
      <section class="slide footer-slide" data-tone="night" data-sector-id="landing" data-sector-number="07" data-sector-title="Финальная посадка" data-sector-subtitle="Подберём реальный гараж">
        <div class="slide-inner">
          <article class="card-copy">
            <span class="card-badge">Финальная посадка</span>
            <h2 class="card-title">Не нашли точный вариант?</h2>
            <div class="card-price">Подберём за вас</div>
            <p class="card-offer">Вы видели варианты. Теперь можно не гадать — мы подберём гараж под участок, машины и бюджет.</p>
            <div class="fact-list"><span>договор</span><span>смета</span><span>выезд</span><span>гарантия</span><span>Москва и МО</span></div>
            <p class="card-accent">${moneyNote}</p>
            <div class="card-actions"><button class="action-primary" type="button" data-global-lead>Подобрать и посчитать</button><a class="action-secondary" href="${esc(data.contact.phoneHref)}">Позвонить</a></div>
          </article>
        </div>
      </section>`;
  }

  function renderFeed() {
    let cardIndex = 0;
    feed.innerHTML = data.sectors.map((sector) => {
      if (sector.type === 'hero') return heroSlide(sector);
      return (sector.cards || []).map((card) => garageSlide(card, cardIndex++, sector)).join('');
    }).join('') + footerSlide();
  }

  function showToast(text) {
    sectorToast.textContent = text;
    sectorToast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => sectorToast.classList.remove('visible'), 1100);
  }

  function updateHud(slide) {
    if (!slide) return;
    const id = slide.dataset.sectorId;
    const number = slide.dataset.sectorNumber || '00';
    const title = slide.dataset.sectorTitle || 'Сектор';
    const subtitle = slide.dataset.sectorSubtitle || '';
    sectorHud.innerHTML = `<span class="sector-kicker">Сектор ${esc(number)}</span><strong>${esc(title)}</strong><small>${esc(subtitle)}</small>`;
    if (id && id !== lastSectorId) {
      lastSectorId = id;
      showToast(`Сектор ${number}: ${title}`);
    }
  }

  function observeSectors() {
    const slides = [...feed.querySelectorAll('.slide')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) updateHud(visible.target);
    }, { root: feed, threshold: [0.58, 0.72, 0.9] });
    slides.forEach((slide) => observer.observe(slide));
    updateHud(slides[0]);
  }

  function renderMessengers(message) {
    const items = [['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'], ['call', 'Позвонить'], ['vk', 'VK'], ['max', 'MAX'], ['instagram', 'Instagram']];
    messengerButtons.innerHTML = items.map(([channel, label]) => `<a href="${esc(messengerUrl(channel, message))}" target="${channel === 'call' ? '_self' : '_blank'}" rel="noopener">${label}</a>`).join('');
  }

  function openLead(card) {
    activeLeadText = leadText(card);
    if (card) {
      leadIntro.textContent = `${card.title} ${card.size}. ${card.offer}. Нажмите мессенджер — сообщение с кодом уже будет готово.`;
      leadCode.textContent = `Код гаража: #${card.code}`;
    } else {
      leadIntro.textContent = 'Напишите нам в мессенджер. Мы подберём гараж под участок, машины, бюджет и задачи.';
      leadCode.textContent = 'Без кода: подбор под задачу';
    }
    renderMessengers(activeLeadText);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeLead() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function detailSlide(card, item, index) {
    return `
      <section class="slide detail-slide" data-tone="${esc(card.tone || 'graphite')}">
        <div class="slide-inner">
          <article class="detail-card">
            <span class="detail-badge">${String(index + 1).padStart(2, '0')} · ${esc(card.title)}</span>
            <h2 class="detail-title">${esc(item.title)}</h2>
            <p class="detail-text">${esc(item.text)}</p>
            ${index % 3 === 2 ? `<button class="detail-cta" type="button" data-lead-code="${esc(card.code)}">Хочу такой</button>` : ''}
          </article>
        </div>
      </section>`;
  }

  function renderDetail(card) {
    const cards = data.detailCards[card.code] || data.detailCards.default;
    const intro = `
      <section class="slide detail-slide" data-tone="${esc(card.tone || 'graphite')}">
        <div class="slide-inner"><article class="detail-card"><span class="detail-badge">Внутренняя лента</span><h2 class="detail-title">${esc(card.title)} <span>${esc(card.size)}</span></h2><p class="detail-text">${esc(card.offer)}. ${esc(card.accent)}</p><button class="detail-cta" type="button" data-lead-code="${esc(card.code)}">Получить расчет по этому гаражу</button></article></div>
      </section>`;
    const outro = `
      <section class="slide detail-slide" data-tone="night"><div class="slide-inner"><article class="detail-card"><span class="detail-badge">Парашют</span><h2 class="detail-title">Теперь закрепим вариант</h2><p class="detail-text">Отправьте код #${esc(card.code)}. Цена придёт сразу, а смета и пример проекта откроются после коротких уточнений.</p><button class="detail-cta" type="button" data-lead-code="${esc(card.code)}">Получить в мессенджер</button></article></div></section>`;
    return intro + cards.map((item, index) => detailSlide(card, item, index)).join('') + outro;
  }

  function openDetail(card) {
    if (!card) return;
    detailCode.textContent = `#${card.code}`;
    detailFeed.innerHTML = renderDetail(card);
    detailView.classList.add('open');
    detailView.setAttribute('aria-hidden', 'false');
    detailFeed.scrollTo({ top: 0, behavior: 'auto' });
  }

  function closeDetail() {
    detailView.classList.remove('open');
    detailView.setAttribute('aria-hidden', 'true');
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(activeLeadText || leadText(null));
      copyLeadText.textContent = 'Сообщение скопировано';
    } catch (error) {
      copyLeadText.textContent = 'Не удалось скопировать';
    }
    setTimeout(() => { copyLeadText.textContent = 'Скопировать сообщение'; }, 1400);
  }

  function bindEvents() {
    quickCall.href = data.contact.phoneHref || 'tel:+79000000000';

    document.addEventListener('click', (event) => {
      const leadButton = event.target.closest('[data-lead-code]');
      const detailButton = event.target.closest('[data-detail-code]');
      const globalLead = event.target.closest('[data-global-lead]');
      const closeModal = event.target.closest('[data-close-modal]');

      if (leadButton) openLead(findCard(leadButton.dataset.leadCode));
      if (detailButton) openDetail(findCard(detailButton.dataset.detailCode));
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

  renderFeed();
  bindEvents();
  observeSectors();
})();
