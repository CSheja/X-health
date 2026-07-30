# X-Health Rwanda

This is my capstone project for ALU — a healthcare platform that tries to connect the different pieces of Rwanda's health system (patients, doctors, CHWs, pharmacists, hospital admins, district health officers) that currently don't talk to each other at all.

Full context and requirements are in the SRS doc linked at the bottom of this file.

**Live site:** https://xhealth-frontend.onrender.com

Heads up — the backend is hosted on Render's free tier, so if nobody's used it in a while it goes to sleep. First request after that can take like 30-60 seconds to wake back up. Just refresh if it seems stuck.

## How to log in and try it out

Staff (admin, doctors, pharmacists, CHWs, DHO) all log in from the same page:
https://xhealth-frontend.onrender.com/login

Patients register/login separately here:
https://xhealth-frontend.onrender.com/patient

Test accounts for each role:

- Facility Admin — admin@xhealth.rw / Admin1234!
- Clinician (Dr Uwase) — doctor@xhealth.rw / Doctor1234!
- Pharmacist — pharmacist@xhealth.rw / Pharma1234!
- CHW — chw@xhealth.rw / Chw1234!
- District Health Officer — dho@xhealth.rw / Dho1234!

There's also a demo patient already registered and a demo visit/prescription/dispensing chain set up so you can see the whole flow (clinician logs a visit + prescribes → pharmacist sees it and dispenses → stock goes down automatically).

## What it's built with

- Frontend: React + Tailwind, Framer Motion for the animations, Recharts for the graphs
- Backend: Node/Express
- DB: PostgreSQL through Prisma
- Auth: JWT + bcrypt
- Hosted on Render (backend, frontend, and the Postgres DB are 3 separate Render services)

## Running it locally

You'll need Node (18+), npm, and Postgres installed and running.

```bash
git clone https://github.com/CSheja/X-health.git
cd X-health
```

**Backend first:**

```bash
cd backend
npm install
```

Make a `.env` file in `backend/` with: