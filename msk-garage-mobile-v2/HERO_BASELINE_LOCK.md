# HERO BASELINE LOCK (msk-garage-mobile-v2)

## Purpose
This document fixes the current `msk-garage-mobile-v2` hero configuration as a **LOCKED BASELINE**.

Any future task touching this hero must treat values below as **read-only** unless a user gives a **direct explicit command** to change a specific locked parameter.

---

## Source of truth files
- `msk-garage-mobile-v2/index.html`
- `msk-garage-mobile-v2/styles.css`
- `msk-garage-mobile-v2/app.js`

---

## A) LOCKED GATE ZONE (read-only)

### DOM / structure
- Gate stack inside `.scene-visual`:
  - `.gate-mask`
  - `.gate-content`
  - `.gate-overlay`
- Source: `index.html` lines 14-18.

### CSS gate geometry and motion
- `.gate-mask`
  - `position: absolute;`
  - `inset: 0;`
  - `z-index: 2;`
  - `overflow: hidden;`
  - `pointer-events: none;`
  - `clip-path: inset(35.4% 19.8% 43.1% 19.8%);`
- `.gate-content`
  - `position: absolute;`
  - `inset: 0;`
  - `transform: translateY(0);`
  - `transition: transform 5s cubic-bezier(0.22, 0.61, 0.36, 1);`
  - `will-change: transform;`
  - `pointer-events: none;`
- `.gate-overlay`
  - `position: absolute;`
  - `inset: 0;`
  - `width: 100%;`
  - `height: 100%;`
  - `display: block;`
  - `object-fit: cover;`
  - `object-position: center center;`
  - `pointer-events: none;`
- Open-state gate motion:
  - `.hero.open .gate-content { transform: translateY(-28%); }`

### JS values/events that influence gate opening sequence
- Start opening class on click:
  - `hero.classList.add('open', 'opening')`
- Phase delay constants used in scenario timing:
  - `PUSH_DELAY_MS = 520`
  - `SHOW_CHOICE_DELAY_MS = 2600`
  - `CHOICE_DELAY_MS = 4600`
- Guard preventing re-trigger mid-sequence:
  - `opening`, `pushing`, `choice` class check.

### Audio baseline (linked to opening interaction)
- `#garageGateSound` source:
  - `./audio/gate-opening.mp3`
- On click:
  - `currentTime = 0`
  - `volume = 0.6`
  - `play().catch(() => {})`

---

## B) LOCKED HERO COMPOSITION ZONE (read-only)

### Core hero and scene framing
- `.hero`
  - `position: relative;`
  - `width: 100%;`
  - `max-width: 540px;`
  - `margin: 0 auto;`
  - `aspect-ratio: 9 / 16;`
  - `overflow: hidden;`
  - `background: #0a0d12;`
- `.scene-visual`
  - `position: absolute;`
  - `inset: 0;`
  - `z-index: 1;`
  - `transform: translateZ(0) scale(1);`
  - `transform-origin: 50% 50%;`
  - `transition: transform 3.6s cubic-bezier(0.22, 0.61, 0.36, 1);`
  - `will-change: transform;`
- Zoom state:
  - `.hero.pushing .scene-visual, .hero.choice .scene-visual { transform: translateZ(0) scale(1.085); }`
- `.scene`
  - `position: absolute; inset: 0; width: 100%; height: 100%;`
  - `display: block; object-fit: cover; object-position: center center;`

### Brand block (locked placement and typography)
- `.scene-visual .scene-brand`
  - `position: absolute;`
  - `left: 50%;`
  - `top: 14%;`
  - `transform: translateX(-50%);`
  - `z-index: 3;`
  - `text-align: center;`
  - `color: #d6ab5f;`
  - `pointer-events: none;`
- `.scene-logo`
  - `width: 44px; height: 44px; margin: 0 auto 10px; object-fit: contain;`
- `.scene-brand-title`
  - `font-size: clamp(20px, 3.8vw, 28px);`
  - `font-weight: 700;`
  - `letter-spacing: 0.08em;`
  - `line-height: 1;`
  - current text-shadow values fixed.
- `.scene-brand-subtitle`
  - `margin-top: 8px;`
  - `font-size: clamp(10px, 1.9vw, 13px);`
  - `font-weight: 500;`
  - `letter-spacing: 0.04em;`
  - `line-height: 1.2;`
  - `color: rgba(255, 210, 140, 0.92);`

### Instruction block
- `.scene-instruction`
  - `position: absolute; left: 50%; top: 47.5%; transform: translateX(-50%);`
  - `z-index: 3; width: min(72%, 320px);`
  - `font-size: clamp(12px, 2.4vw, 18px);`
  - `font-weight: 500; line-height: 1.35;`
  - `color: rgba(235, 242, 250, 0.82);`
  - `text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);`
  - `opacity: 1; transition: opacity 0.45s ease;`
- Fade states:
  - `.hero.opening .scene-instruction, .hero.pushing .scene-instruction, .hero.choice .scene-instruction { opacity: 0; }`

### Remote block (position, visuals, interaction)
- `.scene-remote`
  - `position: absolute; left: 50%; top: 58%; transform: translateX(-50%);`
  - `transform-origin: center center;`
  - `z-index: 4; width: 54px; height: 86px;`
  - all current reset/tap/focus properties fixed.
  - `transition: transform 0.14s ease, opacity 0.35s ease;`
- `.scene-remote-body`
  - `border-radius: 18px;`
  - fixed gradient/shadows/border values.
- `.scene-remote-light`
  - `left: 50%; top: 28%; width: 18px; height: 18px;`
  - fixed gradient/shadow values.
- `.scene-remote-mark`
  - `left: 50%; bottom: 16px; width: 10px; height: 10px;`
  - fixed gradient value.
- Active press:
  - `.scene-remote:active { transform: translateX(-50%) scale(0.96); }`
- Focus cleanup:
  - `.scene-remote:focus`, `.scene-remote:focus-visible`, `::-moz-focus-inner` values fixed.
- Hide moment:
  - `.hero.show-choice .scene-remote { opacity: 0; transform: translateX(-50%) scale(0.94); pointer-events: none; }`

### Choice panel block
- `.scene-choice`
  - `position: absolute; left: 50%; top: 62%;`
  - `transform: translateX(-50%) translateY(14px) scale(0.98);`
  - `z-index: 5; width: min(82%, 360px);`
  - `display: grid; grid-template-columns: 1fr; gap: 12px;`
  - `opacity: 0; pointer-events: none;`
  - `transition: opacity 0.45s ease, transform 0.45s ease;`
- Reveal state:
  - `.hero.show-choice .scene-choice { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); pointer-events: auto; }`
- `.scene-choice-btn`
  - `min-height: 54px; border-radius: 14px;`
  - fixed border/color/font/background/shadow/backdrop values.
- Active press:
  - `.scene-choice-btn:active { transform: scale(0.985); }`

### Scenario phases and timing baseline
- Initial class in markup:
  - `<main class="hero idle" id="hero">`
- JS phases (order):
  - `open + opening` immediately on remote click.
  - `pushing` at `+520ms`.
  - `show-choice` at `+2600ms`.
  - `choice` at `+4600ms`.
- Choice visibility and remote disappearance are tied to `show-choice` class in CSS.

---

## C) EDITABLE ZONE (allowed only if baseline geometry/timing remains intact)
Allowed, as long as LOCKED zones are untouched:
- Text content only (e.g., button labels/instruction copy), without changing layout-affecting CSS.
- Minor non-layout cosmetic details not affecting placement/timing/scale/interaction flow (e.g., subtle color hue tweaks) **only with explicit task scope**.
- Data attributes for future integration that do not alter visual geometry or timing.

Not allowed under editable zone:
- Any changes to locked transforms, top/left coordinates, clip-path, gate timings, phase timings, zoom scale, or structural placement of locked blocks.

---

## Enforcement protocol (mandatory)
1. Any future hero task must be checked against this baseline **before editing**.
2. If diff touches any value from **LOCKED GATE ZONE** or **LOCKED HERO COMPOSITION ZONE** without explicit permission, task is invalid.
3. Review rule for future PRs:
   - If locked selector/value appears in diff, mark as error unless user explicitly approved that exact parameter.

> **Hard rule:**
> “Любая будущая задача по hero должна сначала проверяться против этого baseline. Если diff меняет любой параметр из LOCKED GATE ZONE или LOCKED HERO COMPOSITION ZONE без прямого разрешения — задача считается невыполненной.”
