# Automated Test Cases & Assessment Verification Matrix
## Assessment Rubric: Validation and Output (5 Marks)
**Target Test Runner:** `backend/test_suite.js` (`npm test`)  
**Execution Environment:** Node.js 22, Express.js REST API, PostgreSQL 18  
**Result:** **20 / 20 Tests Passed (100% Pass Rate)**  

---

## 1. Test Verification Matrix

| Test ID | Test Category | Description & Test Objective | HTTP Method & Route | Input Data Payload | Expected Result | Actual Execution Result | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | Admin Login Success | `POST /api/auth/login` | `{"email": "admin@smartgrid.io", "password": "Admin@123"}` | `200 OK`, valid JWT token issued | `200 OK`, Token issued for System Administrator | ✅ PASS |
| **TC-02** | Auth | Reject Invalid Credentials | `POST /api/auth/login` | `{"email": "admin@smartgrid.io", "password": "WrongPassword@999"}` | `401 Unauthorized`, `success: false` | `401 Unauthorized`, "Invalid email or password." | ✅ PASS |
| **TC-03** | Consumers | Add Valid Consumer | `POST /api/consumers` | `{"full_name": "Test Consumer Ltd", "category": "Commercial", ...}` | `201 Created`, consumer created | `201 Created`, Created CON-1021 | ✅ PASS |
| **TC-04** | Consumers | Reject Duplicate Number | `POST /api/consumers` | `{"consumer_number": "CON-1001", ...}` | Auto-unique sequence or `409 Conflict` | Unique constraint enforced on `consumers.consumer_number` | ✅ PASS |
| **TC-05** | Meters | Register Smart Meter | `POST /api/meters` | `{"meter_number": "MTR-TEST-xxx", "consumer_id": 21, ...}` | `201 Created`, meter linked to consumer | `201 Created`, Meter registered successfully | ✅ PASS |
| **TC-06** | Readings | Record Valid Reading | `POST /api/readings` | `{"previous": 1250, "current": 1430, "date": "2026-10-24"}` | `201 Created`, units = 180.00 kWh | `201 Created`, $1430 - 1250 = 180.00$ kWh | ✅ PASS |
| **TC-07** | Validation | Reject Lower Current Reading | `POST /api/readings` | `{"previous": 1500, "current": 1200}` | `400 Bad Request`, validation failure | `400 Bad Request`, "Validation failed. Please verify input data." | ✅ PASS |
| **TC-08** | Integrity | Reject Duplicate Reading Date | `POST /api/readings` | Same `meter_id` and same `reading_date` | `409 Conflict`, duplicate blocked | `409 Conflict`, duplicate reading blocked | ✅ PASS |
| **TC-09** | Billing | Progressive Slab Calculation | `POST /api/bills/generate` | `{"reading_id": 16, "due_date": "2026-11-10"}` | `201 Created`, Energy: ₹1350, Fixed: ₹150, Tax: ₹135, Total: ₹1635 | `201 Created`, Calculated ₹1635.00 | ✅ PASS |
| **TC-10** | Integrity | Prevent Duplicate Bill | `POST /api/bills/generate` | Same `reading_id` | `409 Conflict`, duplicate blocked | `409 Conflict`, "A bill has already been generated" | ✅ PASS |
| **TC-11** | Payments | Record Partial Payment | `POST /api/payments` | `{"bill_id": 16, "amount_paid": 635.00, "method": "UPI"}` | `201 Created`, status $\to$ `Partially Paid` | `201 Created`, Status: Partially Paid, Remaining: ₹1000 | ✅ PASS |
| **TC-12** | Ledger | Update Outstanding Balance | `GET /api/bills/:id` | Bill ID 16 | `200 OK`, outstanding = ₹1000.00 | `200 OK`, Total: ₹1635, Paid: ₹635, Outstanding: ₹1000 | ✅ PASS |
| **TC-13** | Validation | Reject Overpayment | `POST /api/payments` | `{"bill_id": 16, "amount_paid": 50000.00}` | `400 Bad Request`, overpayment rejected | `400 Bad Request`, Exceeds outstanding balance | ✅ PASS |
| **TC-14** | Payments | Record Final Full Settlement | `POST /api/payments` | `{"bill_id": 16, "amount_paid": 1000.00}` | `201 Created`, status $\to$ `Paid` | `201 Created`, Settled ₹1000. Status: Paid, Remaining: ₹0 | ✅ PASS |
| **TC-15** | Analytics | Dashboard Aggregates | `GET /api/dashboard/summary` | Valid Admin JWT | `200 OK`, live PostgreSQL metrics | `200 OK`, Total Billed: ₹151k, Collected: ₹108k | ✅ PASS |
| **TC-16** | Security | Reject Unauthenticated Route | `GET /api/dashboard/summary` | Missing/Invalid JWT | `401 Unauthorized` or `403 Forbidden` | `403 Forbidden`, "Invalid or expired token." | ✅ PASS |
| **TC-17** | Reliability | API Health Check | `GET /api/health` | Public probe | `200 OK`, `status: "online"` | `200 OK`, status online | ✅ PASS |
| **TC-18** | RBAC | Consumer Self-Bill Payment | `POST /api/payments` | Consumer JWT paying own bill | `201 Created`, payment accepted | `201 Created`, Consumer paid for own bill | ✅ PASS |
| **TC-19** | IDOR | Reject Consumer Paying Other Bill | `POST /api/payments` | Consumer JWT targeting another consumer bill | `403 Forbidden`, access denied | `403 Forbidden`, "Access denied: You are not authorized..." | ✅ PASS |
| **TC-20** | IDOR | Reject Consumer Access Other Readings | `GET /api/meters/:id/readings` | Consumer JWT targeting another meter | `403 Forbidden`, access denied | `403 Forbidden`, "Access denied: You are not authorized..." | ✅ PASS |

---

## 2. Test Execution Command & Terminal Output

To run the automated test suite against the live backend:

```powershell
cd backend
npm test
```

### Verified Terminal Log
```
===============================================================
 STARTING 20-POINT DBMS IA ASSESSMENT TEST SUITE
 Target: Electricity Consumption & Smart Meter Billing Database
===============================================================

[Test 01] ✅ PASS - Successful login with valid admin credentials
          Detail: Token issued for System Administrator
[Test 02] ✅ PASS - Reject invalid login credentials with 401 Unauthorized
          Detail: Invalid email or password.
[Test 03] ✅ PASS - Adding a new consumer profile
          Detail: Created CON-1021 (Test Consumer Verification Ltd)
[Test 04] ✅ PASS - Reject duplicate consumer number or enforce auto-unique sequences
          Detail: Unique constraint verified on consumers.consumer_number
[Test 05] ✅ PASS - Registering a smart meter unit linked to consumer
          Detail: Assigned meter MTR-TEST-68526 to consumer #21
[Test 06] ✅ PASS - Adding a valid meter reading and computing consumption units
          Detail: 1430 - 1250 = 180.00 kWh
[Test 07] ✅ PASS - Rejecting lower current meter reading (negative consumption)
          Detail: Validation failed. Please verify input data.
[Test 08] ✅ PASS - Rejecting duplicate reading for same meter and date period
          Detail: A meter reading for meter #16 on date 2026-10-24 has already been recorded.
[Test 09] ✅ PASS - Correct progressive slab bill calculation with fixed charge & taxes
          Detail: Energy: ₹1350, Fixed: ₹150, Tax: ₹135, Total: ₹1635
[Test 10] ✅ PASS - Preventing duplicate bill generation for the same meter reading
          Detail: A bill (BILL-202610-1021) has already been generated for this meter reading.
[Test 11] ✅ PASS - Recording a partial payment and updating bill status to Partially Paid
          Detail: Recorded ₹635.00. Status: Partially Paid, Remaining: ₹1000
[Test 12] ✅ PASS - Accurately updating and reflecting outstanding balance in bill record
          Detail: Total: ₹1635.00, Paid: ₹635.00, Outstanding: ₹1000
[Test 13] ✅ PASS - Rejecting payment exceeding the current outstanding balance
          Detail: Payment of ₹50000 exceeds the current outstanding balance of ₹1000.
[Test 14] ✅ PASS - Recording final balance payment and updating bill status to Paid
          Detail: Settled ₹1000.00. Status: Paid, Remaining: ₹0
[Test 15] ✅ PASS - Correct real-time dashboard aggregates calculated from MySQL/PostgreSQL
          Detail: Consumers: 22, Billed: ₹151775.08, Collected: ₹108786.44
[Test 16] ✅ PASS - Preventing unauthorized access to protected routes without valid JWT
          Detail: Rejected unauthenticated request
[Test 17] ✅ PASS - Database health check monitoring and error boundary resilience
          Detail: Health status: online, Timestamp: 2026-10-27T14:46:08.951Z
[Test 18] ✅ PASS - Consumer role permitted to pay and manage their own utility bills
          Detail: Consumer paid ₹10 for own bill #BILL-202610-1001: Status=Partially Paid
[Test 19] ✅ PASS - IDOR Prevention: Consumer strictly forbidden from paying another consumer bill
          Detail: Access denied: You are not authorized to record payments for another consumer's bill.
[Test 20] ✅ PASS - IDOR Prevention: Consumer forbidden from viewing another consumer meter telemetry
          Detail: Access denied: You are not authorized to view readings for this meter.

===============================================================
 ASSESSMENT TEST SUMMARY: 20 / 20 TESTS PASSED (100% SUCCESS)
===============================================================
```
