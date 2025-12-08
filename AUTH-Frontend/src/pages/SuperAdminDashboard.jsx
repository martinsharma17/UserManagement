// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// Add this near the top if apiBase is not available from context or props
const apiBase = 'http://localhost:3001/api'; // <-- Use this port for all API calls

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "User" });
    const [loginTime, setLoginTime] = useState("");
    
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    // --- SuperAdmin login time activity ---
    useEffect(() => {
        // On dashboard load with token, set and show login time
        if (token) {
            // Save login time only if not present or if session is new
            const lastLoginKey = "superadmin_last_login";
            const now = new Date();
            // Check last stored time, if missing or sessionStorage token changed, update
            let storedLogin = localStorage.getItem(lastLoginKey);
            if (!storedLogin) {
                localStorage.setItem(lastLoginKey, now.toString());
                setLoginTime(now.toLocaleString());
            } else {
                setLoginTime(new Date(storedLogin).toLocaleString());
            }
        }
    }, [token]);

    // Fetch data - for SuperAdmin dashboard; use the correct endpoints
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, adminsRes] = await Promise.all([
                fetch(`${apiBase}/Roles/AllUsers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${apiBase}/Roles/AllAdmins`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            if ([401, 403].includes(usersRes.status) || [401, 403].includes(adminsRes.status)) {
                setError("Session expired or you do not have SuperAdmin privileges. Please login again.");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
                setLoading(false);
                return;
            }

            let usersData = [], adminsData = [];
            try {
                if (usersRes.ok) {
                    const usersJson = await usersRes.json();
                    usersData = usersJson.users || [];
                } else {
                    const text = await usersRes.text();
                    setError(`Users API error: ${usersRes.status} ${usersRes.statusText} - ${text}`);
                }
            } catch (err) {
                setError(`Users API parse error: ${err}`);
            }
            try {
                if (adminsRes.ok) {
                    const adminsJson = await adminsRes.json();
                    adminsData = adminsJson.admins || [];
                } else {
                    const text = await adminsRes.text();
                    setError(`Admins API error: ${adminsRes.status} ${adminsRes.statusText} - ${text}`);
                }
            } catch (err) {
                setError((prev) => (prev ? prev+"; " : "") + `Admins API parse error: ${err}`);
            }
            setUsers(usersData);
            setAdmins(adminsData);
            if(!usersData || usersData.length === 0) {
              console.error('SuperAdminDashboard: No users retrieved from backend.', usersData);
            }
            if(!adminsData || adminsData.length === 0) {
              console.error('SuperAdminDashboard: No admins retrieved from backend.', adminsData);
            }
        } catch (err) {
            setError("Network/API call failed: " + err);
        } finally {
            setLoading(false);
        }
    };

    // Replace handleAddUser with fixed version
    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError("All fields are required");
            return;
        }
        try {
            const response = await fetch(`${apiBase}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    UserName: newUser.name, // <-- capitalize for backend
                    Email: newUser.email,
                    Password: newUser.password,
                    Role: newUser.role // "User" or "Admin"
                })
            });
            if (response.ok) {
                setSuccess(`${newUser.role} added successfully`);
                setShowAddModal(false);
                setNewUser({ name: "", email: "", password: "", role: "User" });
                fetchData();
            } else {
                setError("Failed to add user/admin");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Delete user/admin
    const handleDelete = async (id, isAdmin) => {
        if (!window.confirm(`Are you sure you want to delete this ${isAdmin ? 'admin' : 'user'}?`)) return;

        try {
            const response = await fetch(`${apiBase}/SuperAdmin/delete/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess(`${isAdmin ? 'Admin' : 'User'} deleted successfully`);
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || "Failed to delete");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Make user admin
    const handleMakeAdmin = async (userId) => {
        try {
            const response = await fetch(`${apiBase}/SuperAdmin/promote/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("User promoted to admin");
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || "Failed to promote user");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Revoke admin access (demote to user)
    const handleRevokeAdmin = async (adminId) => {
        if (!window.confirm("Are you sure you want to revoke admin access? This will demote them to a regular user.")) return;

        try {
            const response = await fetch(`${apiBase}/SuperAdmin/revoke-admin/${adminId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("Admin access revoked successfully");
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || "Failed to revoke admin access");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // In component rendering, always show error if present
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="p-8 max-w-xl mx-auto w-full">
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                        <p className="text-red-700 font-semibold">{error}</p>
                        <p className="text-gray-600 mt-2">If your session expired, you will be redirected to login.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage all users and administrators</p>
                        {loginTime && (
                          <p className="text-sm mt-1 text-gray-500">Last login: {loginTime}</p>
                        )}
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Add New User/Admin
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Admins</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">{admins.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Accounts</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{users.length + admins.length}</p>
                    </div>
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Add New User/Admin</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{user.Id || user.id || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.Name || user.UserName || user.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.Email || user.email || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleMakeAdmin(user.Id || user.id)}
                                                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    >
                                                        Make Admin
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.Id || user.id, false)}
                                                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Admins Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Admins ({admins.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{admin.Id || admin.id || 'N/A'}</td>
                                            <td className="px-6 py-4">{admin.Name || admin.UserName || admin.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{admin.Email || admin.email || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleRevokeAdmin(admin.Id || admin.id)}
                                                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                    >
                                                        Revoke Admin
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin.Id || admin.id, true)}
                                                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;