# garage-configurator-mobile

Отдельный mobile-only configurator shell для экранов iPhone-класса. Эта папка является независимым продуктовым слоем и не повторяет desktop-структуру из `garage-configurator-embed`.

## Назначение
- mobile-first конфигуратор гаража в одном вертикальном потоке;
- самостоятельный entrypoint для CDN-доставки;
- безопасная вставка в Tilda T123 без опоры на host reset;
- сохранение бизнес-логики выбора размеров, опций, pricing и summary.

## Архитектурные принципы
- Все UI-стили жёстко scoped под `#garage-mobile-root`.
- Мобильная версия не зависит от `garage-configurator-embed/**` и не импортирует desktop assets.
- Viewer построен как mobile-tuned procedural Three.js scene, чтобы не зависеть от внешних GLB-моделей и держать предсказуемую производительность на телефоне.
- Sticky CTA safe-area-aware и скрывается при входе финального CTA-блока в viewport.

## Файлы entrypoint
- `index.html` — standalone mobile entrypoint.
- `app.js` — bootstrap и склейка hero + configurator.
- `hero-scene.*` — мобильная opening scene с выбором сценария.
- `configurator.*` — single-column configurator shell, viewer, summary и CTA.
- `garage3d.js` — облегчённый viewer для mobile embed.

## Tilda T123 embed intent
Компонент рассчитан на вставку в T123 через jsDelivr. Для CDN-доставки можно указывать базовый URL через:
- `window.GARAGE_CONFIGURATOR_MOBILE_BASE_URL`, или
- `window.GARAGE_CONFIGURATOR_EMBED_BASE_URL`.

Если base URL не указан, модуль использует локальный путь рядом с `index.html`.

## jsDelivr suitability
- нет скрытых ссылок на desktop-папку;
- локальное path resolution детерминировано относительно mobile entrypoint;
- CSS не опирается на глобальные body styles хоста;
- layout ориентирован на 390×844 и проверочные мобильные viewport'ы 375×812, 393×852, 430×932 и 360×800.
