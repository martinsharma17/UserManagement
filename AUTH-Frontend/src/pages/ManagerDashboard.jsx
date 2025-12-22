import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getManagerMenuItems } from '../components/dashboard/sidebarItems.jsx';
import AdminDashboardView from '../components/dashboard/admin/AdminDashboardView.jsx';
import AdminUsersListView from '../components/dashboard/admin/AdminUsersListView.jsx';
import AdminChartsView from '../components/dashboard/admin/AdminChartsView.jsx';
import AdminResourceView from '../components/dashboard/admin/AdminResourceView.jsx';
import LoginFormView from '../components/dashboard/LoginFormView.jsx';
import RegisterFormView from '../components/dashboard/RegisterFormView.jsx';
import AddUserModal from '../components/dashboard/AddUserModal.jsx';
import TaskListView from '../components/dashboard/tasks/TaskListView.jsx';
import TaskKanbanView from '../components/dashboard/tasks/TaskKanbanView.jsx';
import SettingsView from '../components/dashboard/SettingsView.jsx';
import NotificationsView from '../components/dashboard/NotificationsView.jsx';

/**
 * ManagerDashboard
 * 
 * Updated to support dynamic policies for Tasks, Projects, and Users using
 * the persisted system_policies.
 */
const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
    const [activeView, setActiveView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { token, logout, apiBase, user, permissions: contextPermissions } = useAuth();
    const navigate = useNavigate();

    // Use permissions from AuthContext (fetched from backend)
    const permissions = contextPermissions || {};

    // Get menu items based on permissions (must be before early return)
    const menuItems = getManagerMenuItems(permissions);

    // ⚠️ IMPORTANT: All hooks must be declared BEFORE any conditional returns
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/api/User/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Backend already filters based on current user's role
                // No need for additional frontend filtering
                setUsers(data);
            } else {
                setError("Failed to fetch users");
            }
        } catch (_) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, [apiBase, token]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [token, navigate, fetchUsers]);

    // Show loading state while permissions are being fetched
    // This MUST come after all hooks
    if (!contextPermissions) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading permissions...</p>
                </div>
            </div>
        );
    }

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
                        onAddUser={permissions.create_users ? () => setShowAddModal(true) : null}
                    />
                );
            case 'users':
                if (!permissions.view_users) {
                    return (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🚫</div>
                            <h3 className="text-xl font-bold text-gray-900">Access Denied</h3>
                            <p className="text-gray-500 mt-2">Your role policy does not allow viewing this resource.</p>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4">
                        {!permissions.create_users && (
                            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                                ⚠️ 'Create User' capability is disabled by system policy.
                            </div>
                        )}
                        <AdminUsersListView
                            users={users}
                            onAddUser={permissions.create_users ? () => setShowAddModal(true) : undefined}
                            onDelete={permissions.delete_users ? handleDelete : undefined}
                            canEdit={permissions.update_users}
                        />
                    </div>
                );
            case 'tasks':
                if (!permissions.view_tasks) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Task"
                        canCreate={permissions.create_tasks}
                        canUpdate={permissions.update_tasks}
                        canDelete={permissions.delete_tasks}
                    />
                );
            case 'task_list':
                if (!permissions.read_task_list) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <TaskListView
                        permissions={{
                            create: permissions.create_task_list,
                            read: permissions.read_task_list,
                            update: permissions.update_task_list,
                            delete: permissions.delete_task_list
                        }}
                    />
                );
            case 'task_kanban':
                if (!permissions.read_task_kanban) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <TaskKanbanView
                        permissions={{
                            create: permissions.create_task_kanban,
                            read: permissions.read_task_kanban,
                            update: permissions.update_task_kanban,
                            delete: permissions.delete_task_kanban
                        }}
                    />
                );
            case 'projects':
                if (!permissions.read_projects && permissions.read_projects !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Project"
                        canCreate={permissions.create_projects}
                        canUpdate={permissions.update_projects}
                        canDelete={permissions.delete_projects}
                    />
                );
            case 'charts':
                if (!permissions.read_charts && permissions.read_charts !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <AdminChartsView />;
            case 'reports':
                if (!permissions.read_reports && permissions.read_reports !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Reports view coming soon...</p>
                    </div>
                );
            case 'audit':
                if (!permissions.read_audit && permissions.read_audit !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Audit logs view coming soon...</p>
                    </div>
                );
            case 'roles':
                if (!permissions.read_roles && permissions.read_roles !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Roles Management (Restricted)</div>;
            case 'policies':
                if (!permissions.read_policies && permissions.read_policies !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Policy Editor (Restricted)</div>;
            case 'settings':
                if (!permissions.read_settings && permissions.read_settings !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <SettingsView />;
            case 'notifications':
                if (!permissions.read_notifications && permissions.read_notifications !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <NotificationsView />;
            case 'security':
                if (!permissions.read_security && permissions.read_security !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Security Settings Module</div>;
            case 'backup':
                if (!permissions.read_backup && permissions.read_backup !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Backup & Restore Module</div>;
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
                user={user}
                permissions={permissions}
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
