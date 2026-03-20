# Mobile Real Assets Restoration Report

## Scope
Restore real product assets into garage-configurator-mobile while preserving the mobile shell.

### A. Procedural/fake layers removed
- Removed the procedural Three.js placeholder geometry viewer from `garage-configurator-mobile/garage3d.js`.
- Removed the fake geometric mobile hero composition from `garage-configurator-mobile/hero-scene.html` and `garage-configurator-mobile/hero-scene.css`.
- Removed the fake gate/body/roof/apron substitute layers and replaced them with real shared scene layers.

### B. Real asset sources connected
Exact root asset paths now used for:
- hero scene
  - `images/garages/scene/background.webp`
  - `images/garages/scene/front.webp`
  - `images/garages/scene/gate.webp`
  - `images/garages/scene/interior.webp`
  - `images/garages/scene/logo11.webp`
- GLB models
  - `models/garage_6x6.glb`
  - `models/garage_6x8.glb`
  - `models/garage_6x10.glb`
  - `models/garage_8x6.glb`
  - `models/garage_8x8.glb`
  - `models/garage_8x10.glb`

### C. Hero restoration
The hero now renders the real layered scene stack from `images/garages/scene/**` inside the existing mobile shell. The mobile composition was preserved by keeping the single-column panel, overlay CTA cards, and remote control UI, while re-layering the real background, interior, gate, front, and logo assets inside a scoped mobile frame.

### D. Viewer restoration
`garage3d.js` now loads actual GLB files with `GLTFLoader`, selects the correct root-level model for each supported width/length combination, and reuses the mobile viewer shell with lower pixel ratio, limited controls, and no fake substitute mesh. Size changes switch the actual GLB file instead of scaling placeholder geometry.

### E. Path resolution
Asset paths now resolve correctly under:
- GitHub Pages: shared assets resolve as the parent of `garage-configurator-mobile/`, so the mobile bundle reaches `../models/**` and `../images/garages/scene/**`.
- jsDelivr: the mobile base URL is derived from the CDN module URL and shared assets resolve from the package root.
- Tilda embed: the mobile bundle stays independent, and base URLs can be injected with `GARAGE_CONFIGURATOR_MOBILE_BASE_URL`, `GARAGE_CONFIGURATOR_EMBED_BASE_URL`, or `GARAGE_CONFIGURATOR_ASSET_BASE_URL` when the host needs explicit routing.

### F. Mobile constraints preserved
The restoration keeps the mobile-specific shell without replacing real assets:
- single-column flow remains intact;
- Tilda-safe style scoping remains under `#garage-mobile-root`;
- viewer performance is reduced via lower renderer load and limited interaction rather than fake geometry;
- hero overlay UI remains compact and touch-friendly while using the real scene art.

### G. Validation
Confirmed:
- no dependency on `garage-configurator-embed/**`
- real hero scene assets are used
- real GLB models are used
- fake viewer removed
- fake hero removed
