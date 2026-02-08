# Arkanoid — Technical Documentation

## Overview

Arkanoid is a browser-based recreation of the classic brick-breaker arcade game. The project is implemented with vanilla JavaScript, HTML5, and CSS3. It runs on desktop and mobile devices and does not require external frameworks or build tools.

**Version:** 1.0.1
**Author:** AngelSg35395
**Live URL:** https://arkanoidsg.netlify.app/

---

## Description

The player controls a paddle at the bottom of the play area. A ball bounces off the paddle, walls, and ceiling. The goal is to destroy all bricks by hitting them with the ball. The game ends in defeat if the ball leaves the bottom of the play area without being caught by the paddle. Victory is achieved when every brick has been destroyed.

---

## Technical Stack

| Layer    | Technology        |
| -------- | ----------------- |
| Markup   | HTML5             |
| Styling  | CSS3              |
| Logic    | Vanilla JavaScript |
| Graphics | Canvas 2D API     |
| Audio    | Web Audio (HTMLAudioElement) |

No package manager, bundler, or runtime is required. The game is served as static files.

---

## Project Structure

```
Arkanoid/
|-- index.html          # Entry point, markup, modals, SEO and meta tags
|-- style.css           # Layout, theming, responsive rules, modals
|-- script.js           # Game loop, physics, input, audio, state
|-- readme.md           # This documentation
|-- robots.txt          # Crawler directives
|-- sitemap.xml         # Sitemap for indexing
|-- Assets/
|   |-- bg.webp         # Canvas background texture
|   |-- bricks.webp     # Brick sprite sheet (8 color variants)
|   |-- logo.webp       # Favicon and branding
|   |-- sprite1.webp    # Paddle sprite
|   |-- pause-btn.webp  # Pause button icon
|   |-- left-arrow.png  # Left control icon
|   |-- right-arrow.png # Right control icon
|   |-- letter-a.png    # Key hint (A)
|   |-- letter-d.png    # Key hint (D)
|   |-- escape-sign.png # Escape key hint
|   |-- sounds/
|       |-- menu.wav    # Menu / idle music (loop)
|       |-- main.wav    # In-game music (loop)
|       |-- hit.wav     # Brick hit sound
|       |-- hitWall.wav # Wall and paddle hit sound
|       |-- lose.wav    # Game over sound
```

---

## Running the Project

1. Clone or download the repository.
2. Serve the project root over HTTP. For example:
   - **Python 3:** `python -m http.server 8000`
   - **Node (npx):** `npx serve`
   - Or open `index.html` directly in a browser (some features may be limited without a server).
3. Open the URL in a modern browser (see Browser Support).

---

## Game Mechanics

### Play Area

- **Canvas size:** 448 x 440 pixels (fixed logical size).
- **Background:** Tiled image (`bg.webp`).
- **Borders:** Ball collides with left, right, and top edges; bottom is the “death” zone.

### Paddle

- **Size:** 50 x 12 pixels.
- **Movement:** Horizontal only; speed 6 pixels per frame.
- **Bounds:** Cannot leave the canvas horizontally.
- **Sprite:** Sourced from `sprite1.webp` (region 29, 174, 50x12).

### Ball

- **Radius:** 3 pixels.
- **Initial velocity:** dx = 3, dy = -3 (upward and right by default).
- **Collisions:**
  - **Walls (left/right):** Horizontal velocity reversed.
  - **Ceiling:** Vertical velocity reversed.
  - **Paddle:** Vertical velocity reversed; ball remains in play.
  - **Bottom:** Ball is considered lost; game over is triggered.

### Bricks

- **Grid:** 13 columns x 12 rows (156 bricks per game).
- **Dimensions:** 30 x 14 pixels per brick, 2 pixels padding.
- **Offset:** 16 px from left, 20 px from top.
- **Appearance:** One of 8 color variants from `bricks.webp` (random per brick).
- **Scoring:** Points by color:
```
  White: 30
  Yellow: 60
  Pink: 90
  Dark Blue: 120
  Red: 150
  Green: 180
  Light Blue: 210
  Orange: 240
```
- **Win condition:** All bricks destroyed.

### Scoring

- **Current score:** Increased by points for each brick hit. Displayed on the canvas (bottom-left) and in modals.
- **Best score:** Persisted in `localStorage` under the key `bestScore`. Updated when the current game ends and the score exceeds the stored value.

---

## Controls

### Desktop

| Action           | Input                    |
| ---------------- | ------------------------ |
| Move paddle left | A or Left Arrow          |
| Move paddle right| D or Right Arrow         |
| Pause / Resume   | Escape                   |

### Mobile

- **Left / Right:** On-screen buttons below the canvas (shown on viewports up to 868 px wide).
- **Pause:** Button in the top-right header (same breakpoint).

Touch targets use `touchstart` and `touchend`; keyboard state is mirrored so the same movement logic applies.

---

## Game States

| State     | Description |
| --------- | ----------- |
| Welcome   | Initial screen. Shows title, controls, best score. Start begins the game and closes the welcome dialog. |
| Playing   | Main loop runs; ball and paddle move; brick collisions and scoring are active. |
| Paused    | Triggered by Escape or pause button. Game loop stops; pause modal shows current score. Resume continues from the same state. |
| Game Over | Ball left the bottom. In-game music stops; “lose” sound plays. After a delay, game over modal shows final and best score. Menu music plays. |
| Win       | All bricks destroyed. In-game music stops. After a delay, win modal shows final score. Menu music plays. |

From Game Over or Win, “Play Again” resets the field, ball, paddle, and score and starts a new run. Best score is kept across sessions via `localStorage`.

---

## Implementation Notes

### Game Loop

- Implemented with `requestAnimationFrame` in `draw()`.
- Each frame: clear canvas, draw background (via CSS), draw paddle, ball, bricks, and score; then run movement and collision logic; then request next frame.
- Loop does not run when `player.gameOver` or `player.pause` is true.

### Collision Detection

- **Ball–brick:** AABB-style check: ball center must be within the brick’s bounding box. Only one brick is processed per collision; vertical velocity is flipped and the brick is marked destroyed.
- **Ball–paddle:** Ball must be within paddle’s X range and overlapping its Y range; then vertical velocity is reversed.

### Audio

- Menu and in-game music are looped. Volume is reduced (0.2) when paused and restored (0.6) when playing.
- Sound effects (hit, lose) play once. All audio is loaded via `<audio>` elements or `new Audio()` pointing to files in `Assets/sounds/`.

### Responsive Behavior

- Below 868 px width: Header and on-screen left/right buttons are shown.
- Below 465 px width: Canvas is scaled (e.g. width 100%, height 350px) for smaller screens.
- Internal coordinates remain 448x440; scaling is handled by CSS.

### Accessibility

- Dialogs use `<dialog>` with `aria-labelledby` and `aria-describedby`.
- Buttons and key actions have `aria-label` where appropriate.
- Controls are documented in the welcome screen (keyboard and on-screen).

---

## Browser Support

The game relies on:

- HTML5 `<canvas>` and `<dialog>`
- ES6+ JavaScript (e.g. `const`, arrow functions, template literals)
- CSS custom properties and `backdrop-filter`
- `localStorage` for best score

Current versions of Chrome, Firefox, Safari, and Edge are supported. Older browsers may lack `<dialog>` or `backdrop-filter`; behavior should degrade without breaking core gameplay.

---

## Credits and Assets

- **Music:** Sinesita (https://www.youtube.com/@sinesita)
- **Sound effects:** Original Arkanoid game
- **Code and design:** AngelSg35395 (https://github.com/AngelSg35395)

---

## License and Usage

This project is intended for portfolio and educational use. Respect the rights of the original Arkanoid IP and the credited authors for assets and music when reusing or redistributing.