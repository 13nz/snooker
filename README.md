# 🎱 Snooker Game

An interactive, physics-based snooker game built with [p5.js](https://p5js.org/) and [Matter.js](https://brm.io/matter-js/). Play through three different game modes, experience realistic ball collisions, strategic cue control, and enjoy creative bonus features like time rewind and target zone challenges.

## 🕹️ Features

- **Three Game Modes** – Switch between gameplay setups using the `1`, `2`, and `3` keys.
- **Mouse-Controlled Cue Aiming** – Drag to aim your cue and press `space` to shoot with visual power indication.
- **Realistic Ball Physics** – Simulates accurate collision and bouncing behaviors using Matter.js.
- **Ball Potting Rules**:
  - Red balls are removed from play when potted.
  - Colored balls return to their original positions when potted.
  - Cue ball is repositioned if potted.
  - Handles fouls, such as potting two colored balls in one shot.
- **Collision Detection** – Displays feedback for cue collisions (e.g. with cushions, reds, or colored balls).
- **Visual Enhancements** – Includes shaded 3D-style balls, cue guides, and aiming indicators.

## ✨ Extensions

- **Time Rewind with Cooldown** – Click a button to reset ball positions to their previous state. Includes a visible cooldown timer to balance gameplay.
- **Target Zones Challenge** – Glow zones appear on the table that reward the player for potting a red ball within them.
- **Lucky Pockets** – Bonus points for potting into randomly chosen “lucky” pockets that change periodically.

## 🧠 Technical Overview

- **Languages & Libraries**:  
  - JavaScript (ES6)  
  - [p5.js](https://p5js.org/) – for rendering  
  - [Matter.js](https://brm.io/matter-js/) – for physics simulation

- **Modular Design**:  
  - `ball.js`: Ball logic and properties  
  - `cue.js`: Cue behavior, aiming, and control  
  - `table.js`: Table rendering and setup  
  - `sketch.js`: Main game loop and state management

## 🚀 Getting Started

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.
3. Play using your mouse and keyboard!

## 🎯 Controls

- `Mouse drag`: Aim cue  
- `Spacebar`: Shoot  
- `1`, `2`, `3`: Switch game mode  
- `Rewind Button`: Reset to last state (10s cooldown)  

## 📸 Demo

Coming soon – see the game in action!
