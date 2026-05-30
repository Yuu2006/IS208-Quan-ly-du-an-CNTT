# BlueFood Backend

Node.js + Express.js API using Prisma and PostgreSQL.

## Setup

```bash
npm install
npm run prisma:generate
npm run dev
```

Default API URL:

```text
http://localhost:4000
```

Useful endpoints:

```text
GET /api/health
GET /api/accounts
GET /api/partners
GET /api/batches
GET /api/batches/:batchCode
GET /api/transports
GET /api/qr/:qrId
```

API design based on use cases:

```text
docs/API_DESIGN.md
```

Environment variables are loaded from `.env`. Use `DIRECT_URL` or `DATABASE_URL` for the PostgreSQL connection string.
