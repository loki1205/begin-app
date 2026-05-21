# Begin App Monorepo

This repository is now structured as a monorepo with separate app packages.

## Workspaces
- `app/web` — Next.js web application
- `app/ios` — iOS app placeholder
- `app/android` — Android app placeholder

## Commands
- `npm run web:dev` — Start the web app
- `npm run web:build` — Build the web app
- `npm run web:start` — Start the web app in production mode
- `npm run web:lint` — Lint the web app

## Notes
- The existing web app files were moved into `app/web`.
- `app/ios` and `app/android` are skeleton packages for future mobile apps.
