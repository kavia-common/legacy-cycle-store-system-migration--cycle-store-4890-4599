DataService (mock) provides OpenAPI-aligned CRUD for entities using an in-memory store to enable local interop.

Routes (prefixed with /api):
- GET    /:entity
- POST   /:entity
- GET    /:entity/:id
- PUT    /:entity/:id
- DELETE /:entity/:id

Env:
- PORT=4010

Upgrade path: Replace controllers with Sequelize-backed models and repository layer pointed at MySQL using envs (MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT).
