# Wealth Tracker — Developer Documentation

Welcome to the Wealth Tracker codebase. This documentation is designed to help new developers understand the project quickly and contribute effectively.

## Quick Start

1. **Clone the repo** and `cd` into `app/`
2. Run `npm install` to install Node dependencies
3. Install Python dependencies: `pip install -r scripts/requirements.txt`
4. Copy `.env.local.example` (or create `.env.local`) with the required keys — see [Architecture > Environment Variables](./architecture.md#environment-variables)
5. Run `npm run dev` to start the dev server at `http://localhost:3000`

## Documentation Index

| Document | What it covers |
|---|---|
| [Architecture](./architecture.md) | System overview, tech stack, request/data/auth flows, deployment |
| [Directory Structure](./directory-structure.md) | Annotated tree of every directory and key files |
| [API Reference](./api-reference.md) | All REST endpoints — methods, auth, request/response shapes |
| [UI & Components](./ui-components.md) | Page hierarchy, component categories, design rationale |
| [Data Model](./data-model.md) | SQLite schema, TypeScript types, localStorage keys |

## Related Files

- **[VISION.md](../VISION.md)** — Product vision, roadmap, and design principles
- **[openspec/](../openspec/)** — Change management artifacts (proposals, designs, specs, tasks)
- **[app/README.md](../app/README.md)** — Next.js scaffold readme with environment variable reference
