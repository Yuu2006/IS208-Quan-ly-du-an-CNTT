# BlueFood Supply Chain Management

BlueFood is a supply chain management system for clean agricultural products. It provides end to end traceability from farm to retail with immutable audit logging and QR code based verification for consumers.

## Key Goals

- Ensure transparency and traceability of agricultural products
- Keep audit history append only (no edit or delete)
- Provide QR code based consumer verification
- Track certifications and shipping status in real time

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express.js
- Database: PostgreSQL
- File storage: Local server storage (certificates, images)

## Core Use Cases

The system is organized into functional packages covering use cases UC01 to UC45. 

For detailed use case descriptions and implementation progress, please refer to the [Documentation](#documentation) section or check [WALKTHROUGH.md](WALKTHROUGH.md).

## Important Constraints

- Audit log must be append only (no update or delete)
- QR scan response time target under 2 seconds
- Index on shipment ID, QR code hash, and timestamps
- QR code authenticity must be validated and protected

## Repository Structure

- [src/](src/) UI source code
- [src/App.tsx](src/App.tsx) main dashboard view
- [src/mocks/dashboard.json](src/mocks/dashboard.json) mock data for UI
- [docs/usecases/](docs/usecases/) full use case documentation

## Local Development

1) Install dependencies

```bash
npm install
```

2) Start the dev server

```bash
npm run dev
```

3) Build

```bash
npm run build
```

## Mock Data

The current UI uses local mock data at [src/mocks/dashboard.json](src/mocks/dashboard.json). This will be replaced by REST APIs once the backend is ready.

## API Response Convention

Standard response structure

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  },
  "errors": null
}
```

Error response

```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "SHIPMENT_NOT_FOUND",
      "message": "Shipment does not exist",
      "field": "shipment_id"
    }
  ]
}
```

## Security Notes

- QR code must include shipment ID and signature; validate on scan
- File storage must be outside web root and served by controller
- Enforce role permissions on every protected endpoint

## Documentation

- [docs/usecases/UC_All_Use_Cases.md](docs/usecases/UC_All_Use_Cases.md)
- [docs/usecases/UC_Account_Management.md](docs/usecases/UC_Account_Management.md)
- [docs/usecases/UC_Shipment_And_History.md](docs/usecases/UC_Shipment_And_History.md)
- [docs/usecases/UC_Shipping_And_Audit.md](docs/usecases/UC_Shipping_And_Audit.md)
- [docs/usecases/UC_Certificate_And_Reporting.md](docs/usecases/UC_Certificate_And_Reporting.md)
- [docs/usecases/UC_QR_And_Partner_Management.md](docs/usecases/UC_QR_And_Partner_Management.md)
