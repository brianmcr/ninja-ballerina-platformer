# Ninja Ballerina: The Stolen Show

A 2D side-scrolling platformer where a young ballerina transforms into a ninja to chase down Soggy Waffle and recover the stolen golden ballet slippers.

**[Play it now](https://brianmcr.github.io/ninja-ballerina-platformer/)**

![Title Screen](docs/screenshots/title.png)

## Gameplay

![Gameplay](docs/screenshots/gameplay.png)

Run, jump, and spin through a dojo-themed world across 6 levels and a boss fight. Collect sequins, grab the ninja powerup to transform, and master three attack types to defeat breakfast-themed enemies.

![Boss Fight](docs/screenshots/boss.png)

## Controls

| Action | Keys |
|--------|------|
| Move | Arrow keys or A/D |
| Jump | Space or W (hold to float) |
| Spin Attack | Z (AOE, visible ring) |
| Dash | X (i-frames, trail) |
| Whip | C |
| Weapon (ninja form) | V |
| Skip Cutscene | Escape |

## Features

- **Ballerina-to-ninja transformation** with distinct sprite and moveset
- **6 levels + boss fight** with escalating difficulty and checkpoints
- **4 enemy types**: Butter Pat, Gluten Blob, Syrup Dripper, Milk Carton Guard
- **Boss: Soggy Waffle** with 3 phases, platform teleportation, and summons
- **Procedural animation** (idle bob, spin rotation, squash-stretch, dash trail)
- **Synthesized SFX** via Web Audio API (no audio files needed)
- **Parallax dojo backgrounds** (3-layer scrolling)
- **DALL-E illustrated sprites** with automated green-screen removal

![Level Select](docs/screenshots/level-select.png)

## Tech Stack

- **[Kaplay](https://kaplayjs.com/)** v3001 (game engine)
- **TypeScript** + **Vite**
- **Playwright** for automated regression testing (32 checks)
- **GitHub Pages** for hosting (auto-deploys on push via GitHub Actions)

## Development

```bash
npm install
npm run dev       # dev server at localhost:5186
npm run build     # production build to dist/
```

## Built With

Built by [Brian McRoskey](https://github.com/brianmcr) and [Claude Code](https://claude.ai/claude-code) (Anthropic's AI coding assistant).
