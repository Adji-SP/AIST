# Configuration Directory

This directory contains all configuration files for the project, keeping the root directory clean.

## Files

### `craco.config.js`
CRACO (Create React App Configuration Override) configuration that:
- Allows imports from outside the `src/` directory (specifically from `App/modules/lib`)
- Provides path aliases for cleaner imports:
  - `@app` → `App/`
  - `@modules` → `App/modules/`
  - `@lib` → `App/modules/lib/`

This solves the "imports outside src/" error when building React apps while keeping code organized and avoiding duplication.

## Usage

The scripts in `package.json` automatically use these config files with the `--config` flag.

Example:
```bash
npm run dev        # Uses craco for development
npm run build      # Uses craco for production build
npm run serve:web  # Builds and serves production
```
