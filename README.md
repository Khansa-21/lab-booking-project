# University Resource Hub

University Resource Hub is a full-stack booking system for university labs and shared equipment. It replaces paper registers, messages, and spreadsheets with a clear online process for bookings, approvals, training, and check-ins.

## Live application

- Frontend: https://lab-booking-project.vercel.app/
- Frontend hosting: Vercel
- Backend hosting: Azure App Service
- Database: Azure SQL Database

## The problem

Universities share cameras, labs, projectors, microscopes, and other equipment. Manual booking records can cause double bookings, missed check-ins, untrained users, and unused time slots.

This system helps students and staff find resources, check availability, reserve time, and manage resources fairly.

## Main features

- Public homepage for guests
- Signup, login, logout, and password reset with Brevo email
- Student, Teacher, and Admin roles
- Resource search with daily availability schedules
- Booking validation that prevents time clashes
- Staff approval for selected resources
- Smart alternative resource and time suggestions
- Waitlist with automatic promotion after a released booking
- Training eligibility for specialist equipment
- QR/code check-in
- Automatic no-show release and booking completion checks
- Admin pages for users, resources, approvals, training, check-ins, and operations
- Mobile menu for small screens

## Roles

| Role | What they can do |
| --- | --- |
| Guest | View the homepage, sign up, and sign in |
| Student | Search, reserve, join a waitlist, view eligibility, and show QR check-in |
| Teacher | Student actions plus approvals, training records, and check-ins |
| Admin | Manage users, resources, approvals, training, check-ins, and daily operations |

Public signup creates only a `STUDENT`. Admin accounts are not created from a public browser form.

## Technology used

- Frontend: Angular 22, TypeScript, Reactive Forms, RxJS, Angular Router, QRCode
- Styling: SCSS with global styles and component-scoped styles
- Backend: Node.js, Express 5, TypeScript
- Database: Microsoft SQL Server, Azure SQL Database, Sequelize ORM
- Security: Zod, bcrypt, JWT in HttpOnly cookies, CORS, cookie-parser
- Email: Brevo transactional email API
- Scheduler: node-cron

## System design

```text
Angular frontend on Vercel
        |
        | HTTPS API requests
        v
Express backend on Azure App Service
        |
        | Sequelize ORM
        v
Azure SQL Database
```

The frontend and backend are separate apps. Angular sends HTTP requests such as `/api/reservations`. It does not import backend TypeScript files.

## Booking flow

```text
Find resource
-> Check its schedule
-> Choose a future time
-> Backend checks role, training, duration, and overlap
-> Booking becomes APPROVED or PENDING
-> Student checks in with a QR/code
-> Missed check-in becomes NO_SHOW
-> Released time can promote a waitlist user
```

The time clash rule is:

```text
newStart < existingEnd AND newEnd > existingStart
```

## Project folders

```text
frontend/     Angular pages, services, guards, and layouts
backend/      Express API, database models, migrations, seeders, and services
README.md     Project guide
```

## Styling

- Global styles and shared form/control defaults live in `frontend/src/styles.scss`.
- Page and component styles are kept in adjacent `.scss` files and loaded through Angular component `styleUrl` metadata.
- Angular is configured to use SCSS for component styles; the production build checks component stylesheet size budgets.

## Local setup

### Requirements

- Node.js 22 or newer
- SQL Server Developer Edition and SSMS, or Azure SQL Database
- Brevo account with a verified sender email

### Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:migrate
npm run dev
```

Example local `backend/.env` values:

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

Never push `.env` to GitHub.

### Frontend

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
npm test
npm run db:migrate
npm run db:migrate:status
npm run db:seed
npm run db:seed:ui

# Frontend
npm start
npm run build
npm test -- --watch=false
```

## Password reset

1. User enters an email on `/forgot-password`.
2. Backend creates a one-time token that expires after 15 minutes.
3. The database stores only a hash of that token.
4. Brevo emails the reset link.
5. User creates a new valid password on `/reset-password`.
6. Backend clears the token after use.

The response does not reveal whether an account exists.

## Azure deployment notes

- Vercel builds and hosts the Angular frontend from `frontend/`.
- Azure App Service runs the Express backend from `backend/`.
- Azure SQL Database stores production data.
- Store database details, JWT secret, and Brevo key in Azure App Service environment variables.
- Use `DB_ENCRYPT=true` and `DB_TRUST_SERVER_CERTIFICATE=false` with Azure SQL.
- Add the App Service's outbound IPv4 addresses (including additional outbound addresses) to the Azure SQL firewall. For local development, allow the developer machine's current public IPv4 address separately.
- Confirm the SQL server allows public network access when connecting over the public endpoint and that outbound TCP port 1433 is available on the client network.
- The scheduler runs on backend startup and every minute. On a restart, it catches up missed no-show and completion checks.

## Future improvements

- Monthly and semester reports
- Rate limits for password reset requests
- Waitlist and approval email alerts
- University single sign-on
- A separate production scheduler if the app grows

## Learning value

This project shows Angular structure, TypeScript APIs, SQL relations, migrations, ORM models, validation, authentication, roles, booking logic, email, scheduled jobs, and cloud deployment.
