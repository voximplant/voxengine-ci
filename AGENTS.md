# voxengine-ci — Agent Guide

`@voximplant/voxengine-ci` is a Node.js CLI that manages Voximplant Platform **applications**, **rules**, and **scenarios** from a local file system, using `@voximplant/apiclient-nodejs` under the hood.

**Do not duplicate documentation in this file.** Treat the linked docs below as the single source of truth. Read the relevant doc before changing behavior, APIs, file layouts, or user-facing instructions.

## Documentation map

| Audience | Document | Purpose |
|----------|----------|---------|
| Users | [README.md](README.md) | Installation, configuration, CLI usage, CI/CD templates |
| Developers | [docs/high-level-design.md](docs/high-level-design.md) | Documentation index and high-level overview |
| Developers | [docs/envs.md](docs/envs.md) | Environment variables (`VOX_CI_CREDENTIALS`, `VOX_CI_ROOT_PATH`) |
| Developers | [docs/domains.md](docs/domains.md) | DDD architecture, DI hierarchy, modules, services, repositories |
| Developers | [docs/voxfiles-file-system.md](docs/voxfiles-file-system.md) | `voxfiles/` directory layout, config files, metadata |
| Developers | [docs/sequence-diagrams.md](docs/sequence-diagrams.md) | Workflow notes (partially commented; reference only) |

Example fixtures for the file-system layout live under [docs/voxengine-ci-files-example/](docs/voxengine-ci-files-example/).

## Repository layout

```
bin/          CLI entry point (voxengine-ci.ts → compiled .js)
lib/
  modules/    ApplicationModule — orchestrates init/upload jobs
  domains/    contexts, entities, repositories, services, types
  utils/      shared helpers
docs/         Developer documentation (source of truth for architecture)
typings/      VoxEngine type definitions
__tests__/    unit and integration tests
voxfiles/     Local Voximplant project files (gitignored; created by init)
```

Compiled output (`lib/**/*.js`, `bin/**/*.js`) is gitignored. Edit TypeScript sources only.

## Architecture (summary)

Follow [docs/domains.md](docs/domains.md) for the full picture. In short:

- **ApplicationModule** wires config, contexts, repositories, and services.
- **Contexts**: `FileSystemContext` (local FS), `VoximplantContext` (platform API).
- **Repositories**: `*PersistentRepository` (local files), `*PlatformRepository` (remote API).
- **Services**: `VoxApplicationService`, `VoxRuleService`, `VoxScenarioService`.
- **CLI commands**: `init`, `upload` (see [README.md](README.md) for flags and usage).

When adding features, extend the existing DDD layers rather than introducing parallel patterns.

## Development

Requires **Node.js ≥ 20** and **Yarn 3**.

| Task | Command |
|------|---------|
| Build | `yarn build` |
| Run CLI (compiled) | `yarn voxengine-ci` or `yarn start` |
| Run CLI (dev, ts-node) | `yarn voxengine-ci:dev` |
| Unit tests | `yarn test:unit` |
| Integration tests | `yarn test:integration` |
| All tests | `yarn test` |
| Lint | `yarn lint` |
| Lint fix | `yarn lint:fix` |
| Spellcheck | `yarn spellcheck` |

TypeScript sources live in `lib/` and `bin/` ([tsconfig.json](tsconfig.json)). Style is enforced by [.eslintrc](.eslintrc) and [.prettierrc](.prettierrc).

## Working guidelines

1. **Read docs first** — behavior, env vars, file layout, and CLI contracts are defined in [README.md](README.md) and [docs/](docs/).
2. **Keep changes scoped** — match existing naming, DI wiring, and repository/service patterns in `lib/domains/`.
3. **Update docs when behavior changes** — if you change CLI flags, env vars, or file-system layout, update the corresponding doc; do not only update Cursor rules or this file.
4. **Do not commit secrets** — `vox_ci_credentials.json` and `.env` are gitignored.
5. **Test before finishing** — run relevant tests (`yarn test:unit` at minimum for domain changes).
