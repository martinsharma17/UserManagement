// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getAdminMenuItems } from '../components/dashboard/sidebarItems.jsx';
import AdminDashboardView from '../components/dashboard/admin/AdminDashboardView.jsx';
import AdminUsersListView from '../components/dashboard/admin/AdminUsersListView.jsx';
import AdminChartsView from '../components/dashboard/admin/AdminChartsView.jsx';
import LoginFormView from '../components/dashboard/LoginFormView.jsx';
import RegisterFormView from '../components/dashboard/RegisterFormView.jsx';
import AddUserModal from '../components/dashboard/AddUserModal.jsx';
import AdminResourceView from '../components/dashboard/admin/AdminResourceView.jsx'; // [NEW]
import TaskListView from '../components/dashboard/tasks/TaskListView.jsx';
import TaskKanbanView from '../components/dashboard/tasks/TaskKanbanView.jsx';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
    const [activeView, setActiveView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Use permissions from AuthContext (fetched from backend)
    const { token, logout, apiBase, user, permissions: authPermissions } = useAuth();
    const navigate = useNavigate();

    // Get menu items based on permissions from AuthContext
    const menuItems = getAdminMenuItems(authPermissions || {});

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/api/Admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Filter out admins if they appear in the list
                const regularUsers = data.filter(user =>
                    !user.roles?.includes('Admin') && !user.roles?.includes('SuperAdmin')
                );
                setUsers(regularUsers);
            } else {
                setError("Failed to fetch users");
            }
        } catch {
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
        } catch (_ERR) {
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



    // ... (existing helper methods)

    // Render active view
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <AdminDashboardView
                        totalUsers={users.length}
                        onViewUsers={() => setActiveView('users')}
                        onViewCharts={() => setActiveView('charts')}
                        onAddUser={authPermissions?.create_users ? () => setShowAddModal(true) : null} // Disable if no permission
                    />
                );
            case 'users':
                if (!authPermissions?.view_users) {
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
                        {!authPermissions?.create_users && (
                            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                                ⚠️ 'Create User' capability is disabled by system policy.
                            </div>
                        )}
                        <AdminUsersListView
                            users={users}
                            onAddUser={authPermissions?.create_users ? () => setShowAddModal(true) : undefined}
                            onDelete={authPermissions?.delete_users ? handleDelete : undefined}
                            canEdit={authPermissions?.update_users}
                        />
                    </div>
                );
            case 'task_list':
                if (!authPermissions?.read_task_list) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <TaskListView
                        permissions={{
                            create: authPermissions?.create_task_list,
                            read: authPermissions?.read_task_list,
                            update: authPermissions?.update_task_list,
                            delete: authPermissions?.delete_task_list
                        }}
                    />
                );
            case 'task_kanban':
                if (!authPermissions?.read_task_kanban) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <TaskKanbanView
                        permissions={{
                            create: authPermissions?.create_task_kanban,
                            read: authPermissions?.read_task_kanban,
                            update: authPermissions?.update_task_kanban,
                            delete: authPermissions?.delete_task_kanban
                        }}
                    />
                );
            // [NEW] Tasks View
            case 'tasks':
                if (!authPermissions?.view_tasks) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Task"
                        canCreate={authPermissions?.create_tasks}
                        canUpdate={authPermissions?.update_tasks}
                        canDelete={authPermissions?.delete_tasks}
                    />
                );
            // [NEW] Projects View
            case 'projects':
                if (!authPermissions?.view_projects) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Project"
                        canCreate={authPermissions?.create_projects}
                        canUpdate={authPermissions?.update_projects}
                        canDelete={authPermissions?.delete_projects}
                    />
                );

            // [NEW] Nested Project Views
            case 'my_projects':
                if (!authPermissions?.view_my_projects) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="My Projects"
                        canCreate={authPermissions?.create_my_projects}
                        canUpdate={authPermissions?.update_my_projects}
                        canDelete={authPermissions?.delete_my_projects}
                    />
                );
            case 'project_content':
                if (!authPermissions?.view_project_content) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Project Content"
                        canCreate={authPermissions?.create_project_content}
                        canUpdate={authPermissions?.update_project_content}
                        canDelete={authPermissions?.delete_project_content}
                    />
                );
            case 'project_team':
                if (!authPermissions?.view_project_team) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Team & Workflow"
                        canCreate={authPermissions?.create_project_team}
                        canUpdate={authPermissions?.update_project_team}
                        canDelete={authPermissions?.delete_project_team}
                    />
                );
            case 'project_settings':
                if (!authPermissions?.view_project_settings) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Project Settings"
                        canCreate={authPermissions?.create_project_settings}
                        canUpdate={authPermissions?.update_project_settings}
                        canDelete={authPermissions?.delete_project_settings}
                    />
                );
            case 'charts':
                if (!authPermissions?.view_charts) {
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
                if (!authPermissions?.view_reports) {
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
                permissions={authPermissions}
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

export default AdminDashboard;
