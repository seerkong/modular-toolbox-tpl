## 1. Implementation
- [x] 1.1 Add `@backend/koa-shell` package with Koa adapters that mirror Elysia behavior for GET/POST/PUT/DELETE/FormData/SSE/WS, logging, CORS, `/api/meta`, and static hosting.
- [x] 1.2 Add Node.js dev/build/start scripts for the Koa shell and wire root shortcuts (`dev:backend:koa`, `build:backend:koa`, `build:web:vue-koa`, `build:web:react-koa`).
- [x] 1.3 Add `install:all:nodejs` at repo root and implement an install script for Node.js runtime dependencies.
- [x] 1.4 Update `docs/ai/` backend guidance to describe the Koa shell and Node.js build commands.

## 2. Validation
- [x] 2.1 `bun run dev:backend:koa` to verify Koa shell starts and responds.
- [x] 2.2 `bun run build:backend:koa` to ensure Node.js build output runs.
- [x] 2.3 `bun run build:web:vue-koa` and `bun run build:web:react-koa` to confirm web builds work with the Koa backend.
