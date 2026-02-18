# Cyber Security Scanner

A full-stack cybersecurity platform for malware scanning and network security analysis. It consists of a Flask REST API backend, a React/TypeScript frontend dashboard, and a Python desktop scanner GUI that can be compiled into a Windows executable.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Overview

The platform provides:

- **User authentication** — JWT-based register/login/password change
- **Malware scanning** — Desktop scanner (Windows `.exe`) that runs quick, directory, or full scans and uploads results to the cloud
- **Network security scanning** — Captures and stores network scan results per user
- **Dashboard** — Web interface to view scan history, network results, security education, and manage profile
- **Scanner download** — Authenticated users can download the latest scanner executable

---

## Project Structure

```
Cyber-Seacurity-Scanner/
├── .gitignore
├── Cyber-Seacurity-Scanner.code-workspace  # VS Code multi-root workspace
├── installation.txt                        # Manual setup instructions
│
├── backend/                                # Flask REST API
│   ├── app.py                              # Application factory (create_app)
│   ├── database.py                         # SQLAlchemy db instance
│   ├── models.py                           # ORM models
│   ├── requirements.txt                    # Python dependencies
│   ├── Procfile                            # Heroku process definition
│   ├── runtime.txt                         # Python runtime version
│   ├── routes/
│   │   ├── auth.py                         # /auth — register, login, change-password
│   │   ├── upload.py                       # /scan — upload results, fetch results
│   │   └── download.py                     # /download — scanner executable
│   └── migrations/                         # Alembic database migrations
│       ├── alembic.ini
│       ├── env.py
│       ├── script.py.mako
│       └── versions/
│           └── 3bbcfb9579a7_initial_migration.py
│
├── frontend/                               # React + TypeScript + Vite SPA
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── components.json                     # shadcn/ui configuration
│   ├── vercel.json                         # Vercel deployment config
│   ├── Procfile
│   ├── public/
│   │   ├── _redirects                      # SPA redirect rule for Netlify/Vercel
│   │   └── vite.svg
│   └── src/
│       ├── main.tsx                        # Entry point
│       ├── App.tsx                         # Root component & route guards
│       ├── App.css
│       ├── index.css
│       ├── vite-env.d.ts
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── auth/
│       │   │   ├── login.tsx               # Login form component
│       │   │   └── register.tsx            # Registration form component
│       │   ├── dashboard/
│       │   │   ├── header.tsx              # Top navigation bar
│       │   │   ├── malwareBaneer.tsx       # Malware scan status banner
│       │   │   └── sidebar.tsx             # Navigation sidebar
│       │   └── ui/                         # shadcn/ui primitive components
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       │       ├── badge.tsx
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── checkbox.tsx
│       │       ├── dialog.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── progress.tsx
│       │       ├── radio-group.tsx
│       │       ├── table.tsx
│       │       └── tabs.tsx
│       ├── layouts/
│       │   └── dashboardLayout.tsx         # Shared layout with sidebar & header
│       ├── pages/
│       │   ├── AuthForm.tsx                # Login / Register page
│       │   ├── Dashboard.tsx               # Main dashboard overview
│       │   ├── Malware.tsx                 # Malware scan results page
│       │   ├── Network.tsx                 # Network scan results page
│       │   ├── Profile.tsx                 # User profile & password change
│       │   └── SecurityEducation.tsx       # Security education resources
│       └── util/
│           └── malware_recommendation.json # Static malware remediation data
│
└── scanner/                                # Python desktop scanner (Windows)
    ├── application.py                      # Entry point — manages login & scanner GUI
    └── application.spec                    # PyInstaller build specification
```

---

## Tech Stack

| Layer       | Technology                                                              |
|-------------|-------------------------------------------------------------------------|
| Backend     | Python 3, Flask 3, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-Migrate  |
| Database    | MySQL (production / AWS RDS), SQLite (local development)                |
| Frontend    | React 19, TypeScript, Vite 6, TailwindCSS 4, shadcn/ui, Axios          |
| Desktop App | Python, Tkinter, PyInstaller                                            |
| Hosting     | Backend → Heroku, Frontend → Vercel, Scanner → AWS S3                  |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- pip
- npm

---

## Installation & Setup

### Backend

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables (copy and fill in .env)
# See Environment Variables section below

# 5. Initialise the database (first run only)
flask db init
flask db migrate
flask db upgrade

# 6. Start the development server
flask run
```

The API will be available at `http://localhost:5000`.

### Frontend

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint            | Auth Required | Description                  |
|--------|---------------------|---------------|------------------------------|
| POST   | `/auth/register`    | No            | Register a new user          |
| POST   | `/auth/login`       | No            | Login and receive JWT token  |
| GET    | `/auth/protected`   | Yes           | Verify token                 |
| POST   | `/auth/change-password` | Yes       | Change user password         |

### Scan — `/scan`

| Method | Endpoint                  | Auth Required | Description                        |
|--------|---------------------------|---------------|------------------------------------|
| POST   | `/scan/upload`            | Yes           | Upload malware scan result         |
| POST   | `/scan/upload-network`    | Yes           | Upload network scan result         |
| GET    | `/scan/result`            | Yes           | Retrieve malware scan results      |
| GET    | `/scan/network-result`    | Yes           | Retrieve network scan results      |

### Download — `/download`

| Method | Endpoint                    | Auth Required | Description                          |
|--------|-----------------------------|---------------|--------------------------------------|
| GET    | `/download/scannerGUI.exe`  | Yes           | Get S3 download URL for scanner exe  |

### Health

| Method | Endpoint   | Description             |
|--------|------------|-------------------------|
| GET    | `/`        | API status check        |
| GET    | `/health`  | Health check with env   |

---

## Database Models

| Model          | Description                                           |
|----------------|-------------------------------------------------------|
| `User`         | Registered users with hashed passwords and roles      |
| `Scan`         | Malware/vulnerability scan records linked to users    |
| `ScanDetails`  | Individual issues found within a scan                 |
| `Recommendations` | Remediation suggestions per scan issue            |
| `Files`        | Uploaded scan result files (quick / directory / full) |
| `CheckNetwork` | Uploaded network scan results                         |
| `ActivityLog`  | User action history                                   |
| `Notification` | User notifications (read / unread)                    |

---

## Deployment

### Backend (Heroku)

The `Procfile` in `backend/` starts the app with Gunicorn:

```
web: gunicorn 'app:create_app("production")'
```

Set the required environment variables in Heroku's config vars (see below).

### Frontend (Vercel)

The `vercel.json` and `public/_redirects` handle SPA routing. Connect the `frontend/` directory to a Vercel project and set the `VITE_API_URL` environment variable.

---

## Environment Variables

### Backend

| Variable         | Description                                      |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | Full database connection URL                     |
| `DB_USER`        | Database username (fallback)                     |
| `DB_PASSWORD`    | Database password (fallback)                     |
| `DB_HOST`        | Database host (fallback)                         |
| `DB_NAME`        | Database name (fallback)                         |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens                |
| `JWT_EXPIRY`     | Token expiry in seconds (default: 3600)          |
| `UPLOAD_FOLDER`  | Path for temporary file uploads (default: `uploads`) |
| `FLASK_ENV`      | `development` or `production`                    |
| `PORT`           | Server port (default: 5000)                      |

### Frontend

| Variable        | Description                     |
|-----------------|---------------------------------|
| `VITE_API_URL`  | Base URL of the backend API     |
