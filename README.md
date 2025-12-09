# Authentication & Role-Based System Documentation

This repository contains a full-stack application demonstrating secure authentication and role-based access control (RBAC).

## 🏗 System Architecture

The system consists of two main parts:

1.  **Backend (AUTHApi)**: built with **.NET Core (C#)**. It handles:
    *   Database interactions (SQL Server via Entity Framework Core).
    *   User Identity Management (ASP.NET Core Identity).
    *   JWT Token Generation & Validation.
    *   API Endpoints protected by Role Policies.

2.  **Frontend (AUTH-Frontend)**: built with **React (Vite)**. It handles:
    *   User Interface for Login, Registration, and Dashboards.
    *   JWT Token Storage (localStorage).
    *   Role-Based Routing (Redirecting users to correct pages).
    *   Protecting routes using a global Authentication Context.

---

## 🔐 Data Flow & API Usage

How the Frontend talks to the Backend:

1.  **Registration**:
    *   Frontend sends `POST { name, email, password }` to `/api/UserAuth/Register`.
    *   Backend creates user and **automatically assigns the 'User' role**.

2.  **Login**:
    *   Frontend sends `POST { email, password }` to `/api/UserAuth/Login`.
    *   Backend verifies credentials and returns a **JWT (JSON Web Token)** containing the user's ID, Email, and **Roles**.

3.  **Authenticated Requests**:
    *   For subsequent requests (e.g., getting user data), the Frontend attaches the Token to the request headers: `Authorization: Bearer <TOKEN>`.
    *   Backend middleware validates the signature and expiration of the token.

---

## 🛡 Roles & Permission System

The system defines 4 hierarchy levels. Each level has access to its own dashboard and potentially lower levels.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **SuperAdmin** | Highest | Can manage everything, including creating/deleting other admins and roles. |
| **Admin** | High | Can manage users under their department. Access to `/api/Roles` endpoints. |
| **Manager** | Medium | Can view reports and manage team data. |
| **User** | Basic | Standard access. Can view their own profile. |

### Frontend Logic
*   **`src/context/AuthContext.jsx`**: Decodes the JWT token to extract the role list.
*   **`src/App.jsx`**: Checks the role list to decide which Dashboard component to render.
    *   *Example*: If `isSuperAdmin` is true -> Render `<SuperAdminDashboard />`.
    *   *Example*: If user tries to access `/dashboard` but has no role -> Redirect to Login.

### Backend Logic
*   **Attributes**: Controllers use `[Authorize(Roles = "SuperAdmin")]` to lock down endpoints.
*   **Policies**: Defined in `Program.cs` (e.g., `policy.RequireRole("Admin")`) for more complex rules.

---

## 🚀 Setup & Running Instructions

### 1. Database Setup
1.  Make sure you have **SQL Server** installed.
2.  Update the connection string in `AUTHApi/appsettings.json`.
3.  Open a terminal in `AUTHApi/` and run migrations:
    ```bash
    dotnet ef database update
    ```
    *This creates the database and seeds the default roles and SuperAdmin user.*

### 2. Running the Backend
1.  Open `AUTHApi/` in your terminal.
2.  Run the server:
    ```bash
    dotnet run
    ```
    *Server usually starts on http://localhost:5033 or https://localhost:7147 (check terminal output).*

### 3. Running the Frontend
1.  Open `AUTH-Frontend/` in a new terminal.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```
    *App runs on http://localhost:5173.*

---

## 📂 Key Files to Review

*   **Backend**:
    *   `Program.cs`: Configuration central (Auth, DB, Swagger).
    *   `Controllers/UserAuthController.cs`: Login & Register logic.
    *   `Controllers/RolesController.cs`: Role management logic.

*   **Frontend**:
    *   `src/context/AuthContext.jsx`: Auth state management.
    *   `src/App.jsx`: Routing & Role checks.
