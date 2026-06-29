# Postman Clone

Postman Clone is a web-based API client modeled after Postman. It allows developers to construct, send, and inspect HTTP requests, organize requests into collections, manage environments with dynamic variables, and review historical requests.

This repository contains both the FastAPI Python Backend and the Next.js TypeScript Frontend.

![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=open-source-initiative&logoColor=white)
![Made with FastAPI](https://img.shields.io/badge/Made%20with-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Built with Tailwind CSS](https://img.shields.io/badge/Built%20with-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## Live Deployments

[![Frontend Web App](https://img.shields.io/badge/Frontend_Web_App-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://postman-clone-theta.vercel.app/)  
[![Backend API Gateway](https://img.shields.io/badge/Backend_API_Gateway-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://postman-clone-j3i7.onrender.com)

---

## Project Structure

```text
postman-clone/
├── apps/
│   ├── api/                            # FastAPI backend API workspace
│   │   ├── alembic/                    # Database migration configurations
│   │   ├── src/                        # FastAPI source files
│   │   │   ├── api/                    # Endpoint routers (collection, environment, history, request, settings)
│   │   │   ├── core/                   # Configurations and settings
│   │   │   ├── database/               # Database connection and session setup
│   │   │   ├── middleware/             # Logging and exception handler middlewares
│   │   │   ├── models/                 # SQLAlchemy ORM models (Collection, SavedRequest, Environment, Variable, History, Settings)
│   │   │   ├── repositories/           # Database access layer repositories
│   │   │   ├── schemas/                # Pydantic schemas for request validation and serialization
│   │   │   ├── services/               # Business logic services
│   │   │   └── utils/                  # Utility helpers
│   │   ├── requirements.txt            # Python dependencies
│   │   └── alembic.ini                 # Migration config
│   └── web/                            # Next.js frontend React workspace
│       ├── src/                        # Next.js src directory
│       │   ├── app/                    # Next.js app router pages and layouts
│       │   │   ├── layouts/            # Layout systems (AppLayout, TabsBar)
│       │   │   ├── layout.tsx          # Root HTML layout template
│       │   │   └── page.tsx            # Main application workspace view
│       │   ├── components/             # Reusable UI components
│       │   ├── features/               # Feature modules (collections, environments, history, request-builder, response-viewer, settings)
│       │   ├── hooks/                  # Custom React hooks
│       │   ├── services/               # Axios API clients
│       │   ├── store/                  # Zustand state management stores
│       │   └── index.css               # Global Tailwind CSS styles
│       ├── package.json                # Frontend dependencies and scripts
│       └── tailwind.config.js          # Tailwind CSS configuration
```

---

## Key Features

### Backend (FastAPI)
* HTTP Client Engine - Internal service using HTTPX to construct and dispatch custom HTTP requests with variable timeouts and redirect followers.
* Collections Management - Endpoints to create, read, update, and delete request collections and folder hierarchies.
* Environment Variables Manager - Dynamic variable interpolation engine to evaluate environment variables stored in SQLite.
* Request History Logging - Automated logging of executed requests for auditing, reporting, and retrieval.
* Database Migration Pipeline - Structured database migrations using Alembic and SQLAlchemy ORM.

### Frontend (Next.js + Tailwind CSS)
* Interactive Request Builder - Interface for selecting HTTP methods, editing query parameters, adding headers, and configuring raw request bodies.
* Integrated Monaco Code Editor - Support for request and response body viewing with syntax highlighting and automatic JSON formatting.
* Collections Workspace - Left panel navigation to save requests into structured, collapsible collections.
* Dynamic Environment Switcher - Dropdown selectors to swap between development, staging, or production environments.
* State Synchronization - Fast, client-side state handling utilizing Zustand stores.
* Responsive Interface - A workspace layout featuring collapsible side panels and tabbed workspaces.

---

## Tech Stack

| Component | Technologies | Description |
|---|---|---|
| Frontend | React, Next.js, TypeScript, Tailwind CSS, Monaco Editor, Zustand, Axios, TanStack Query | Single-Page Application client UI |
| Backend | FastAPI, SQLAlchemy, Alembic, Uvicorn, HTTPX, Pydantic, SQLite | Asynchronous REST APIs, request engine, and relational database |

---

## Environment Variables

### Backend Setup (apps/api/.env)
Configure the following keys in a .env file within the apps/api/ directory:
```env
APP_NAME=Postman Clone API
APP_ENV=development
HOST=0.0.0.0
PORT=8000
DEBUG=True

DATABASE_URL=sqlite:///./postman.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
ALLOWED_HOSTS=*

DEFAULT_TIMEOUT=10.0
DEFAULT_VERIFY_SSL=True
DEFAULT_FOLLOW_REDIRECTS=True
DEFAULT_MAX_RESPONSE_SIZE=10485760
```

### Frontend Setup (apps/web/.env)
Configure the following keys in a .env file within the apps/web/ directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites
* Python (v3.10+)
* Node.js (v18+) and npm
* Git

---

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd apps/api
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file (see the Environment Variables section for configuration details).

5. Run database migrations and start the server:
   ```bash
   alembic upgrade head
   python -m src.main
   ```

   The backend API documentation will be available at http://localhost:8000/docs.

---

### Frontend Setup

1. Open a new terminal and navigate to the web folder:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The web app will be available at http://localhost:3000.

---

## Quality Control & Linting

### Frontend Linting
To check and analyze the codebase using Oxlint:
```bash
cd apps/web
npm run lint
```

---

## License & Contact

This project is licensed under the MIT License.

For questions or collaboration opportunities:
* Git Repository: https://github.com/shk-khalid/postman-clone.git
