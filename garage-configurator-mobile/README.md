# garage-configurator-mobile

Отдельный mobile-only configurator shell для экранов iPhone-класса. Папка остаётся независимой от `garage-configurator-embed/**`, но снова использует реальные продуктовые ассеты из общего корня репозитория.

## Назначение
- mobile-first конфигуратор гаража в одном вертикальном потоке;
- самостоятельный entrypoint для CDN-доставки;
- безопасная вставка в Tilda T123 без опоры на host reset;
- сохранение бизнес-логики выбора размеров, опций, pricing и summary;
- возврат реального layered hero и реальных GLB-моделей без копирования бинарных файлов в mobile-папку.

## Архитектурные принципы
- Все UI-стили жёстко scoped под `#garage-mobile-root`.
- Мобильная версия не зависит от `garage-configurator-embed/**` и не импортирует desktop code.
- Hero использует общий layered stack из `images/garages/scene/background.webp`, `front.webp`, `gate.webp`, `interior.webp`, `logo11.webp`.
- Viewer использует реальные продуктовые GLB из `models/garage_6x6.glb`, `garage_6x8.glb`, `garage_6x10.glb`, `garage_8x6.glb`, `garage_8x8.glb`, `garage_8x10.glb`.
- Mobile-specific ограничения сохранены только как performance-tuning: пониженный pixel ratio, отключённый zoom, ограниченный OrbitControls и single-column layout.
- Sticky CTA safe-area-aware и скрывается при входе финального CTA-блока в viewport.

## Файлы entrypoint
- `index.html` — standalone mobile entrypoint.
- `app.js` — bootstrap и склейка hero + configurator.
- `hero-scene.*` — мобильная opening scene на реальных layered assets.
- `configurator.*` — single-column configurator shell, viewer, summary и CTA.
- `garage3d.js` — mobile-tuned Three.js viewer с загрузкой реальных GLB.
- `asset-paths.js` — детерминированное разрешение shared asset paths.

## Path resolution strategy
Компонент рассчитан на локальный запуск, GitHub Pages, jsDelivr и Tilda T123 embed.

### Базовые переменные
Можно явно задать URL через:
- `window.GARAGE_CONFIGURATOR_MOBILE_BASE_URL` — базовый URL папки `garage-configurator-mobile/`;
- `window.GARAGE_CONFIGURATOR_EMBED_BASE_URL` — обратная совместимость для mobile bundle;
- `window.GARAGE_CONFIGURATOR_ASSET_BASE_URL` — явный корень shared assets, если host проксирует файлы нестандартно.

### Авто-резолв
Если переменные не заданы:
- mobile entrypoint резолвится относительно `import.meta.url`;
- shared asset root вычисляется как родитель `garage-configurator-mobile/`;
- для GitHub Pages это даёт пути вида `../models/...` и `../images/garages/scene/...`;
- для jsDelivr это даёт CDN-root пакета и прямые ссылки на shared assets;
- для Tilda достаточно подключить mobile bundle с jsDelivr или указать один из base URL globals.

## Ограничения размеров
Реальные GLB доступны в канонических размерах 6×6, 6×8, 6×10, 8×6, 8×8 и 8×10. Mobile shell сохраняет выбор длины только внутри этих продуктовых размеров; viewer всегда переключает именно соответствующий GLB-файл.
