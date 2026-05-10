# Asciigen

Minimal ASCII generation for CLI and web.

## Workspaces

- `packages/engine` - shared conversion primitives
- `packages/cli` - terminal commands
- `apps/web` - library and studio

## Commands

```bash
npm install
npm run build
npm run lint
```

## CLI

```bash
npm run build --workspace @asciigen/engine
npm run build --workspace @asciigen/cli
node packages/cli/dist/index.js image ./input.png --width 120
node packages/cli/dist/index.js image ./input.png --width 120 --out output.txt
node packages/cli/dist/index.js video ./input.mp4 --fps 8 --out-dir frames
```
