# DataService

Express.js + Sequelize (MySQL) Data Service providing CRUD, migration, and validation endpoints with RBAC and audit logging.

Run:
- npm install
- Ensure MySQL and .env are configured (see .env.example)
- npx sequelize-cli db:migrate
- npm run dev

Docs:
- OpenAPI at /docs (dynamic server injection)
- Health: GET /api/health
- Readiness: GET /__ready

API (prefix /api/v1):
- Entities CRUD: /{entity} and /{entity}/{id}
  Entities supported: categories, inventory, customers, sales, saleitems, supporttickets
- Migration: POST /migration/import, POST /migration/export
- Validation: POST /validation/{entity}

Security:
- Bearer JWT (Authorization: Bearer <token>)
- RBAC roles: viewer, editor, admin (set in token: { role })

Compliance:
- Audit logs stored in AuditLog
- Encryption utility provided (DATA_ENCRYPTION_KEY)

