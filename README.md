# University Resource Hub

A full-stack university resource booking system for shared labs and equipment. It replaces paper registers, messages, and spreadsheets with one clear workflow for availability, reservations, approvals, training, and check-in.

## Problem it solves

Universities commonly share cameras, laboratories, microscopes, projectors, and specialist equipment. Manual records make it hard to prevent double bookings, confirm attendance, manage trained users, or identify unused resource time.

University Resource Hub treats these as operational resources, not shopping products. It helps universities provide fair access and better use their existing resources.

## Features

- Public homepage explaining the platform and workflow
- Secure signup, login, logout, and Brevo password reset
- Student, Teacher, and Admin roles
- Availability-first resource search, schedule, and booking timeline
- Collision-safe booking validation
- Staff approval for restricted resources
- Smart alternative resource/time suggestions
- Waitlist with automatic promotion
- Training eligibility for specialist equipment
- QR/code check-in and automatic no-show release
- Admin management for users, categories, resources, approvals, training, and check-ins
- Daily operations summary: reservations, approvals, maintenance issues, no-shows, and utilization

## Users

| User | Main actions |
| --- | --- |
| Guest | View homepage and sign in/sign up |
| Student | Search, reserve, join waitlist, view eligibility, and show check-in QR |
| Teacher | Student actions plus approvals, training completion, and check-ins |
| Admin | Manage users, categories, resources, approvals, training, check-ins, and operations |

Public signup always creates a `STUDENT`. The browser cannot create an admin account.

## Technology stack

- Frontend: Angular 22, TypeScript, Angular Router, Reactive Forms, RxJS, QRCode
- Backend: Node.js, Express 5, TypeScript
- Database: Microsoft SQL Server with Sequelize ORM
- Security: Zod, bcrypt, JWT in HttpOnly cookies, CORS, cookie-parser
- Email: Brevo transactional email API
- Scheduling: node-cron for local no-show/completion checks

## Architecture

```text
Angular frontend
     |
     | HTTP API requests
     v
Express + TypeScript backend
     |
     | Sequelize ORM
     v
Microsoft SQL Server
```

Frontend and backend are separate applications. Angular calls API URLs such as `/api/reservations`; it never imports backend TypeScript files directly.

## Core booking flow

```text
Search resource
-> Check schedule and availability
-> Reserve a time
-> Backend validates role, training, duration, and overlap
-> Reservation is APPROVED or PENDING
-> Student checks in with QR/code
-> Unused booking becomes NO_SHOW after the grace period
-> Released slot can promote a waitlist user
```

Overlap rule:

```text
newStart < existingEnd AND newEnd > existingStart
```

## Workspace structure

```text
frontend/     Angular UI, pages, services, guards, and layouts
backend/      Express API, models, migrations, seeders, validators, and services
README.md     Project documentation
```

## Local setup

### Requirements

- Node.js 22+
- Microsoft SQL Server Developer Edition
- SQL Server Management Studio (SSMS)
- Brevo account with verified sender email

### Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:migrate
npm run dev
```

Configure `backend/.env`. Never commit it:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
DB_HOST=localhost
DB_PORT=1433
DB_NAME=LabBookingDb
DB_USER=your_sql_login
DB_PASSWORD=your_sql_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=use_a_long_random_secret
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=University Resource Hub
```

Health endpoint: `http://localhost:3000/api/health`

Optional demo equipment:

```powershell
npx sequelize-cli db:seed --seed 20260820040000-seed-demo-equipment.cjs
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Useful commands

```powershell
# Backend
npm run dev
npm run build
npm run db:migrate
npm run db:migrate:status
npm run db:migrate:undo
npm run db:seed

# Frontend
npm start
npm run build
npm test -- --watch=false
```

## Password reset flow

1. User enters their email on `/forgot-password`.
2. Backend creates a random one-time token that expires in 15 minutes.
3. Only the token hash is saved in SQL Server.
4. Brevo emails the reset link.
5. User sets a valid new password on `/reset-password`.
6. Backend updates the bcrypt password hash and clears the token.

The email response is intentionally generic: it does not reveal whether an account exists.

## Deployment plan

```text
GitHub repository
├── frontend/ -> Vercel
└── backend/  -> Render Web Service
                  |
                  -> Azure SQL Database
```

- Vercel hosts Angular.
- Render hosts Express.
- Azure SQL Database is required in production because Render cannot reach SQL Server on a personal PC.
- Keep secrets only in Render environment variables, never GitHub or Angular files.
- Configure final-domain CORS and cookies before production.
- Use an always-running backend or a separate Render Cron Job for reliable no-show scheduling because free services can sleep.

## Future improvements

- Monthly/semester analytics and exportable reports
- Rate limiting for reset requests
- Brevo templates and delivery-event webhooks
- University SSO
- Waitlist and approval email notifications
- Dedicated production scheduler

## Learning value

This project demonstrates Angular feature structure, TypeScript APIs, SQL relations, migrations, ORM models, validation, authentication, role authorization, transactional booking logic, email delivery, scheduled jobs, and deployment planning.
