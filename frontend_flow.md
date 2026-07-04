# Frontend Architecture & Component Directory

A modern, responsive Single Page Application (SPA) built using React. The client interface combines the structural design system of **Material UI (MUI)** with the styling utilities of **Tailwind CSS**. User inputs are managed via **Formik** and validated client-side with **Yup** schemas, with real-time status updates delivered via **React-Toastify**.

---

## Table of Contents
1. [Frontend Tech Stack](#1-frontend-tech-stack)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Routing & Authentication Guards](#3-routing--authentication-guards)
4. [Form Management & Validation Schemas (Formik + Yup)](#4-form-management--validation-schemas-formik--yup)
5. [Toast Notification Guidelines (React-Toastify)](#5-toast-notification-guidelines-react-toastify)
6. [API Client & Interceptor Configuration](#6-api-client--interceptor-configuration)
7. [UI Design & Page Layouts (MUI + Tailwind)](#7-ui-design--page-layouts-mui--tailwind)

---

## 1. Frontend Tech Stack

*   **View Layer:** React 18+ (Vite Build Tool)
*   **Routing:** React Router DOM v6 — Implements declarative browser routing and role-based route guards.
*   **UI Components:** Material UI (MUI) v5 — Provides interactive grids, tables, dialogs, form inputs, buttons, and drawer layouts.
*   **CSS Framework:** Tailwind CSS v3 — Handles custom spacings, animations, backgrounds, glassmorphism panels, and layouts.
*   **Form Control:** Formik — Manages form state, submission lifecycle, dirty/pristine checks, and error rendering.
*   **Data Validation:** Yup — Declares schema validations matching the backend database constraints.
*   **Notification Engine:** React-Toastify — Displays interactive toast popups for async action successes, warnings, and errors.
*   **API Client:** Axios — Handles REST calls, request timeouts, and token authentication headers.

---

## 2. Project Folder Structure

```
src/
├── assets/             # Static SVGs, images, and brand assets
├── components/         # Shared presentational UI elements
│   ├── Layouts/        # Global Navigation, Sidebar drawers, and Footers
│   ├── Common/         # Custom Buttons, Protected File Downloaders, Loading spin indicators
│   └── Form/           # MUI Custom TextFields, FileDropZones, and OTPInput inputs
├── contexts/           # Global React Contexts (AuthContext, ThemeContext)
├── hooks/              # Custom React Hooks (useAuth, useClaims, useToast)
├── pages/              # Routed view containers
│   ├── Auth/           # Login, Register, and Multi-Step 2FA validation pages
│   ├── Customer/       # Claim Submit, Claim Upload, and Status Tracking dashboards
│   ├── Processor/      # Pending Queue workspace and Claim Review panel
│   ├── Manager/        # High-Value Claims Approval and Escalations console
│   └── Auditor/        # Audit Logs search engine and PDF report exports
├── services/           # Axios instance configuration and API request declarations
├── styles/             # Global Tailwind entry and theme adjustments
└── utils/              # Helper functions (JWT decoders, File converters, Date formatters)
```

---

## 3. Routing & Authentication Guards

The application uses **React Router DOM** to secure routes based on token validation and user permissions (RBAC).

```
                 [Access Root Path (/)]
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
    [Public Routes]               [Guarded Access]
     - /login                      - Requires Valid JWT
     - /register                   - Checks JWT Expiration
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   [Role: Customer]              [Role: Processor]             [Role: Manager]
    - /dashboard                  - /processor/queue            - /manager/escalations
    - /claims/new                 - /processor/tasks/{id}       - /manager/override
    - /claims/{id}/track          - /processor/history          - /manager/logs
```

### Route Definitions
*   **Public Portal:**
    *   `/login` — Authenticates user credentials. If 2FA is active, shifts view step to lock input until OTP verify endpoint succeeds.
    *   `/register` — Registers new account, then routes to Login.
*   **Customer Workspace:**
    *   `/dashboard` — Lists claims submitted by the client with real-time status badges.
    *   `/claims/new` — Open Formik submission wizard to fill claim parameters and upload files.
    *   `/claims/{id}/track` — Shows progress timeline mapping the current workflow stage.
*   **Processor Queue:**
    *   `/processor/queue` — Display table of pending tasks. Processors claim tasks directly.
    *   `/processor/tasks/{id}` — Workstation showing claim details, list of uploaded PDF receipts, and approval action buttons.
*   **Manager Console:**
    *   `/manager/escalations` — Focused view displaying high-value ($5,000+) claims and flagged risk files.
*   **Auditor Workspace:**
    *   `/auditor/logs` — Search dashboard for audit log logs. Exports compliance records.

---

## 4. Form Management & Validation Schemas (Formik + Yup)

All input validations are processed client-side prior to API submissions to prevent network overhead and validation errors.

### 4.1 Login & Two-Factor Authentication Form
*   **Formik State Fields:** `username`, `password`, `otpCode`, `mfaTransactionId`.
*   **Yup Validation Constraints:**
    *   `username`: Required string, must be a valid email format.
    *   `password`: Required string, minimum of 8 characters.
    *   `otpCode` (Only evaluated on Step 2): Required numeric string, must be exactly 6 characters.

### 4.2 Registration Form
*   **Formik State Fields:** `username`, `email`, `password`, `confirmPassword`, `role`.
*   **Yup Validation Constraints:**
    *   `username`: Required alphanumeric string (3 to 30 characters).
    *   `email`: Required valid email address.
    *   `password`: Required string (minimum 8 characters, containing at least one uppercase letter, one digit, and one special character).
    *   `confirmPassword`: Required string, must match the `password` field values.
    *   `role`: Required selection value matching backend user roles.

### 4.3 Claim Submission Form
*   **Formik State Fields:** `policyNumber`, `claimAmount`, `lossType`, `lossDate`, `description`, `files`.
*   **Yup Validation Constraints:**
    *   `policyNumber`: Required alphanumeric pattern validation matching structure rules (e.g., `POL-[0-9]{8}`).
    *   `claimAmount`: Required positive decimal number greater than 0.
    *   `lossType`: Required dropdown selection value.
    *   `lossDate`: Required date selector value, must not be set in the future.
    *   `description`: Required text string (minimum 20 characters, maximum 500 characters).
    *   `files`: Required list of documents. Validates file list size (minimum 1 document required) and checks extension restrictions (PDF, PNG, JPEG only).

---

## 5. Toast Notification Guidelines (React-Toastify)

React-Toastify triggers immediate response alerts overlaying the active user interface:

### 5.1 Success Alerts
*   *MFA Sent:* "2FA Authentication code successfully sent to email." (Triggered on Step 1 authentication completion).
*   *Session Initiated:* "Login successful! Welcome to your dashboard."
*   *Claim Submitted:* "Claim created successfully under ID: [Claim_ID]."
*   *Task Processed:* "Decision recorded. Claim has been moved to queue."

### 5.2 Warning Alerts
*   *Document Requested:* "Additional documentation has been requested. Review file requirements."
*   *File Upload In-Progress:* "Uploading large documents... Please keep window active."
*   *Task Locked:* "This task is already claimed by another user."

### 5.3 Error Alerts
*   *Invalid Login:* "Invalid credentials. Please verify username and password."
*   *OTP Invalid:* "MFA token incorrect or expired. Resubmit new code."
*   *Fraud Warning:* "System flag warning detected. This claim has been sent to manager evaluation."
*   *File Extension Rejected:* "Selected file format is invalid. Upload PDF or image only."
*   *Network Timeout:* "Service timeout. Please try again later."

---

## 6. API Client & Interceptor Configuration

The frontend interacts with services through a unified HTTP client wrapper:

*   **Stateless Auth Interceptor:** Attaches active JWT tokens automatically from local state to the `Authorization: Bearer <Token>` HTTP header.
*   **Automatic 401 Challenge handler:** Intercepts 401 Unauthorized errors from the backend. Automatically clears local browser storage (Redis logout sync) and redirects users back to `/login` with an expired session toast notification.
*   **Spring Cache Syncing:** Triggers query param cache-invalidation alerts during modification actions (PUT/DELETE) to match Spring Cache Redis state.

---

## 7. UI Design & Page Layouts (MUI + Tailwind)

Components use a clean, modern aesthetic:

*   **Responsive Grids (MUI Grid + Tailwind `md:`, `lg:`):** Layout adjustments shifting from mobile displays to multi-column desktop monitors.
*   **Data Displays (MUI Table + Tailwind transitions):** Features pagination, status-based row highlighting, sorting tags, and hover state transitions.
*   **Form Controls (MUI Textfield + Formik integration):** Interactive inputs showing invalid fields with custom error messages and green check marks for valid data inputs.
*   **Theme Integration:** Integrates Tailwind styles with Material UI's Theme Provider configuration to ensure color palettes, fonts, and dark-mode variables align across custom component interfaces.
