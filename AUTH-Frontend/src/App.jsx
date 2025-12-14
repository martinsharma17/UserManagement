// src/App.jsx
// ==============================================================================
// MAIN APPLICATION COMPONENT
// ==============================================================================
// This is the root component that sets up routing and global providers.
// Key responsibilities:
// 1. App Wrappers: AuthProvider for state.
// 2. Routing: Uses React Router to navigate between pages.
// 3. Protected Routes: Checks if user is logged in AND has the right role before showing a page.

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import Dashboard from './components/Dashboard.jsx';

// Role-based dashboards
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

import { jwtDecode } from "jwt-decode";
import Navbar from './components/layout/Navbar.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

const API_BASE_URL = "http://localhost:3001/api/";

// ==============================================================================
// HELPER: ROLE EXTRACTION
// ==============================================================================
// Decodes the JWT token to find what roles the user has.
// This is needed because the "Role" claim in tokens can appear under different key names
// depending on whether it's Microsoft Identity, Google, or custom.
function getUserRoles(token) {
  if (!token) return [];
  try {
    const decoded = jwtDecode(token);

    // Check multiple potential keys for roles:
    // 1. Microsoft Identity Standard URL
    // 2. Simple "role"
    // 3. Simple "roles" array
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      || decoded["role"]
      || decoded["roles"];

    if (!roles) return [];

    // Ensure we always return an array (even if single role string)
    return Array.isArray(roles) ? roles : [roles];
  } catch (error) {
    console.error("Error decoding token or extracting roles:", error);
    return [];
  }
}

// ==============================================================================
// APP CONTENT (Inner Component)
// ==============================================================================
// We separate this so we can use hooks like `useAuth` which require valid Context.
function AppContent() {
  const { token } = useAuth(); // Get current login token

  // Determine roles from the token
  const roles = getUserRoles(token);

  // Boolean flags for easy permission checks in JSX
  const isSuperAdmin = roles.includes("SuperAdmin");
  const isAdmin = roles.includes("Admin");
  const isManager = roles.includes("Manager");
  const isUser = roles.includes("User");

  return (
    <div className="App">
      <header className="header">
        {/* Only show Navbar if user is logged in */}
        {token && <Navbar />}
      </header>
      <main>
        <Routes>
          {/* Public Routes: Accessible by anyone */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* 
             ==============================================================================
             PROTECTED ROUTE LOGIC
             ==============================================================================
             The following logic directs users to different dashboards based on their role.
             Structure:
             1. Check if logged in (token exists?) -> If no, Redirect to Login.
             2. If logged in, Check specific roles in order of priority.
             3. Render appropriate Dashboard.
          */}
          <Route
            path="/dashboard"
            element={
              token ? (
                // USER IS LOGGED IN
                isSuperAdmin ? (
                  <SuperAdminDashboard apiBase={API_BASE_URL} token={token} />
                ) : isAdmin ? (
                  <ErrorBoundary>
                    <AdminDashboard apiBase={API_BASE_URL} token={token} />
                  </ErrorBoundary>
                ) : isManager ? (
                  <ManagerDashboard apiBase={API_BASE_URL} token={token} />
                ) : (
                  // Universal Fallback:
                  // For any other role (e.g. "User", or custom dynamic roles like "kamwalibai"),
                  // we render the Generic/User Dashboard.
                  // This dashboard will fetch its own permissions dynamically based on the policy system.
                  <UserDashboard />
                )
              ) : (
                // USER IS NOT LOGGED IN -> Redirect to Login
                <Navigate to="/login" />
              )
            }
          />

          {/* Default Route: Redirect root URL to dashboard (which handles auth check) */}
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </main>
    </div>
  );
}

// ==============================================================================
// ROOT APP COMPONENT
// ==============================================================================
export default function App() {
  return (
    // Wrap entire app in AuthProvider to make auth state global
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
