# Binary / Diff Audit — garage-configurator-mobile

## Scope
Audit only.
No file edits.
No cloning.
No deletion.
No rename.

## A. Full file classification

| path | extension | classification | reason | approximate size if available |
| --- | --- | --- | --- | --- |
| `garage-configurator-mobile/.clone-contract` | none | text | Plain UTF-8 configuration file with 8 short lines. | 235 B |
| `garage-configurator-mobile/app.js` | `.js` | text | JavaScript source file; 63 lines; normal diff size. | 1.9 KB |
| `garage-configurator-mobile/asset-paths.js` | `.js` | text | JavaScript source file; 19 lines; normal diff size. | 521 B |
| `garage-configurator-mobile/assets/.still` | none | text | Placeholder text file; single blank line. | 1 B |
| `garage-configurator-mobile/assets/garage-10.svg` | `.svg` | oversized-text-for-diff | SVG is XML text, but this file is extremely large at 9,552 lines and ~674 KB, which makes PR rendering heavy. | 674.1 KB |
| `garage-configurator-mobile/assets/garage-6.svg` | `.svg` | oversized-text-for-diff | SVG is XML text, but this file is extremely large at 6,298 lines and ~436 KB, which makes PR rendering heavy. | 436.2 KB |
| `garage-configurator-mobile/assets/garage-8.svg` | `.svg` | oversized-text-for-diff | SVG is XML text, but this file is extremely large at 7,431 lines and ~523 KB, which makes PR rendering heavy. | 522.5 KB |
| `garage-configurator-mobile/config-prices.js` | `.js` | text | JavaScript source file; 46 lines; normal diff size. | 954 B |
| `garage-configurator-mobile/configurator.css` | `.css` | text | CSS source file; 528 lines; readable text diff. | 12.0 KB |
| `garage-configurator-mobile/configurator.html` | `.html` | text | HTML fragment; 126 lines; readable text diff. | 6.9 KB |
| `garage-configurator-mobile/configurator.js` | `.js` | text | JavaScript source file; 303 lines; readable text diff. | 11.6 KB |
| `garage-configurator-mobile/docs/.still` | none | text | Placeholder text file; one short UTF-8 line. | 3 B |
| `garage-configurator-mobile/docs/hero_problem.png` | `.png` | likely-binary-for-ui | PNG raster image with binary PNG signature (`89 50 4E 47`); UI/documentation image asset; cannot produce meaningful text diff. | 1.5 MB |
| `garage-configurator-mobile/garage3d.js` | `.js` | text | JavaScript source file; 316 lines; readable text diff. | 9.5 KB |
| `garage-configurator-mobile/hero-scene.css` | `.css` | text | CSS source file; 575 lines; readable text diff. | 11.3 KB |
| `garage-configurator-mobile/hero-scene.html` | `.html` | text | HTML fragment; 45 lines; normal diff size. | 2.3 KB |
| `garage-configurator-mobile/hero-scene.js` | `.js` | text | JavaScript source file; 46 lines; normal diff size. | 1.4 KB |
| `garage-configurator-mobile/index.html` | `.html` | text | HTML entrypoint; 27 lines; normal diff size. | 697 B |
| `garage-configurator-mobile/state.js` | `.js` | text | JavaScript source file; 112 lines; normal diff size. | 2.1 KB |

## B. Binary candidate list

Files classified as `binary` or `likely-binary-for-ui`:

- `garage-configurator-mobile/docs/hero_problem.png` — `likely-binary-for-ui` — PNG raster asset — ~1.5 MB.

## C. PR / diff risk list

Files most likely causing the Codex/GitHub diff viewer problem:

1. `garage-configurator-mobile/docs/hero_problem.png` — binary PNG asset — ~1.5 MB — no meaningful text diff.
2. `garage-configurator-mobile/assets/garage-10.svg` — oversized XML text asset — 9,552 lines — ~674.1 KB.
3. `garage-configurator-mobile/assets/garage-8.svg` — oversized XML text asset — 7,431 lines — ~522.5 KB.
4. `garage-configurator-mobile/assets/garage-6.svg` — oversized XML text asset — 6,298 lines — ~436.2 KB.

These four files dominate the clone payload and are the exact files most likely to trigger PR rendering strain.

## D. Safe clone set

Exact subset that is safe to copy into `garage-configurator-mobile` for a text-only PR:

- `garage-configurator-mobile/.clone-contract`
- `garage-configurator-mobile/app.js`
- `garage-configurator-mobile/asset-paths.js`
- `garage-configurator-mobile/assets/.still`
- `garage-configurator-mobile/config-prices.js`
- `garage-configurator-mobile/configurator.css`
- `garage-configurator-mobile/configurator.html`
- `garage-configurator-mobile/configurator.js`
- `garage-configurator-mobile/docs/.still`
- `garage-configurator-mobile/garage3d.js`
- `garage-configurator-mobile/hero-scene.css`
- `garage-configurator-mobile/hero-scene.html`
- `garage-configurator-mobile/hero-scene.js`
- `garage-configurator-mobile/index.html`
- `garage-configurator-mobile/state.js`

## E. Exclusion set

Exact files that should be excluded from the clone to avoid binary/diff problems:

- `garage-configurator-mobile/docs/hero_problem.png`
- `garage-configurator-mobile/assets/garage-10.svg`
- `garage-configurator-mobile/assets/garage-8.svg`
- `garage-configurator-mobile/assets/garage-6.svg`

Exact exclusion patterns that match the same risk set in this clone:

- `garage-configurator-mobile/docs/*.png`
- `garage-configurator-mobile/assets/*.svg`

## F. Conclusion

The most probable root cause is the combination of one binary raster asset and three very large SVG assets:

- `garage-configurator-mobile/docs/hero_problem.png`
- `garage-configurator-mobile/assets/garage-10.svg`
- `garage-configurator-mobile/assets/garage-8.svg`
- `garage-configurator-mobile/assets/garage-6.svg`

`garage-configurator-mobile/docs/hero_problem.png` is the strongest binary/diff failure candidate because it is a 1.5 MB PNG with no text diff. The three `garage-configurator-mobile/assets/*.svg` files are text, but they are large enough to create heavy PR payloads and noisy diffs. For a text-only PR, exclude exactly those four files.
