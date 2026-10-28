# Banking Management System (Learning Project)

A beginner-friendly full-stack banking management **demo** built with:
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)

> **Important:** This is an educational demo, not real banking software. It uses a simple demo login and stores account balances/transactions in Supabase. Do not use real customer data, real passwords, or real money. A production banking system needs professional security review, identity verification, authorization, audit controls, fraud monitoring, and regulated payment integrations.

## Project structure

```text
banking-management-system/
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
└── backend/
    ├── package.json
    ├── .env.example
    ├── schema.sql
    └── src/server.js
```

## 1. Requirements
Install Node.js (LTS) and create a Supabase project at https://supabase.com/.

## 2. Set up Supabase
1. Open your Supabase project → **SQL Editor**.
2. Paste and run the contents of `backend/schema.sql`.
3. Open **Project Settings → API** and copy the Project URL and `service_role` key.
4. In `backend/`, copy `.env.example` to `.env` and fill in the values.
   - Keep `SUPABASE_SERVICE_ROLE_KEY` private. Never put it in frontend code or commit `.env`.

## 3. Install and start backend
Open a terminal in `backend/`:

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:3000`.

## 4. Open frontend
Serve `frontend/` with a local static server (recommended: VS Code Live Server), or run:

```bash
npx serve frontend
```

Then open the URL shown by the server. The frontend calls the API at `http://localhost:3000/api`.

## Demo usage
- Click **Create demo account** to create a sample account.
- The app saves the demo account ID in your browser's local storage.
- Deposit and withdraw buttons create demo transactions in Supabase.
- Resetting browser storage does not delete the database record; use Supabase Table Editor if you want to clean demo data.

## API endpoints
- `GET /api/health` — API status
- `POST /api/accounts` — create a demo account
- `GET /api/accounts/:id` — fetch account and recent transactions
- `POST /api/accounts/:id/deposit` — demo deposit
- `POST /api/accounts/:id/withdraw` — demo withdrawal

## Limitations
This demo intentionally omits real authentication, identity checks, transfers between customers, card/PIN handling, and real payment rails. The API has basic input validation, but is not hardened for production. Never expose the Supabase service-role key to browsers.
