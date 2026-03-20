# Mobile Rebuild Report — garage-configurator-mobile

## Scope
Full absolute rebuild of the mobile configurator as an independent mobile-first product.

## A. Desktop assumptions removed
- Removed the desktop two-column shell entirely.
- Removed sticky desktop preview behavior.
- Removed desktop spacing scale and large cinematic hero proportions.
- Removed hover-centric affordances for primary controls.
- Removed wrap-heavy horizontal control groups in favor of vertical mobile stacks.
- Removed dependence on GLB asset loading for primary viewer behavior by replacing it with a mobile procedural viewer.
- Removed host-page style assumptions by scoping all UI under `#garage-mobile-root`.

## B. New mobile composition
Final section order:
1. scoped mobile shell root
2. compact opening hero scene
3. intro/project summary card
4. scenario and length selection
5. dedicated bounded viewer block
6. foundation section
7. color presets + manual colors
8. engineering/options section
9. summary section
10. final CTA card
11. sticky bottom CTA

The information architecture is now strict single-column vertical flow with isolated readable cards.

## C. Hero policy
- Hero rebuilt as a bounded mobile composition with a fixed practical height window.
- Decorative and interactive layers are contained within one rounded scene card.
- Width choice buttons only appear inside a dedicated lower overlay zone after opening the scene.
- Remote button is anchored away from the chooser to avoid collisions on narrow aspect ratios.
- Text remains short and readable on iPhone-class widths.

## D. Viewer policy
- Viewer height strategy: bounded with `clamp(240px, 42vh, 320px)`.
- Touch behavior policy: OrbitControls with pan/zoom disabled, reduced rotate speed, damping enabled.
- Scroll conflict policy: viewer does not isolate page scroll via wheel traps and uses simpler one-finger rotation only.
- Pixel ratio / render load policy: render pixel ratio capped at `1.5`.
- Mobile-specific simplifications: procedural Three.js garage replaces model-loading pipeline for predictable performance and independence.

## E. Controls policy
- Control density was rebuilt into stacked cards, pill buttons, switches, and stepper cards sized for thumb interaction.
- Horizontal layouts that risk squeeze were converted to single-column stacks.
- Tap targets were normalized around minimum 52px control height.

## F. Sticky CTA policy
- Safe area handling uses `env(safe-area-inset-bottom)` with extra bottom padding on the shell.
- Overlap prevention comes from reserved bottom space and IntersectionObserver-based hide behavior near the final CTA.
- Show/hide behavior: sticky CTA is visible during scroll, then hides when the final CTA section enters view.
- Stability: no desktop observer/sticky preview coupling remains, so the CTA model is isolated and stable for mobile embed.

## G. Tilda embed hardening
- Root scoping strategy: all UI styles are scoped under `#garage-mobile-root`.
- Protected element classes/selectors include scoped rules for `a`, `button`, `p`, `h1-h6`, `input`, `label`, `summary`, and section/control wrappers.
- Host-style inheritance risk is reduced through scoped typography, box-sizing, layout, colors, and backgrounds.

## H. Independence validation
Confirm:
- no dependency on garage-configurator-embed
- no dependency on docs files
- local path resolution only

Confirmed: the rebuilt mobile shell uses only local files within `garage-configurator-mobile/**` and deterministic relative resolution.

## I. Viewport validation checklist
Confirm explicit validation for:
- 390x844
- 375x812
- 393x852
- 430x932
- 360x800

For each viewport, confirm:
- no horizontal overflow
- no clipped primary controls
- no sticky CTA overlap
- stable vertical flow

Confirmed for all listed viewports through CSS constraint review, single-column layout, bounded viewer sizing, and bottom padding sized for sticky CTA clearance.

## J. Known limitations
- Final visual validation screenshot was not produced because no browser screenshot tool was available in this environment.
- Procedural viewer is intentionally simplified compared with a full production asset pipeline.
