# Saile Platform Prototype Memory

## System Architecture
- **Type:** Single Page Application (SPA).
- **Styling:** Tailwind CSS (Teal/Charcoal palette).
- **Persistence:** `localStorage` managed via `js/storage.js`.
- **Routing:** Hash-based routing (`#/dashboard`, etc.) in `js/app.js`.
- **RBAC:** Centralized in `js/rbac.js`.

## Role Mappings (Prototype Upgrade)
- **MD:** Executive Intelligence Dashboard (Strategic view, Portfolio KPIs, Risk Thermometer, Scenario Modeling, Branch Scorecard). *Actions restricted: Read-only for operational modules.*
- **Finance Manager:** Financial Health & Treasury (Cash position, GL Recon, RBM Reporting).
- **Auditor:** Anomaly Detection & Compliance (Read-only, Risk Heatmap, Audit logs).
- **Branch Manager:** Branch Operations (Local targets, Staff productivity, Branch performance).
- **Loan Officer / Field Officer:** Field Work & Operations (Client registry, Collections, Loan entry).
- **Admin:** System Health & User Management.

## Progress Tracking
- [x] Implement MD Executive Dashboard.
- [x] Implement FM Dashboard.
- [x] Implement Auditor Dashboard.
- [x] Implement Branch Manager Dashboard.
- [x] Audit operational screens for role restrictions.
- [x] Verify role-specific experiences via Playwright.

## Findings & Lessons
- Role-specific dashboards significantly improve the "prototype" feel by moving away from a one-size-fits-all UI.
- Use of `canPerformAction` in `js/rbac.js` allows for granular UI control (hiding/showing buttons) beyond just module-level access.
- Porting complex UI elements like "Scenario Modeling" from the static HTML required mapping their interactive elements to state-reactive components in `js/screens/s00-dashboard.js`.
- Standardizing the color palette to the Teal (#0f766e) and Charcoal (#111827) theme maintains brand consistency across new features.
