# Data Service

Express.js + Sequelize (MySQL) data service for the Cycle Store system.
Implements secure CRUD, validation, migration, RBAC, and audit logging.

## Features
- JWT authentication and RBAC (role-based access control)
- Sequelize models aligning with provided MySQL schema
- Validation with Joi per entity
- CRUD endpoints, validation endpoint, migration import/export endpoints
- Audit logging persisted to `AuditLog` and console via Winston
- Security headers (Helmet), CORS, request logging (Morgan)
- OpenAPI docs at `/docs` with dynamic server URL
- Environment-driven configuration (.env)

## Quick Start
1. Copy `.env.example` to `.env` and set values.
2. Install deps: `npm install`
3. Initialize DB schema (dev only): `npm run db:sync`
4. Start service: `npm run dev` (or `npm start`)
5. Docs: open `http://localhost:3000/docs`

## Environment
- MYSQL_HOST, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD
- JWT_PUBLIC_KEY_BASE64 or JWT_SECRET
- RBAC_ADMIN_ROLES (e.g., admin,superuser)
- LOG_LEVEL, AUDIT_LOG_ENABLED

## API
- Base path: `/api/v1`
- CRUD: `GET/POST /api/v1/{entity}`, `GET/PUT/DELETE /api/v1/{entity}/{id}`
  - entity: inventory, categories, customers, sales, saleitems, supporttickets
- Validation: `POST /api/v1/validation/{entity}`
- Migration:
  - `POST /api/v1/migration/import` (admin only)
  - `POST /api/v1/migration/export` (admin only)

## Compliance & Security
- Use HTTPS and TLS termination at the ingress
- Configure JWT verification via public key (preferred) or shared secret
- Audit logs persisted; ensure data retention and access policies are defined
- No secrets are hardcoded; use environment variables

## Production Notes
- Replace `sequelize.sync({ alter: true })` with proper migrations
- Harden CORS, rate limits, and request size as needed
- Integrate with centralized Monitoring/Logging Service
