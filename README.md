# X-Health Rwanda

This is a healthcare platform that tries to connect the different pieces of Rwanda's health system (patients, doctors, CHWs, pharmacists, hospital admins, district health officers) that currently don't talk to each other at all.

Full context and requirements are in the SRS doc linked at the bottom of this file.

**Live site:** https://xhealth-frontend.onrender.com

The backend is on Render's free tier, so it sleeps after inactivity. First request after idle time takes 30-60 seconds to wake up — not a bug, just the platform. Everything's fast after that first request.


## The problem this is trying to solve

Rwanda's health system is fragmented across facility tiers — a patient seen at a health center for something has no record that follows them if they're referred to a district hospital. CHWs at the community level are still mostly on paper. There's no single platform that a patient, a doctor, a CHW, a pharmacist, and a district health officer can all use for their piece of the same care pathway. That's what this project tries to build a version of, scoped down to what's realistic for a pilot.

Full detail on this (with sources, stakeholder analysis, etc.) is in the SRS.

## Roles and what each one can actually do

**Patient** — self-registers with national ID, books nothing yet directly but can view their own EHR (visit history, prescriptions), joins telemedicine sessions.

**Clinician** — sees their own patients (built from actual visit history, not everyone in the system), logs in-person visits with SOAP notes and ICD-10 codes, prescribes medication, sends referrals to other facilities, runs telemedicine consultations with a live WebRTC video call and issues prescriptions during the session.

**Pharmacist** — sees prescriptions scoped to their own facility, dispenses them, manages stock (can restock — which adds to current quantity — or set an exact count for inventory corrections). Dispensing a prescription automatically decrements stock for that medication if it's being tracked.

**CHW** — logs home visits, reports disease cases that feed into the district surveillance dashboard.

**Facility Admin** — sees only their own facility's staff and stats (not the whole system), manages user accounts for their facility.

**District Health Officer** — views aggregated case data across all facilities, district breakdowns, and gets flagged when a condition hits 3+ cases in the same district (basic outbreak alert logic).

## Demo accounts (live site)

Staff login: https://xhealth-frontend.onrender.com/login
Patient login/register: https://xhealth-frontend.onrender.com/patient


|
 Role 
|
 Email 
|
 Password 
|
|
---
|
---
|
---
|
|
 Facility Admin 
|
 admin@xhealth.rw 
|
 Admin1234! 
|
|
 Clinician (Dr Uwase) 
|
 doctor@xhealth.rw 
|
 Doctor1234! 
|
|
 Pharmacist 
|
 pharmacist@xhealth.rw 
|
 Pharma1234! 
|
|
 CHW 
|
 chw@xhealth.rw 
|
 Chw1234! 
|
|
 District Health Officer 
|
 dho@xhealth.rw 
|
 Dho1234! 
|
|
 Demo Patient 
|
 demopatient3@xhealth.rw 
|
 Demo1234! 
|

The demo patient already has a logged visit with two prescriptions attached — one already dispensed (so you can see stock actually went down), one still pending. There's also a CHW visit log and a reported case already in the system so the DHO's Surveillance page isn't empty.

## Architecture

Fairly standard split: React frontend talks to an Express API over REST, API talks to Postgres through Prisma. Nothing server-side rendered — the frontend is a pure SPA.

Browser (React SPA)
|
| HTTPS / axios / JWT in Authorization header
v
Express API (/api/v1/...)
|
| Prisma ORM
v
PostgreSQL


Auth is JWT-based — login returns a token, stored in localStorage, sent as a Bearer token on every request after that. Tokens expire after 30 minutes, so if you're testing and it's been a while, you'll need to log back in (this tripped me up more than once while building).

Role-based access is enforced both client-side (routes redirect based on role) and server-side (each protected route checks `req.user.role`) — client-side alone isn't real security since anyone can read the JS, so the actual enforcement lives in the API.

## Database design notes

A few decisions worth explaining:

- `User` is the base table for everyone (patients, clinicians, staff) — role-specific data (like a Clinician's specialty, or a Patient's national ID) lives in separate linked tables (`Clinician`, `Patient`, `CHW`), connected 1-to-1 back to `User`.
- Both `User` and `Clinician` have their own `facilityId` — this tripped me up during deployment, because facility-scoped data (like which prescriptions a pharmacist sees) is actually scoped through the *Clinician's* facility, not the User's. Worth knowing if you're extending this.
- `Stock` is scoped per facility per medication (unique constraint on `facilityId + medication`), so the same drug can have different stock counts at different facilities.

Full schema is in `backend/prisma/schema.prisma`.

## Tech stack

- **Frontend:** React 18, Tailwind CSS, Framer Motion (animations), Recharts (surveillance/dashboard charts)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt
- **Video:** Browser-native WebRTC for telemedicine (no external service)
- **Hosting:** Render — backend as a web service, frontend as a static site, Postgres as a managed database, three separate services talking to each other

## Project structure

X-health/
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma # data model
│ │ └── migrations/
│ ├── src/
│ │ ├── controllers/ # one per feature area (auth, patient, clinician, pharmacy, chw, surveillance, admin, appointment, telemedicine)
│ │ ├── routes/
│ │ ├── middleware/
│ │ │ └── auth.middleware.js # JWT verification, attaches req.user
│ │ └── app.js # route mounting
│ └── scripts/ # one-off data fix/seed scripts used during development
├── frontend/
│ └── src/
│ ├── pages/ # one page per role/portal
│ ├── components/
│ │ ├── layout/ # Sidebar, Navbar, Layout wrapper
│ │ └── ui/
│ ├── context/
│ │ └── AuthContext.js # holds logged-in user, login/logout
│ └── services/
│ └── api.js # axios instance, attaches auth token


## Running it locally

Needs Node 18+, npm, and Postgres running locally.

```bash
git clone https://github.com/CSheja/X-health.git
cd X-health
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

DATABASE_URL="postgresql://your_username:your_password@localhost:5432/xhealth_db"
JWT_SECRET="any_random_string_for_local_dev"
PORT=5000


Create the database if it doesn't exist yet:
```bash
psql -U postgres -c "CREATE DATABASE xhealth_db;"
```

Push the schema:
```bash
npx prisma db push
```

Run it:
```bash
npm run dev
```

Check http://localhost:5000 — should return `{"message": "X-Health Rwanda API is running"}`.

### Frontend

New terminal:
```bash
cd frontend
npm install
npm start
```

Opens at http://localhost:3000.

### Getting your first account locally

DB starts empty. Register a patient directly through the app at http://localhost:3000/patient. For a staff/admin account, either:
- Run `npx prisma studio` from `backend/` (opens a DB browser at localhost:5555) and insert a `User` row manually with `role: ADMIN`, or
- Write a quick one-off script similar to the ones in `backend/scripts/` — that's how I bootstrapped my own admin accounts both locally and in production.

## API overview

Base path: `/api/v1`

- `/auth` — register, login, get current user
- `/patients` — CRUD for patient records (admin/clinician access)
- `/clinician` — clinician-scoped: their appointments, their patients, logging visits, sending referrals
- `/pharmacy` — prescriptions and stock, scoped by facility
- `/chw` — CHW visit logs and case reports, scoped to the logged-in CHW
- `/surveillance` — aggregated case data and stats for DHO view
- `/admin` — user management, facility stats
- `/appointments` — booking and status updates
- `/telemedicine` — starting/ending video sessions, which also creates the underlying Visit + Prescription records

Every route except `/auth/login` and `/auth/register` requires a `Bearer` token.

## Deployment

Three Render services, all connected to this repo, auto-deploy on push to `main`:

- **Backend** (web service) — root dir `backend`, build `npm install && npx prisma generate`, start `npm run start`
- **Frontend** (static site) — root dir `frontend`, build `npm install && npm run build`, publish dir `build`
- **Database** — Render managed Postgres, free tier

The frontend needs a rewrite rule configured in Render's dashboard (Settings → Redirects/Rewrites, not a `_redirects` file — that's a Netlify convention and doesn't work on Render, learned that the hard way): source `/*`, destination `/index.html`, action Rewrite. Without it, refreshing on any route other than the homepage returns a 404, since Render otherwise looks for a literal file at that path.

Environment variables:
- `DATABASE_URL` (backend) — Render's Internal Database URL for the Postgres instance
- `JWT_SECRET` (backend) — separate, random string, not the same as local
- `REACT_APP_API_URL` (frontend) — the deployed backend's API base, `https://x-health.onrender.com/api/v1`

To apply schema changes to the production database from a local machine, run Prisma commands with the `DATABASE_URL` temporarily overridden to point at Render's *External* Database URL (different from the internal one — internal only works from within Render's own network):

```bash
DATABASE_URL="<external-url>" npx prisma db push
```

## Known limitations

Being upfront about what's not built, since a lot of it is scoped MED/LOW priority in the SRS for a pilot rather than being oversights:

- No 2FA
- No SMS integration (Africa's Talking) — appointment reminders don't actually send anything right now
- National ID field accepts any string — no real NIDA API verification
- No offline mode for CHWs — needs a live connection
- No DHIS2 export
- No drug interaction/allergy checking
- Mobile responsiveness isn't done — the layout is desktop-first right now and breaks on small screens
- Referrals can be created but there's no page to browse the list of sent/received referrals yet
- The general admin Dashboard page still needs a couple of real-data wire-ups I ran out of time for (Facility Overview for facility admins is fully real, main Dashboard for super admin is partially real)

## A few things that were harder than expected

Worth noting for anyone reading this as a fellow student, not just for grading — a couple of bugs took a while to track down and are the kind of thing I'd watch for building something similar:

- Facility-scoped data has to be scoped through the right relation. `User.facilityId` and `Clinician.facilityId` are separate fields, and a few features (like which prescriptions a pharmacist can see) depend on the *Clinician's* one specifically — easy to update one and forget the other exists.
- Registration flows that create more than one linked record (User → Patient → EHR) need to happen in one place. I initially had the frontend calling two separate endpoints to register a patient, which caused a race condition/duplicate-creation bug once the backend was also updated to auto-create the Patient record on its own.
- Render's static hosting doesn't read a `_redirects` file the way Netlify does — redirect/rewrite rules have to be set in Render's own dashboard instead.

## SRS

https://docs.google.com/document/d/1TdtACSSvF0iAhaMrp8UwHt6Nv40jypPqDt_GOlIJJK8/edit?usp=sharing 
