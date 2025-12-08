# User Management System (ASP.NET 9 + React)

A production-oriented starter showing JWT auth, role & policy-based authorization, and a simple React UI.

## Stack
- Backend: .NET 9 Web API, ASP.NET Identity, EF Core (SQL Server), JWT, Serilog
- Frontend: React + Vite, React Router, axios, TailwindCSS

## Quickstart
```bash
# Backend
cd server
dotnet restore
dotnet ef database update
dotnet run

# Frontend
cd ../client
npm install
npm run dev
```

API base URL defaults to `https://localhost:5001`. Frontend expects it via `VITE_API_URL`.

## Default accounts
- SuperAdmin: `superadmin@gmail.com` / `password`
- Admin seed: `admin@example.com` / `Password1!`
- Users seed: `user1@example.com` / `Password1!`, `user2@example.com` / `Password1!`

## Backend project layout (`server/`)
- `Controllers/` Auth, Users, Admin, SuperAdmin
- `Services/` auth, user, role services plus JWT generator
- `Data/` EF Core context + seed
- `Models/` DTOs, Identity user, refresh tokens
- `Auth/` roles, claims, policies, JWT options
- `appsettings.json` example config

### Auth & authorization
- JWT access token (15m) + refresh token (7d)
- Claims: `sub`, `email`, `roles[]`, custom (e.g., `CanEditUsers`, `IsSuperAdmin`, `ManagedBy`)
- Policies: `RequireCanEditUsers`, `RequireSuperAdmin`, `RequireManagedUserAccess`
- Role hierarchy: SuperAdmin > Admin > User; Admin owns users via `ManagedByAdminId`

### API endpoints (high level)
- `POST /api/auth/register` — new User
- `POST /api/auth/login` — returns `{ accessToken, refreshToken, expiresAt, user }`
- `POST /api/auth/refresh` — rotates refresh token
- `POST /api/auth/logout` — revokes current refresh token
- `GET /api/auth/me` — current profile
- `GET /api/users` — SuperAdmin: all; Admin: owned; User: self
- `GET /api/users/{id}` — if self, owning admin, or SuperAdmin
- `POST /api/users` — SuperAdmin/Admin (Admin only creates owned Users)
- `PUT /api/users/{id}` — update profile with role checks
- `PATCH /api/users/{id}/role` — SuperAdmin only
- `PATCH /api/users/{id}/policy` — SuperAdmin only
- `DELETE /api/users/{id}` — SuperAdmin or owning Admin
- `GET /api/admin` — list admins (SuperAdmin)
- `GET /api/superadmin/users` — all users (SuperAdmin)

### Migrations & database
Set `DefaultConnection` in `appsettings.json` or user secrets, then:
```bash
cd server
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Tests
```bash
cd server.Tests
dotnet test
```
Includes auth and role/forbidden coverage.

### Security notes
- Use HTTPS locally (`dotnet dev-certs https --trust`)
- Store secrets via `dotnet user-secrets` or environment vars; never commit real keys
- Refresh tokens persisted and revoked on logout/rotation
- Password policy enforced via Identity options

## Frontend project layout (`client/`)
- `src/api/axios.js` with auth interceptors + refresh flow
- `src/context/AuthContext.jsx` manages tokens/user
- `src/components/` Navbar, Footer, ProtectedRoute, lists, Profile icon
- `src/pages/` Login, Register, dashboards for SuperAdmin/Admin/User, Profile
- Tailwind styles via `index.css`

### Frontend usage
- Run `npm run dev` and open the displayed URL (default `http://localhost:5173`)
- Login as SuperAdmin to manage roles/claims and see admin/user lists
- Admin dashboard only lists owned users; SuperAdmin sees everything
- UI hides admin-only buttons when claims/roles are missing

### API via curl
```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email":"superadmin@gmail.com", "password":"password" }'
```
Use returned bearer token for subsequent requests: `-H "Authorization: Bearer <token>"`.

