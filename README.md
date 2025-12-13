# Sweet Shop Management System

This repository contains a full-stack Sweet Shop Management System: a secure RESTful backend API and a modern single-page frontend application.

Project scope (brief)
- The backend handles authentication, authorization (USER / ADMIN), CRUD operations for sweets, and inventory management (purchase + restock) using atomic DB operations to prevent race conditions.
- The frontend is a responsive React SPA that allows users to browse sweets, search and filter, purchase items, and — for admin users — manage inventory.

Repository layout
- `backend/` — Node.js + TypeScript + Express + Mongoose API server (separate project folder)
- `frontend/` — Vite + React single-page application (separate project folder)

---

## a) Clear explanation of the project

The Sweet Shop Management System is a small e-commerce style application focused on managing and selling sweets. It demonstrates:

- Secure user authentication (registration, login) with passwords hashed using bcrypt.
- JWT-based session management and middleware to protect routes.
- Role-based authorization (USER vs ADMIN) to restrict inventory management operations.
- A `Sweet` resource containing `name`, `category`, `price`, and `quantity` with RESTful CRUD endpoints.
- Inventory operations including atomic purchase (decrement) and admin-only restock (increment) to preserve consistency under concurrent requests.
- A React single-page frontend that consumes the API, supports search/filter, purchase flows, and an admin panel for inventory management.

---

## b) Detailed instructions to set up and run the project locally

Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (Atlas recommended) and its connection string

Backend — setup & run

1. Open a terminal and change to the backend folder:

```powershell
cd backend
```

2. Install dependencies:

```powershell
npm install
```

3. Create and edit your environment file:

```powershell
copy .env.example .env
# Edit .env and set values:
# MONGODB_URI=mongodb+srv://<user>:<pass>@.../sweetshop
# JWT_SECRET=your_strong_secret_here
# PORT=5000
```

4. Start the backend in development mode:

```powershell
npm run dev
```

The API base will be `http://localhost:5000/api` by default.

Frontend — setup & run

1. Open a second terminal and change to the frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. (Optional) Create a `.env.local` to point the frontend at your backend API:

```powershell
# .env.local
VITE_API_URL="http://localhost:5000/api"
```

4. Start the frontend dev server:

```powershell
npm run dev
```

Open the Vite dev URL printed to the console (commonly `http://localhost:5173`).

Notes and troubleshooting

- Run `npm install` separately inside `backend/` and `frontend/` — do not run it in the repository root.
- If using Atlas, add your IP to Network Access or allow access from anywhere during development (not recommended for production).
- Ensure `JWT_SECRET` is configured in `.env` so tokens can be signed and verified correctly.

---

## c) Screenshots of the final application

To include screenshots of the running application, place image files under `docs/screenshots/` and reference them here. Suggested captures:

- `docs/screenshots/dashboard.png` — the main dashboard showing a grid of sweets.
- `docs/screenshots/sweet-card.png` — a single sweet card, showing price and `Out of Stock` state when quantity is zero.
- `docs/screenshots/admin-panel.png` — the admin panel with add/restock/delete functionality.

Example Markdown to embed images:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
![Sweet Card](docs/screenshots/sweet-card.png)
![Admin Panel](docs/screenshots/admin-panel.png)



---

## d) My AI Usage

Below I describe which AI tools were used, how they were used, and a short reflection on their impact.

1) Which AI tools I used

- GitHub Copilot — used for in-editor code suggestions and to accelerate boilerplate and small function implementations.
- ChatGPT (assistant) — used interactively to scaffold files, generate controller and middleware code, design API endpoints, draft frontend components, and to produce documentation and run instructions.

2) How I used these tools

- I asked the assistant to scaffold project structure and produce configuration files such as `package.json` and `tsconfig.json` for both backend and frontend projects.
- I used the assistant to generate Mongoose models for `User` and `Sweet` with TypeScript typings and schema constraints.
- I requested Express controllers for authentication (registration + login using bcrypt and JWT) and for sweets management (create, list, update, delete, purchase, restock), including meaningful HTTP status codes and error messages.
- I used the assistant to create middleware that validates JWTs and enforces admin-only routes.
- I used the assistant to scaffold React pages and components (`AuthContext`, `Login`, `Register`, `Dashboard`, `AdminPanel`, `SweetCard`) and to wire Axios integration for API calls.
- I used AI to draft the README content and step-by-step run instructions.

3) Reflection on how AI impacted my workflow

- Speed & productivity: AI greatly reduced time spent on repetitive tasks (project scaffolding, route wiring, basic CRUD controllers), enabling faster iteration on features and design.
- Consistency: The suggestions helped keep structure and patterns consistent across the backend and frontend.
- Review requirement: AI-produced code served as a useful starting point, but I reviewed and adjusted security-sensitive pieces (password hashing, token signing, and atomic DB operations). AI may omit edge-case validation and tests, so manual review and additions are necessary.
- Learning & ideation: Interactive prompts were valuable for brainstorming endpoint shapes, UI flows, and trade-offs.
- Limitations: AI can produce plausible but incomplete code; it is important to add validation, tests, and additional hardening before deploying to production.

---