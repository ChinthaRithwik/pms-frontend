# 🖥️ Project Management System — Frontend

A modern React frontend for the Project Management System, featuring role-based UI, JWT authentication, and full CRUD for projects and tasks.

---

## 🛠️ Tech Stack

| Layer         | Technology                          |
|--------------|--------------------------------------|
| Language      | JavaScript (ES2022)                 |
| Framework     | React 19                            |
| Build Tool    | Vite 7                              |
| Routing       | React Router DOM v7                 |
| State/Fetch   | TanStack React Query v5             |
| HTTP Client   | Axios                               |
| Forms         | React Hook Form                     |
| Styling       | Tailwind CSS v3                     |
| Notifications | React Toastify                      |
| JWT Parsing   | jwt-decode                          |

---

## 📁 Project Structure

```
src/
├── api/                  # Axios API call functions
│   ├── axiosConfig.js    # Base URL + JWT interceptor
│   ├── authApi.js        # Login, signup
│   ├── projectApi.js     # Project CRUD
│   ├── taskApi.js        # Task CRUD + search
│   └── userApi.js        # User management (admin)
├── components/
│   ├── Navbar.jsx        # Top navigation bar
│   └── Sidebar.jsx       # Left sidebar (admin links conditionally shown)
├── context/
│   └── AuthContext.jsx   # Auth state, JWT decode, isAdmin flag
├── hooks/
│   ├── useProjects.js    # React Query hook for projects
│   └── useTasks.js       # React Query hook for tasks
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── Dashboard.jsx     # Project stats overview
│   ├── Projects.jsx      # Full project management
│   ├── Tasks.jsx         # Task management with filters
│   ├── OverdueTasks.jsx  # Overdue task listing
│   └── UserManagement.jsx # Admin-only user management
├── routes/
│   ├── ProtectedRoute.jsx # Redirects unauthenticated users
│   └── AdminRoute.jsx     # Redirects non-admin users
├── App.jsx               # Root router
├── main.jsx              # Entry point
└── index.css             # Global styles
```

---

## ⚙️ Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/pms-frontend.git
cd pms-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root:
```
VITE_API_URL=http://localhost:8080/api/v1
```

Then update `src/api/axiosConfig.js` to use it:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

> For production, set `VITE_API_URL` to your deployed backend URL in Vercel/Netlify settings.

### 4. Start the dev server
```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔐 Authentication Flow

1. User logs in via `/login` → receives JWT token
2. Token is stored in `localStorage`
3. `AuthContext` decodes the token to extract `email`, `role`, `userId`
4. Axios interceptor automatically attaches `Authorization: Bearer <token>` to every request
5. On logout, token is removed and user is redirected to `/login`

---

## 🛡️ Route Protection

| Route | Guard | Description |
|-------|-------|-------------|
| `/login`, `/signup` | Public | No auth required |
| `/dashboard`, `/projects`, `/tasks`, `/overdue` | `ProtectedRoute` | Must be logged in |
| `/admin/users` | `AdminRoute` | Must be logged in + ADMIN role |

---

## 🗂️ Pages Overview

### Dashboard
- Shows total projects count and counts by status (In Progress, Completed, On Hold)
- Displays a table of the 5 most recent projects

### Projects
- List all projects with pagination
- Create, edit, update status, and delete projects
- Status badge colour-coded by state

### Tasks
- View tasks per project with optional status filter
- Create, edit, update status, delete tasks
- Search tasks across filters (project, status, user, due date)

### Overdue Tasks
- Lists all tasks past their due date across all projects

### User Management *(Admin only)*
- List all users with pagination
- Create new users directly (bypasses signup)
- View user details, their assigned tasks, and their projects
- Delete users

---

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API |

> ⚠️ Never commit `.env` files to version control. Add `.env` to `.gitignore`.
