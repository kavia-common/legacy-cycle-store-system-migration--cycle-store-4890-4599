# DataService - Data Layer Enablement

Commands:
- npm run db:migrate — run database migrations
- npm run db:migrate:undo — undo last migration
- npm run db:seed — seed initial data
- npm run db:reset — reset DB (undo all, migrate, seed)
- npm run openapi:generate — export OpenAPI to ./interfaces/openapi.json

Environment variables are defined in .env.example.
Use the header `x-actor` to attribute audit logs when calling CRUD endpoints.
