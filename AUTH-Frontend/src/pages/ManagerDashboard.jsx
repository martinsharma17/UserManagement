import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getManagerMenuItems } from '../components/dashboard/sidebarItems.jsx';
import AdminDashboardView from '../components/dashboard/admin/AdminDashboardView.jsx';
import AdminUsersListView from '../components/dashboard/admin/AdminUsersListView.jsx';
import AdminChartsView from '../components/dashboard/admin/AdminChartsView.jsx';
import LoginFormView from '../components/dashboard/LoginFormView.jsx';
import RegisterFormView from '../components/dashboard/RegisterFormView.jsx';
import AddUserModal from '../components/dashboard/AddUserModal.jsx';

const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
    const [activeView, setActiveView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [permissions, setPermissions] = useState({});

    const { token, logout, apiBase, user } = useAuth();
    const navigate = useNavigate();

    // Get menu items based on permissions
    const menuItems = getManagerMenuItems(permissions);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUsers();
        fetchPermissions();
    }, [token, navigate]);

    // Fetch manager permissions (this would come from backend)
    const fetchPermissions = async () => {
        // In a real app, this would fetch from backend
        // For now, we'll use default permissions or localStorage
        const storedPermissions = localStorage.getItem(`manager_permissions_${user?.id}`);
        if (storedPermissions) {
            setPermissions(JSON.parse(storedPermissions));
        } else {
            // Default permissions for manager (same as admin plus reports and audit)
            const defaultPermissions = {
                dashboard: true,
                view_users: true,
                view_charts: true,
                view_reports: true, // Managers have access to reports
                view_audit: true, // Managers have access to audit logs
            };
            setPermissions(defaultPermissions);
            localStorage.setItem(`manager_permissions_${user?.id}`, JSON.stringify(defaultPermissions));
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/api/Admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Filter out admins and superadmins if they appear in the list
                const regularUsers = data.filter(user =>
                    !user.roles?.includes('Admin') && !user.roles?.includes('SuperAdmin') && !user.roles?.includes('Manager')
                );
                setUsers(regularUsers);
            } else {
                setError("Failed to fetch users");
            }
        } catch (_) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

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
                    Role: "User"
                })
            });

            if (response.ok) {
                setSuccess("User added successfully");
                setShowAddModal(false);
                setNewUser({ name: "", email: "", password: "" });
                fetchUsers();
            } else {
                setError("Failed to add user");
            }
        } catch {
            setError("Network error");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`${apiBase}/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("User deleted successfully");
                fetchUsers();
            } else {
                setError("Failed to delete user");
            }
        } catch (_) {
            setError("Network error");
        }
    };

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

    // Render active view
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <AdminDashboardView
                        totalUsers={users.length}
                        onViewUsers={() => setActiveView('users')}
                        onViewCharts={() => setActiveView('charts')}
                        onAddUser={() => setShowAddModal(true)}
                    />
                );
            case 'users':
                if (!permissions.view_users) {
                    return (
                        <div className="text-center py-12">
                            <p className="text-red-600">You don't have permission to view users.</p>
                        </div>
                    );
                }
                return (
                    <AdminUsersListView
                        users={users}
                        onAddUser={() => setShowAddModal(true)}
                        onDelete={handleDelete}
                    />
                );
            case 'charts':
                if (!permissions.view_charts) {
                    return (
                        <div className="text-center py-12">
                            <p className="text-red-600">You don't have permission to view charts.</p>
                        </div>
                    );
                }
                return (
                    <AdminChartsView totalUsers={users.length} />
                );
            case 'reports':
                if (!permissions.view_reports) {
                    return (
                        <div className="text-center py-12">
                            <p className="text-red-600">You don't have permission to view reports. Contact SuperAdmin for access.</p>
                        </div>
                    );
                }
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Reports view coming soon...</p>
                    </div>
                );
            case 'audit':
                if (!permissions.view_audit) {
                    return (
                        <div className="text-center py-12">
                            <p className="text-red-600">You don't have permission to view audit logs. Contact SuperAdmin for access.</p>
                        </div>
                    );
                }
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Audit logs view coming soon...</p>
                    </div>
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
                    setNewUser({ name: "", email: "", password: "" });
                }}
                onSubmit={handleAddUser}
                allowRoleSelection={false}
            />
        </div>
    );
};

export default ManagerDashboard;
