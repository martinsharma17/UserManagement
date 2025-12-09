// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getSuperAdminMenuItems } from '../components/dashboard/sidebarItems.jsx';
import DashboardView from '../components/dashboard/DashboardView.jsx';
import UsersAdminsListView from '../components/dashboard/UsersAdminsListView.jsx';
import ChartsView from '../components/dashboard/ChartsView.jsx';
import AccessManagementView from '../components/dashboard/AccessManagementView.jsx';
import RolesManagementView from '../components/dashboard/RolesManagementView.jsx';
import LoginFormView from '../components/dashboard/LoginFormView.jsx';
import RegisterFormView from '../components/dashboard/RegisterFormView.jsx';
import AddUserModal from '../components/dashboard/AddUserModal.jsx';

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "User" });
    const [loginTime, setLoginTime] = useState("");
    const [activeView, setActiveView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { token, logout, apiBase } = useAuth();
    const navigate = useNavigate();
    const menuItems = getSuperAdminMenuItems();

    // --- SuperAdmin login time activity ---
    useEffect(() => {
        if (token) {
            const lastLoginKey = "superadmin_last_login";
            const now = new Date();
            let storedLogin = localStorage.getItem(lastLoginKey);
            if (!storedLogin) {
                localStorage.setItem(lastLoginKey, now.toString());
                setLoginTime(now.toLocaleString());
            } else {
                setLoginTime(new Date(storedLogin).toLocaleString());
            }
        }
    }, [token]);

    // Fetch users and admins on component mount
    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, adminsRes] = await Promise.all([
                fetch(`${apiBase}/api/Roles/AllUsers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${apiBase}/api/Roles/AllAdmins`, {
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
                setError((prev) => (prev ? prev + "; " : "") + `Admins API parse error: ${err}`);
            }
            setUsers(usersData);
            setAdmins(adminsData);
        } catch (err) {
            setError("Network/API call failed: " + err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: check if a user is already admin/superadmin
    const isAlreadyAdmin = (user) => {
        const roles = user?.Roles || user?.roles;
        if (Array.isArray(roles)) {
            return roles.includes("Admin") || roles.includes("SuperAdmin");
        }
        return admins.some((a) => (a.Id || a.id) === (user.Id || user.id));
    };

    // Add user/admin
    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError("All fields are required");
            return;
        }
        try {
            const response = await fetch(`${apiBase}/api/User`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    UserName: newUser.name,
                    Email: newUser.email,
                    Password: newUser.password,
                    Role: newUser.role
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
            const response = await fetch(`${apiBase}/api/SuperAdmin/delete/${id}`, {
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
        const targetUser = users.find((u) => (u.Id || u.id) === userId);
        if (isAlreadyAdmin(targetUser)) {
            setError("User is already an admin");
            return;
        }
        try {
            const response = await fetch(`${apiBase}/api/SuperAdmin/promote/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("User promoted to admin");
                fetchData();
            } else {
                let message = "Failed to promote user";
                try {
                    const data = await response.json();
                    message = data.message || data.error || message;
                } catch {
                    const text = await response.text();
                    if (text) message = text;
                }
                setError(message);
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Revoke admin access
    const handleRevokeAdmin = async (adminId) => {
        if (!window.confirm("Are you sure you want to revoke admin access? This will demote them to a regular user.")) return;

        try {
            const response = await fetch(`${apiBase}/api/SuperAdmin/revoke-admin/${adminId}`, {
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

    // Calculate stats
    const regularUsers = users.filter(u => {
        const roles = u?.Roles || u?.roles || [];
        return !roles.includes("Admin") && !roles.includes("SuperAdmin");
    }).length;
    const totalAdmins = admins.length;
    const totalAccounts = users.length;

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error && !token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="p-8 max-w-xl mx-auto w-full">
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                        <p className="text-red-700 font-semibold">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render active view
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <DashboardView
                        regularUsers={regularUsers}
                        totalAdmins={totalAdmins}
                        totalAccounts={totalAccounts}
                        loginTime={loginTime}
                        onViewUsers={() => setActiveView('users')}
                        onViewAdmins={() => setActiveView('users')}
                        onViewCharts={() => setActiveView('charts')}
                        onAddUser={() => setShowAddModal(true)}
                    />
                );
            case 'users':
                return (
                    <UsersAdminsListView
                        users={users}
                        admins={admins}
                        isAlreadyAdmin={isAlreadyAdmin}
                        onAddUser={() => setShowAddModal(true)}
                        onMakeAdmin={handleMakeAdmin}
                        onDelete={handleDelete}
                        onRevokeAdmin={handleRevokeAdmin}
                    />
                );
            case 'charts':
                return (
                    <ChartsView
                        regularUsers={regularUsers}
                        totalAdmins={totalAdmins}
                        totalAccounts={totalAccounts}
                    />
                );
            case 'access':
                return (
                    <AccessManagementView
                        admins={admins}
                        onAddUser={() => setShowAddModal(true)}
                        onRevokeAdmin={handleRevokeAdmin}
                    />
                );
            case 'roles':
                return (
                    <RolesManagementView
                        apiBase={apiBase}
                        token={token}
                        users={users}
                        onRefreshUsers={fetchData}
                    />
                );
            case 'login':
                return <LoginFormView />;
            case 'register':
                return <RegisterFormView />;
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">View coming soon...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                menuItems={menuItems}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-6 md:p-8">
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

                    {/* Render Active View */}
                    {renderActiveView()}
                </div>
            </div>

            {/* Add Modal */}
            <AddUserModal
                show={showAddModal}
                newUser={newUser}
                setNewUser={setNewUser}
                onClose={() => {
                    setShowAddModal(false);
                    setNewUser({ name: "", email: "", password: "", role: "User" });
                }}
                onSubmit={handleAddUser}
                allowRoleSelection={true}
            />
        </div>
    );
};

export default SuperAdminDashboard;
