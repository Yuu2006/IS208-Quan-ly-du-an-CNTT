# BlueFood Supply Chain Management - Copilot Instructions

## Project Overview

BlueFood is a **supply chain management system for clean agricultural products**, designed for food export enterprises. The system provides end-to-end traceability from farm to retail, with immutable audit logging and QR code-based consumer verification.

### Core Mission
- Ensure transparency and traceability of agricultural products through the supply chain
- Prevent data history tampering with append-only audit logs
- Enable consumers to verify product origin via QR code scanning
- Manage certifications (VietGAP, GlobalGAP) and shipping status in real-time

### Tech Stack (DO NOT PROPOSE ALTERNATIVES)
- **Frontend**: React.js (web management) + Mobile/Web QR scanning interface
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Relational)
- **File Storage**: Local server storage (certificates, images)

---

## Critical Technical Constraints

### 1. Audit Log (Append-Only) - MANDATORY
**Context**: System does NOT use blockchain. However, supply chain events MUST be immutable.

**Implementation Requirements**:
- Audit log table MUST only support `INSERT` operations from the application
- **Strictly prohibit** `UPDATE` or `DELETE` on audit tables
- **Enforce via PostgreSQL**: Use `RULE`, `TRIGGER`, or dedicated tracking tables
- Every state change of a shipment must be tracked with: actor, timestamp, action, before/after state

**Example**: When shipment status changes from "In Transit" → "Delivered", create immutable log entry with full context.

### 2. Performance - MUST MEET TARGETS
- **QR Code lookup response time**: < 2 seconds (critical for retail POS scanning)
- **System capacity**: Handle 10,000 shipments/year + 100,000 QR scans/year
- **Optimization areas**: Database indexing on shipment_id, QR code, timestamps

### 3. QR Code Traceability
- **100% of exported shipments** must have unique ID + corresponding QR code
- QR code must link to complete shipment history without exposing direct file storage paths
- Implement anti-tampering measures (validate QR authenticity, prevent direct URL exploitation)

---

## System Architecture - 9 Core Functional Packages

When developing features, strictly adhere to these packages:

### Package 1: Account Management (UC01-UC07)
- User authentication with role-based access control (Admin, Farm, Shipping, Retail)
- Roles: Admin, Farm Staff, Shipping Partner, Retail Store, Warehouse Staff
- Account lifecycle: create, update, disable/lock (soft delete)
- Password policy enforcement
- **Key constraint**: Account creation/deletion must be audit-logged

### Package 2: Shipment Management (UC08-UC13) - CORE
- Farms: create new shipments, update details, cancel (pre-export only)
- Shipment status lifecycle: Draft → Ready → Shipped → Delivered
- Search/filter by: shipment ID, product name, supplier, status, date range
- **Key constraint**: Only farms can create; can only cancel pre-export shipments

### Package 3: Certificate Management (UC14-UC18)
- Upload/update/delete quality certificates (VietGAP, GlobalGAP, etc.)
- File storage: Direct server storage (not cloud/S3)
- Certificates can only be deleted pre-shipment
- Maintain certificate validity tracking
- **File handling**: Implement access control to prevent direct file URL exploitation

### Package 4: Shipping Management (UC19-UC25)
- Create shipping orders with carrier assignment, driver, vehicle info
- Tracking updates: location, temperature, condition at checkpoints
- Status workflow: Created → In Transit → Delivered → Confirmed
- Damage/shortage reporting by retail partners
- **Environmental tracking**: Support IoT sensor data (temperature, humidity)

### Package 5: Audit Log Management (UC26-UC28) - READ-ONLY
- View complete immutable log for any shipment
- Filter by: date range, actor, action type
- Export audit trails for compliance
- **CRITICAL**: No edit/delete functionality - enforce at database and API level

### Package 6: Supply Chain History (UC29-UC31) - TRACEABILITY
- View shipment origin: farm, harvest date, location, farming method
- Complete journey: farm → warehouse → shipping → retail
- Historical view includes: origin data, certifications, shipping events, delivery confirmation
- Consumer-facing: accessible via QR code without authentication

### Package 7: QR Code Management (UC32-UC35)
- Generate unique QR codes per shipment
- Download/print QR codes for packaging
- QR scanning interface (mobile-friendly, low-bandwidth)
- **Anti-tampering**: Encode shipment ID + signature, validate on decode

### Package 8: Partner Profile Management (UC36-UC40)
- Manage farms, shipping companies, retail stores
- Partner types: Farm, Shipping Company, Retail Store
- Profile lifecycle: active, pending approval, inactive
- **Key constraint**: Soft delete (preserve history); hard delete only if no transaction history

### Package 9: Reporting & Analytics (UC41-UC45)
- Shipment statistics: count by status, supplier, date range
- QR scan analytics: scans per shipment, scan locations
- Inventory tracking by shipment
- Expiry alerts for shipments nearing end-of-life
- Export: PDF/Excel format

---

## API Response Format & Conventions

### Standard RESTful Endpoints
```
GET    /api/v1/shipments              # List with pagination/filters
GET    /api/v1/shipments/:id          # Get details
POST   /api/v1/shipments              # Create
PUT    /api/v1/shipments/:id          # Update
DELETE /api/v1/shipments/:id          # Soft delete (logical only)

GET    /api/v1/shipments/:id/audit    # Get immutable audit log
GET    /api/v1/shipments/:id/history  # Get supply chain history
```

### Response Structure
```json
{
  "success": true,
  "data": { /* resource */ },
  "meta": {
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  },
  "errors": null
}
```

### Error Responses
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

---

## Database Design Principles

### Naming Conventions
- **Tables**: `snake_case` (e.g., `shipment_tracking`, `audit_log_entries`)
- **Columns**: `snake_case` (e.g., `created_at`, `updated_by_user_id`)
- **Timestamps**: Always include `created_at` and `updated_at` (except audit tables)
- **Foreign keys**: `{table_name}_id` (e.g., `shipment_id`, `user_id`)

### Audit Log Table Structure (IMMUTABLE)
```sql
CREATE TABLE audit_log_entries (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    CONSTRAINT audit_log_immutable CHECK (true)
);
-- Prevent all modifications except INSERT
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log_entries DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log_entries DO INSTEAD NOTHING;
```

### Key Indexing
- Always index foreign keys, status fields, timestamps for filtering
- Index `shipment_id`, `qr_code_hash` for quick lookup (< 2s response time)
- Use composite indexes for common filter combinations

### Data Integrity
- Enable foreign key constraints with proper cascade rules
- Use UNIQUE constraints where applicable (e.g., username, QR code)
- Soft deletes: Add `deleted_at` timestamp column (never hard delete operational data)

---

## Security Practices

### QR Code Anti-Tampering
- **Store**: SHA256 hash of shipment data + secret key
- **Validation**: Verify signature on every scan
- **URL safety**: Never expose direct file paths; use token-based access (`/files/:token`)
- **Rate limiting**: Implement for QR scan endpoint (prevent brute force)

### Authentication & Authorization
- **JWT tokens** with role claims
- **Token expiry**: Short-lived (15 min) with refresh tokens (7 days)
- **Middleware**: Validate token, check role permissions before every protected endpoint
- **Audit**: Log all permission-based access decisions

### File Storage Security
- Validate file types (whitelisting: PDF, PNG, JPG only)
- Scan uploads for malware
- Store outside web root; serve via controller (not direct web access)
- Implement access control lists (ACLs) per shipment

---

## Code Organization - Layered Architecture

Organize express.js projects with separation of concerns:

```
src/
├── controllers/          # HTTP request/response handling
├── services/             # Business logic, validations
├── repositories/         # Database queries
├── middlewares/          # Auth, validation, error handling
├── models/               # TypeScript types (if using TS)
├── utils/                # Helpers, constants
└── routes/               # Route definitions
```

### Layer Responsibilities
- **Controller**: Parse request, call service, format response
- **Service**: Business logic, validations, transactions
- **Repository**: Database operations (queries, inserts)
- **Middleware**: Auth checks, request validation (use Zod/Joi)

### Example Structure
```javascript
// routes/shipments.js
router.get('/:id/audit', authMiddleware, shipmentController.getAuditLog);

// controllers/shipmentController.js
async getAuditLog(req, res) {
  const { id } = req.params;
  const auditLog = await shipmentService.getAuditLog(id, req.user);
  res.json({ success: true, data: auditLog });
}

// services/shipmentService.js
async getAuditLog(shipmentId, user) {
  // Check permissions
  // Query repository
  // Format response
}

// repositories/auditLogRepository.js
async getByShipmentId(shipmentId) {
  return db.query('SELECT * FROM audit_log_entries WHERE entity_id = $1', [shipmentId]);
}
```

---

## Input Validation

### Always Validate
- Use **Zod** or **Joi** for schema validation
- Validate on **every API endpoint** before processing
- Provide detailed error messages with field-level feedback

### Validation Example (Zod)
```javascript
const createShipmentSchema = z.object({
  product_name: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  farm_id: z.string().uuid(),
  harvest_date: z.string().datetime(),
});

router.post('/shipments', async (req, res) => {
  const validated = createShipmentSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ errors: validated.error.errors });
  }
  // Process validated data
});
```

---

## Testing Strategy

### Test Types (if test suite exists)
- **Unit tests**: Service/repository logic isolated
- **Integration tests**: API endpoints with database
- **Audit log tests**: Verify append-only enforcement

### Audit Log Test Example
```javascript
test('audit_log should not allow updates', async () => {
  const result = await db.query(
    'UPDATE audit_log_entries SET action = $1 WHERE id = $2',
    ['MODIFIED', logId]
  );
  expect(result.rowCount).toBe(0); // Rule prevents update
});

test('audit_log should only allow inserts', async () => {
  await shipmentService.updateStatus(shipmentId, 'Delivered', userId);
  const logs = await auditLogRepository.getByShipmentId(shipmentId);
  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].action).toBe('UPDATE_STATUS');
});
```

---

## Common Implementation Patterns

### Soft Delete Pattern
```javascript
// Repository layer
async delete(id) {
  return db.query(
    'UPDATE shipments SET deleted_at = NOW() WHERE id = $1',
    [id]
  );
}

async getActive() {
  return db.query('SELECT * FROM shipments WHERE deleted_at IS NULL');
}
```

### Immutable Audit Entry Creation
```javascript
async logAction(entityType, entityId, action, actor, beforeState, afterState) {
  return db.query(
    `INSERT INTO audit_log_entries 
     (entity_type, entity_id, action, actor_id, before_state, after_state)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [entityType, entityId, action, actor, beforeState, afterState]
  );
}
```

### QR Code Validation
```javascript
async validateQRCode(qrData) {
  const [shipmentId, signature] = qrData.split(':');
  const expectedSignature = await this.generateSignature(shipmentId);
  if (signature !== expectedSignature) {
    throw new Error('QR_CODE_INVALID');
  }
  return shipmentId;
}
```

---

## Documentation Files

Reference these docs for detailed requirements:
- `docs/usecases/UC_All_Use_Cases.md` — Complete use case catalog (45 UCs across 9 packages)
- `docs/usecases/UC_Account_Management.md` — User authentication & role management flows
- `docs/usecases/UC_Shipment_And_History.md` — Shipment lifecycle & traceability
- `docs/usecases/UC_Shipping_And_Audit.md` — Shipping tracking & audit logging
- `docs/usecases/UC_Certificate_And_Reporting.md` — Certificates, analytics, exports
- `docs/usecases/UC_QR_And_Partner_Management.md` — QR codes, partner profiles

---

## Key Performance Indicators (KPIs) for Code Review

Before merging, verify:
- ✅ QR scan response time < 2 seconds (test with production load)
- ✅ Audit log entries cannot be updated/deleted (test RULE enforcement)
- ✅ All state-changing operations are logged to audit table
- ✅ File storage paths never exposed in API responses
- ✅ Authentication required on all protected endpoints
- ✅ Input validation with Zod/Joi on every endpoint
- ✅ Database queries indexed for filtering (shipment_id, status, timestamps)

---

## Project Constraints

- **Budget**: 1.2 billion VNĐ
- **Timeline**: 5 months
- **Team**: 5 people
- **Development Method**: Scrumban (Kanban + Scrum), Incremental delivery
- **QA Requirement**: All 45 use cases must be covered before production release

