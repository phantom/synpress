# Repository Instructions

## Purpose

This repository contains Phantom's heavily modified Synpress fork. It integrates Phantom wallet support into an end-to-end testing framework built around Cypress.

## Layout

- `commands/`, `pages/`, `plugins/`, and `support/`: reusable Synpress commands, page objects, Cypress plugins, and support code.
- `tests/e2e/`: Cypress end-to-end specs and test support.
- `fixtures/`: Cypress fixtures.
- `docs/synpress-commands.md`: generated command reference.
- `synpress.js`, `launcher.js`, and `synpress.config.js`: CLI, launcher, and Cypress configuration.
- `docker-compose.yml` and `docker-compose.ci.yml`: local and CI container test environments.

## Commands

The repository uses Yarn 4.5.0. CI enables Corepack and installs dependencies with `yarn`.

- `yarn lint`: run ESLint and Prettier checks through Turborepo.
- `yarn fix`: apply ESLint and Prettier fixes.
- `yarn test:e2e`: run the Cypress end-to-end suite against the local test server.
- `yarn test:e2e:anvil`: run the end-to-end suite with Anvil.
- `yarn test:e2e:headless`: run the end-to-end suite headlessly.
- `./start-tests.sh`: run the Docker Compose test environment.

## Contribution Constraints

- Treat this as a Phantom-specific fork; the README states that it is not intended to be merged directly with upstream Synpress.
- Add a Changesets entry with `npx changeset` for publishable changes and commit it to the `dev` branch workflow.
- Keep JavaScript formatting and linting consistent with the repository's ESLint and Prettier configuration.
