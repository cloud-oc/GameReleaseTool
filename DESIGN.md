---
name: GameReleaseTool
description: A neutral proofing table for local game release artwork.
colors:
  ink: "#172530"
  muted: "#52636e"
  line: "#d7dfe3"
  surface: "#fff"
  ground: "#eef1f3"
  accent: "#18675b"
  accent-hover: "#104c43"
  soft: "#e5f0ec"
  warn: "#82571a"
  error: "#a32f2a"
  stage: "#dce3e7"
  control-border: "#b8c6cd"
  focus: "#2d8b7c"
typography:
  headline:
    fontFamily: "Segoe UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.02em"
  body:
    fontFamily: "Segoe UI, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  title:
    fontSize: "14px"
    fontWeight: 650
  label:
    fontSize: "12px"
  measurement:
    fontFamily: "Consolas, monospace"
    fontSize: "11px"
rounded:
  compact: "4px"
  input: "5px"
  button: "6px"
  panel: "8px"
spacing:
  tight: "8px"
  control: "12px"
  section: "18px"
  panel: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "7px 12px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "7px 12px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.input}"
    padding: "8px"
  inspector:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
---

# Design System: GameReleaseTool

## Overview

**Working North Star: “The Image Proofing Table.”** This is a provisional, code-led description of the implemented system, not an approved brand or visual composition. It records `style.css`, the direction contract in `index.html`, and the states in `app.js`. No qualitative user approval is implied.

Cool working surfaces and white control panels frame the user's artwork. Compact Chinese system typography supports repeated crop adjustments, specification reading and export review. The artwork supplies visual variety; interface emphasis remains restrained.

Key characteristics: a large proofing surface, quiet boundaries, green actions, visible dimensions and explicit review states.

## Colors

### Primary

Deep green `accent` identifies primary actions, links and positive check results. `accent-hover` darkens actionable hover states; `soft` provides a selected platform background. Keep the accent tied to interaction and status.

### Neutral

Blue-black `ink` carries main labels. `muted` supports dimensions, helper text and secondary information. White `surface` separates controls from the cool `ground`; `line` defines section boundaries. The slightly darker `stage` isolates the displayed artwork without competing with it.

Warning amber and error red accompany explanatory text. **The Evidence Rule:** color alone never communicates verification. Official public specifications receive the verified badge; template-derived dimensions retain an amber badge and their explicit source label. In particular, a GOG template dimension does not imply fully verified platform requirements.

## Typography

Use the system stack in the tokens, including the Chinese fallback; no downloaded fonts are required. Headings are compact rather than promotional. The headline anchors the current platform, section titles organize the inspector, and labels keep controls readable. Helper text varies from 10–12px in the incumbent desktop layout; preserve its secondary role without shrinking new substantive content unnecessarily.

Measurements use the mono role. Dimensions, counts and range outputs use tabular numerals so updates do not shift adjacent content. Platform explanatory copy is limited to 75ch. Mobile headlines reduce to 23px.

## Layout

The desktop workspace is a 208px platform/slot rail plus a flexible main area. Inside the main area, the proof and a 260px inspector share a grid with a 22px gap. The main area uses 25px side padding. The source import controls sit above this grid; a horizontal strip of aspect-preserving thumbnails sits below the proof. Header actions keep export prominent.

At widths up to 1150px the rail, inspector and gaps tighten. Up to 900px the inspector moves below the proof in two columns. Up to 620px the rail becomes horizontal platform navigation, the slot list is hidden, thumbnails provide slot selection, and the inspector becomes a single column. Header actions occupy a full-width row. At 1600px and above, the inspector and proof surface expand. Settings and delivery pages share the same surfaces and a maximum content width of 1180px.

## Elevation & Depth

Controls and panels are flat, separated with borders and tonal contrast. Only the artwork preview receives a soft shadow, making the image read as an object on the proofing surface. Do not apply that artwork shadow indiscriminately to panels. Exact shadow, focus and transition values are recorded in `.impeccable/design.json`.

## Shapes

Use modest rounded rectangles: compact selections and badges, slightly rounded inputs and buttons, and larger panel corners follow the token roles. Borders are thin and visible. Canvas previews retain their actual output aspect ratios; avoid forcing differing formats into identical image crops merely to regularize the UI. Outline icons use rounded strokes and inherit their control's color.

## Components

**Buttons.** Primary actions use green with white text; secondary buttons use white with a control border. Text actions remove the border and use the accent. Standard controls have a minimum height of 36px. Disabled controls lower opacity and use a disabled cursor. Hover changes background over 150ms; reduced-motion settings remove transitions.

**Fields.** White fields have a thin control border, compact padding and an explicit label. Native range controls and checkboxes use the accent. Read-only fields have a muted background. Keyboard focus uses an offset, three-pixel outline; do not remove it.

**Navigation and previews.** Selected platforms use a pale green fill; selected slots use a pale neutral fill and a visible border. Active thumbnails use an accent border and white background. Horizontal overflow preserves access to all thumbnails and mobile platforms. Selected navigation buttons expose pressed state.

**Proofing canvas.** Neutral surround, transparency checkerboard, grab/grabbing interaction and optional thirds guides support composition. The empty state includes a direct import action and a clearly named test-image option. Thirds guides must never be presented as platform safe areas. Slider controls provide an alternative to dragging.

**Inspector and checks.** White, bordered sections group crop, logo and review controls. Checks pair color with text. Provenance, source links and manual review remain distinct. Messages use a persistent status strip; failures change both its text and visual state.

## Do's and Don'ts

- **Do** keep imported artwork as the strongest visual content and preserve its aspect ratio in previews.
- **Do** reuse the compact hierarchy, neutral surfaces, explicit labels and visible keyboard focus.
- **Do** keep desktop proof and controls adjacent, then stack them at the existing responsive thresholds.
- **Don't** render template-derived dimensions as full platform approval or replace source explanations with a green badge.
- **Don't** treat this provisional implementation as a user-approved visual identity.
- **Don't** introduce decorative gradients, broad panel shadows or a separate font system without revisiting this documented direction.
