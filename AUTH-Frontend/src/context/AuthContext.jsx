// src/context/AuthContext.js
// Global state for authentication: Manages token/user, login/logout, persists in localStorage.
// Connected to your backend via fetch: Sends JSON to /api/login & /api/register.
// On load, checks for existing token and optionally validates it (uncomment if /api/me exists).
// Why Context? Avoids prop-drilling; any component can access auth state easily.

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

// Create context: Holds auth values (token, user, methods).
const AuthContext = createContext();

// Hook: useAuth() - Safe access to context (throws error if used outside provider).
// Usage in components: const { token, login, logout } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider'); // Prevents misuse
    }
    return context;
};

// Provider: Wraps app, manages state with hooks.
// Params: children (JSX to wrap).
// State: token (JWT string), user (object from backend), loading (bool for initial check).
export const AuthProvider = ({ children }) => {
    // Initialize from localStorage: Persists login across browser refreshes.
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('authToken');
        console.log('Initial token from localStorage:', storedToken);
        return storedToken;
    });
    const [user, setUser] = useState(() => {
        const storedRoles = localStorage.getItem('userRoles');
        if (storedRoles) {
            console.log('Initial user roles from localStorage:', storedRoles);
            return { roles: JSON.parse(storedRoles) };
        }
        console.log('No initial user roles found.');
        return null;
    }); // Backend user: { id, email, roles }
    const [loading, setLoading] = useState(true); // True on mount for splash prevention
    // API Base URL from environment variable or default
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Effect: Runs on mount - Restore user if token exists, or check URL for Google login token.
    // Why useEffect? Side-effect free component; handles async validation.
    useEffect(() => {
        const initAuth = async () => {
            console.log('Auth init effect running. Current token:', token);

            // Check URL for Google login token
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');

            if (urlToken) {
                console.log('Token found in URL from Google login');
                try {
                    const decodedToken = jwtDecode(urlToken);
                    console.log('Decoded Google login token:', decodedToken);

                    // Extract roles - try multiple claim formats
                    const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                        || decodedToken["role"]
                        || decodedToken["roles"]
                        || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];
                    const rolesArray = Array.isArray(roles) ? roles : (roles ? [roles] : []);

                    localStorage.setItem('authToken', urlToken);
                    localStorage.setItem('userRoles', JSON.stringify(rolesArray));

                    // Extract user data from token
                    const userEmail = decodedToken.email || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
                    const userId = decodedToken.sub || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
                    const userName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                        || decodedToken.name
                        || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                        || '';
                    // Try multiple ways to get picture from token
                    const userPicture = decodedToken.picture
                        || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/picture']
                        || decodedToken['urn:google:picture']
                        || null;

                    console.log('Full decoded token:', decodedToken);
                    console.log('Extracted user data:', { userId, userEmail, userName, userPicture, rolesArray });
                    console.log('Picture value:', userPicture);

                    setToken(urlToken);
                    setUser({ id: userId, email: userEmail, name: userName, roles: rolesArray, picture: userPicture });

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    console.log('Google login successful. User state set:', { id: userId, email: userEmail, name: userName, picture: userPicture, roles: rolesArray });
                } catch (err) {
                    console.error('Error processing Google login token:', err);
                }
            } else if (token) {
                // Optional: Validate token with backend /api/me (uncomment if endpoint exists)
                // try {
                //   const res = await fetch('http://localhost:3001/api/me', {
                //     headers: { Authorization: `Bearer ${token}` }
                //   });
                //   if (res.ok) {
                //     const data = await res.json();
                //     setUser(data.user);
                //   } else {
                //     logout(); // Invalid token? Clear it
                //   }
                // } catch (err) {
                //   logout();
                // }
            } else {
                // If no token, clear user and roles from local storage
                console.log('No token found on init, clearing local storage and user state.');
                localStorage.removeItem('userRoles');
                setUser(null);
            }
            setLoading(false); // Done loading
            console.log('Auth init completed. Loading set to false.');
        };
        initAuth();
    }, [token]); // Re-run if token changes

    // Login function: Async POST to backend /api/login.
    // Params: email (string), password (string).
    // Returns: { success: bool, message?: string } for form handling.
    // Handles: Network errors, invalid creds, sets token/user on success.
    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            // Fetch config: Matches your backend expectations (JSON body, no auth header for login).
            const response = await fetch('http://localhost:3001/api/UserAuth/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Required for JSON parsing on backend
                },
                body: JSON.stringify({ email, password }), // Exact body format for your API
            });

            const data = await response.json(); // Parse JSON response
            console.log('Login API response:', data);

            // Success check: Based on your backend { success: true }
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));

                const decodedToken = jwtDecode(data.token);
                console.log("Decoded Token in AuthContext (for ID and Name):", decodedToken); // Log the full decoded token
                const userEmail = decodedToken.email;
                // Correctly extract userId using the standard 'sub' claim or the .NET Identity 'nameidentifier' claim
                const userId = decodedToken.sub || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                // Correctly extract userName using the .NET Identity 'name' claim
                const userName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decodedToken.name || '';
                // Extract Google profile picture if available
                const userPicture = decodedToken.picture || null;

                setToken(data.token);
                setUser({ id: userId, email: userEmail, name: userName, roles: data.roles, picture: userPicture }); // Set full user object with name and picture
                console.log('Login successful. User state set:', { id: userId, email: userEmail, name: userName, roles: data.roles, picture: userPicture });
                return { success: true }; // No message needed on success
            } else {
                console.log('Login failed:', data.message);
                return { success: false, message: data.message || 'Invalid credentials' }; // Backend error msg
            }
        } catch (error) {
            // Edge case: Network/offline - Generic error, no leak of details.
            console.error('Login error:', error); // Log for dev
            return { success: false, message: 'Network error. Check backend server.' };
        }
    };

    // Logout: Clears state/storage, no backend call (client-side).
    // Why? Token invalidation on backend optional; this suffices for most apps.
    const logout = () => {
        console.log('Logging out.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        setToken(null);
        setUser(null);
    };

    // Value: Expose to consumers - Includes loading to prevent flashes.
    const value = {
        token,      // For protected headers/routes
        user,       // For displaying user info (now includes roles)
        loading,    // For spinners/skeletons
        login,      // Function to call
        logout,     // Function to call
        apiBase    // Expose API base URL

    };

    // Render: If loading, show nothing (or spinner); else provide context.
    if (loading) {
        console.log('AuthContext is loading...');
        return <div>Loading...</div>; // Simple placeholder; customize with spinner
    }

    console.log('AuthContext loaded. Token:', token, 'User:', user);
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};