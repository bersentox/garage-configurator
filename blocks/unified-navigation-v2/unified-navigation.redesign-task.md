# Unified Navigation — Redesign Task

## Goal

Redesign the existing `blocks/unified-navigation` block.

Replace the current **radial child-circles + tooltip system** with a **horizontal hierarchical stepper**:

* Top level: horizontal row of oval stages
* On click: reveal 3–4 child ovals vertically under the active stage
* On child click: that oval expands into a **detail card** (not a tooltip)

---

## Core Concept

This is **NOT**:

* a radial diagram
* a node graph
* a tooltip system

This IS:

* horizontal process line
* expandable hierarchy
* one active branch at a time
* one expanded child at a time

---

## Data Source

Use existing file:

```
blocks/unified-navigation/unified-navigation.content.json
```

### Mapping

#### Main stages (top horizontal ovals)

Use:

* `stage.number`
* `stage.title`

#### Child steps (vertical ovals)

Use:

* `step.number`
* `step.title`

#### Expanded card (on child click)

Use:

* `step.detailTitle`
* `step.detailText`

### Ignore (do NOT render)

* `stage.description`
* `stage.branchTitle`
* `stage.branchText`
* `step.label`

Do NOT modify the JSON structure.

---

## Interaction Rules

### Default state

* First stage is active
* First child step is expanded

### Stage click

* Close previous stage branch
* Open new stage branch
* Auto-select first child step

### Child click

* Collapse previously expanded child
* Expand clicked child into card

### Constraints

* Only **1 active stage**
* Only **1 expanded child**

---

## Layout

### Desktop

Top:

```
[01 Контакт] — [02 Замер] — [03 КП] — [04 Проект] — [05 Договор] — [06 Реализация] — [07 Сдача]
```

Below active stage:

```
   [01 Подшаг]
   [02 Подшаг]
   [03 Подшаг ← expanded]
         ↓
     ┌───────────────┐
     │ Detail Title  │
     │ Detail text…  │
     └───────────────┘
```

### Mobile

* Allow horizontal scroll for stages
* Keep vertical child stack
* Expanded card must remain readable

---

## Visual Rules

### Main stages

* Pill-shaped ovals
* Equal size
* Aligned on one horizontal axis
* Active stage:

  * slightly larger
  * stronger contrast
  * soft shadow

### Child steps

* 30–40% smaller than main
* Clean, minimal
* No heavy styling

### Expanded child

* Same element transforms into card
* NOT a tooltip
* NOT floating
* Grows in place

### Animations

* Smooth
* Use:

  * height
  * padding
  * opacity
  * transform
* No bounce
* No aggressive motion

---

## What MUST be removed

Completely remove old system:

* Radial layout
* Orbit positioning
* Child circle orbit logic
* Tooltip clouds
* Tooltip tails
* Tooltip positioning system
* Any floating geometry logic

No legacy CSS or JS leftovers.

---

## DOM Structure (target)

```
.process-nav
  .process-nav__header
  .process-nav__timeline
    .process-stage
  .process-nav__branch
    .process-step
      .process-step__compact
      .process-step__detail
```

### State classes

* `.is-active`
* `.is-expanded`

---

## Implementation Notes

* Keep all logic inside `blocks/unified-navigation`
* Do NOT affect other blocks
* Do NOT rewrite unrelated files
* Do NOT invent new text content
* Do NOT fallback to old radial system

---

## Expected Result

A clean, controlled UI:

1. User sees full process instantly
2. Clicks a stage → sees internal structure
3. Clicks a step → sees explanation
4. No chaos, no floating elements

---

## Critical Principle

This block must feel like:

> “Clear process with controlled depth”

NOT:

> “Interactive visual experiment”

---
