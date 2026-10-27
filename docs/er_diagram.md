# Entity-Relationship (ER) Modeling
## Electricity Consumption & Smart Meter Billing Database

---

### 1. ER Diagram Overview
The data architecture follows a normalized relational structure centered around consumers, their electrical meter telemetry, billing statements, and payment settlements.

```mermaid
erDiagram
    users ||--o| consumers : "links portal profile"
    users ||--o{ meter_readings : "records"
    users ||--o{ payments : "clears"
    users ||--o{ audit_logs : "triggers"

    consumers ||--|{ smart_meters : "owns"
    consumers ||--|{ bills : "incurred by"

    smart_meters ||--|{ meter_readings : "generates"
    smart_meters ||--|{ bills : "measured on"

    meter_readings ||--o| bills : "billed under"

    bills ||--o{ payments : "settled with"

    tariff_slabs {
        int slab_id PK
        string consumer_category
        decimal minimum_units
        decimal maximum_units
        decimal rate_per_unit
        decimal fixed_charge
        decimal tax_percentage
        date effective_from
        date effective_to
    }

    users {
        int user_id PK
        string full_name
        string email UK
        string password_hash
        string role
        string status
        timestamp created_at
    }

    consumers {
        int consumer_id PK
        string consumer_number UK
        int user_id FK
        string full_name
        string address
        string phone
        string email
        string consumer_category
        date connection_date
        string status
    }

    smart_meters {
        int meter_id PK
        string meter_number UK
        int consumer_id FK
        date installation_date
        string meter_type
        string meter_status
        timestamp last_communication_at
    }

    meter_readings {
        int reading_id PK
        int meter_id FK
        decimal previous_reading
        decimal current_reading
        decimal consumption_units
        date reading_date
        string reading_type
        int recorded_by FK
        timestamp created_at
    }

    bills {
        int bill_id PK
        string bill_number UK
        int consumer_id FK
        int meter_id FK
        int reading_id FK
        date billing_period_start
        date billing_period_end
        decimal units_consumed
        decimal energy_charge
        decimal fixed_charge
        decimal tax_amount
        decimal adjustment_amount
        decimal total_amount
        date due_date
        string bill_status
        timestamp generated_at
    }

    payments {
        int payment_id PK
        int bill_id FK
        string payment_reference UK
        decimal amount_paid
        string payment_method
        timestamp payment_date
        string payment_status
        int recorded_by FK
    }

    audit_logs {
        int log_id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        string details
        timestamp created_at
    }
```

---

### 2. Relationship Cardinalities and Integrity Rules

#### 2.1 Users and Consumers (1 : 0..1)
- Each user account may be linked to at most one electricity consumer. Administrators and Staff operators have no associated consumer profile (`user_id` is unique or nullable).
- If a user account is removed, `ON DELETE SET NULL` preserves consumer billing records.

#### 2.2 Consumers and Smart Meters (1 : 1..N)
- A registered consumer can have one or more smart meters installed across different premises (e.g., residential home and workshop).
- A smart meter must belong to exactly one consumer. Referential integrity is protected via `ON DELETE RESTRICT`.

#### 2.3 Smart Meters and Meter Readings (1 : 1..N)
- A physical meter generates periodic readings over its operational lifetime.
- Unique constraint `uq_meter_reading_date` prevents duplicate recordings for the same meter on the same calendar reading date.

#### 2.4 Meter Readings and Bills (1 : 0..1)
- Every bill corresponds to exactly one confirmed meter reading.
- The `reading_id` column in `bills` carries a **UNIQUE** constraint, guaranteeing that a bill cannot be generated twice for the same meter reading.

#### 2.5 Bills and Payments (1 : 0..N)
- A utility bill may receive multiple partial payments until the outstanding balance drops to zero.
- `payments.bill_id` references `bills.bill_id` with `ON DELETE RESTRICT`.

#### 2.6 Tariff Slabs (Independent Configuration Entity)
- Tariff slabs configure progressive unit rate boundaries and capacity charges by consumer category.
- They are decoupled from transactional tables, allowing regulatory tariff changes over time without altering historical bills.
