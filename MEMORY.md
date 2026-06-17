# Saile Financial Services - Prototype Upgrade Memory

## Project Overview
- **Architecture**: Single Page Application (SPA) using URL hash-based routing (managed in `js/app.js`).
- **Layout**: Full-width immersive workspace. Left and right sidebars removed to maximize screen real estate for advanced data grids and charts.
- **Tech Stack**: HTML5, Tailwind CSS v3 (Play CDN), Vanilla JavaScript, Chart.js for visualizations.
- **Data Layer**: Centralized storage in `js/storage.js` using `localStorage`. State persisted across sessions.
- **Security**: RBAC (Role-Based Access Control) defined in `js/rbac.js`. View-level and action-level permissions enforced.
- **Branding**: Saile Financial Services (Teal #0f766e, Charcoal #111827).

## Role-Based Mapping (EIS Prototype)
- **MD (Managing Director - Mr. Elias Kafinyangwe)**:
  - Strategic intelligence hub.
  - "Morning Brief" automated alerts.
  - "Risk Thermometer" (PAR 1-30, 31-60, 61-90, 90+ buckets).
  - Functional **What-If Scenario Engine**: Models impact of hiring LOs, growth targets, rate changes, and new branch costs on Portfolio, Clients, and Net Income.
  - Branch Performance Scorecard with sorting and drill-downs.
- **Finance Manager (Mr. Matias Kafinyangwe)**:
  - Treasury and compliance focus.
  - Real-time Cash Position (Bank vs. Vault).
  - GL Reconciliation status and Trial Balance access.
  - RBM Report tracking (RBM-001, 003, 004).
- **Auditor (Mrs. Yuki Kafinyangwe)**:
  - Forensic and read-only view.
  - Anomaly Detection panel (Privilege escalation, document breaches, after-hours access).
  - Branch Risk Heatmap (Karonga vs. Lilongwe).
  - Compliance spot-check registry.
- **Branch Manager (e.g., Patrick Kalua - Lilongwe)**:
  - Tactical branch management.
  - Staff productivity leaderboard.
  - Real-time target tracking (Collections vs. Disbursements).
  - Local cash management (Vault utilization vs. limits).
- **Loan Officer (e.g., Kenneth Malita)**:
  - Operational workspace.
  - Client follow-up queue with "Next Due" dates.
  - Mobile-ready collection plan.
- **Admin (Mr. Isaac Banda)**:
  - System health and infrastructure.
  - Automated jobs monitoring.
  - User and branch registry management.

## Core Data Structures (StorageKeys)
- `USERS`: Staff registry with roles and branch assignments.
- `BRANCHES`: Network branches (Lilongwe, Mzuzu Emp, Mzuzu Bus, Blantyre, Karonga, Zomba).
- `CLIENTS`: Malawian client base (names like Mary Banda, Peter Phiri).
- `LOANS`: Loan applications and active accounts categorized by product.
- `PRODUCTS`: 7 Loan products: Payday, 3-Month, SML (6-Month), Special Scheme, Executive Scheme, Business Loan, Enterprise Loan.
- `VOUCHERS`: Double-entry accounting logs.
- `AUDIT_LOG`: Security trail for all system actions.

## Standards & Patterns
- **Routing**: `#/dashboard` calls `renderDashboard` in `js/screens/s00-dashboard.js`, which dispatches to role-specific renderers.
- **Charts**: Implementation using `Chart.js` with consistent Malawian market coloring.
- **Modals**: Dynamic modal engine in `js/screens/s00-dashboard.js` supporting branch details, PAR drill-downs, P&L views, and RBM sign-offs.
- **Formatting**: Strict use of `formatCurrency()`, `formatPercentage()`, and `getFormattedFullDate()` from `js/utils.js`.
- **Calculation Logic**:
  - `calculatePAR()`: Categorizes by DPD buckets.
  - `updateScenario()`: Interactive engine calculating projections based on Malawian MFI business rules.

## Prototype Upgrades (June 2026 Context)
- **Immersive UI**: Transitioned from uniform "dashboard feel" to unique, functional prototypes for each role.
- **Interactivity**: Connected static UI elements to functional logic (Refresh, Exports, AI Insights, Scenario Modeling).
- **Security Forensics**: Implemented dedicated Auditor flags to demonstrate "Working Prototype" capabilities.
- **Data Fidelity**: All seed data updated to match reference Malawian names and specific branch manager assignments.
