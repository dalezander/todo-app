## Plan: Add HTTP Server Endpoint Tests

Add focused unit/integration-style tests for the current server routes by first making the server code testable without changing runtime behavior. The recommended approach is to keep `node server.js` working as-is, extract or export the request handling/server creation logic from the current top-level bootstrap, add a `test` script using Node's built-in runner, and cover every observable route/result the server currently supports: root HTML, known static assets, missing files, path-traversal rejection, and internal file-read failure.

**Steps**
1. Refactor the server bootstrap in `c:\Workspace\code\todo-app\server.js` so tests can create/close a server instance without relying on the production `listen()` side effect. Preferred shape: export a request handler plus a small `startServer`/`createServer` helper while keeping CLI startup behind an entrypoint guard. This step blocks all test work because the current file starts listening immediately.
2. Add a test runner script to `c:\Workspace\code\todo-app\package.json` using Node built-in test execution (`node --test`). This can happen in parallel with step 3 once the intended server export shape is chosen.
3. Create a server test file (for example under `c:\Workspace\code\todo-app\test\server.test.js`) that spins up the server on an ephemeral port for route-level assertions. Cover:
   - `GET /` returns `200` with `text/html; charset=utf-8`
   - `GET /script.js` returns `200` with JavaScript content type
   - `GET /styles.css` returns `200` with CSS content type
   - `GET` to a missing file returns `404` and `Not found`
   - A traversal-style request such as `/../package.json` is rejected with `403` and `Forbidden`
4. Add a targeted unit-style test for the internal read-error branch so the `500 Internal server error` path is covered deterministically. Recommended approach: expose the file-serving function or inject the file-read dependency so the test can stub an unexpected filesystem error without depending on OS-specific behavior. This depends on step 1 and can run in parallel with most of step 3.
5. Keep assertions specific to current behavior rather than future API semantics: verify status codes, content types, and small response-body checks, but do not introduce todo CRUD routes or client-side behavior tests. This is a scope guard for the implementation.
6. Run verification and tighten any brittle tests. Ensure each test starts/stops its own server or uses suite hooks to avoid port reuse and leaked handles.

**Relevant files**
- `c:\Workspace\code\todo-app\server.js` — refactor current `http.createServer(...)`, `sendFile`, and `server.listen(...)` structure into exportable testable units while preserving the existing startup behavior.
- `c:\Workspace\code\todo-app\package.json` — add a `test` script for Node's built-in runner.
- `c:\Workspace\code\todo-app\index.html` — reuse as the expected root document for the `/` response assertion.
- `c:\Workspace\code\todo-app\script.js` — reuse for the JavaScript asset route assertion.
- `c:\Workspace\code\todo-app\styles.css` — reuse for the CSS asset route assertion.
- `c:\Workspace\code\todo-app\test\server.test.js` — new test coverage for server routes and error handling.

**Verification**
1. Confirm Node runtime supports the built-in test runner (`node --version`, then `node --test`). If the runtime is older than Node 18, stop and switch the implementation to a fallback runner rather than forcing unsupported syntax.
2. Run the full test suite and confirm all route cases pass with no hanging processes.
3. Manually run `npm start` and verify the browser behavior is unchanged for the existing app.
4. Manually hit one success route and one failure route (for example `/` and a missing file) to confirm the refactor preserved response behavior outside the test harness.

**Decisions**
- Scope includes only the currently implemented HTTP server endpoints/behaviors in `server.js`; it explicitly excludes adding new todo CRUD APIs.
- Node's built-in test runner is the selected approach to avoid adding third-party dependencies.
- Tests should exercise server behavior at the HTTP layer where practical, with a small seam added for deterministic coverage of the `500` branch.

**Further Considerations**
1. Prefer a tiny export-based refactor over a larger module split unless testability still feels awkward after step 1.
2. If the team wants stricter separation later, the request handler can be moved into a dedicated module, but that is not required for this task.
