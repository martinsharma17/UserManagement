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
    const [permissions, setPermissions] = useState({});

    const { token, logout, apiBase, user } = useAuth();
    const navigate = useNavigate();

    // Get menu items based on permissions
    const menuItems = getAdminMenuItems(permissions);

    // Fetch admin permissions (Dynamic from Policy System)
    const fetchPermissions = useCallback(async () => {
        const systemPoliciesJson = localStorage.getItem('system_policies');
        let computedPermissions = {
            view_users: true,
            create_users: true,
            update_users: true,
            delete_users: true,
            view_charts: true,
            read_charts: true,
            view_tasks: false,
            read_tasks: false,
            create_tasks: false,
            update_tasks: false,
            delete_tasks: false,
            view_projects: false,
            read_projects: false,
            create_projects: false,
            update_projects: false,
            delete_projects: false,
            view_reports: false,
            read_reports: false,
            view_audit: false,
            read_audit: false,
            view_roles: false,
            read_roles: false,
            view_policies: false,
            read_policies: false,
            view_settings: false,
            read_settings: false,
            view_notifications: false,
            read_notifications: false,
            view_security: false,
            read_security: false,
            view_backup: false,
            read_backup: false
        };

        if (systemPoliciesJson) {
            const systemPolicies = JSON.parse(systemPoliciesJson);

            // Get user roles
            let userRoles = [];
            if (user?.Role) userRoles = Array.isArray(user.Role) ? user.Role : [user.Role];
            else if (user?.roles) userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
            else if (user?.role) userRoles = Array.isArray(user.role) ? user.role : [user.role];
            else userRoles = ['Admin'];

            const normalizedUserRoles = userRoles.map(r => r.toLowerCase());
            let hasPolicy = false;

            let tempPerms = {
                users: { create: false, read: false, update: false, delete: false, sidebar: false },
                analytics: { create: false, read: false, update: false, delete: false, sidebar: false },
                tasks: { create: false, read: false, update: false, delete: false, sidebar: false },
                task_list: { create: false, read: false, update: false, delete: false, sidebar: false },
                task_kanban: { create: false, read: false, update: false, delete: false, sidebar: false },
                projects: { create: false, read: false, update: false, delete: false, sidebar: false },
                reports: { read: false, sidebar: false },
                audit: { read: false, sidebar: false },
                roles: { read: false, sidebar: false },
                policies: { read: false, sidebar: false },
                settings: { read: false, sidebar: false },
                notifications: { read: false, sidebar: false },
                security: { read: false, sidebar: false },
                backup: { read: false, sidebar: false }
            };

            Object.keys(systemPolicies).forEach(policyRoleName => {
                if (normalizedUserRoles.includes(policyRoleName.toLowerCase())) {
                    const policy = systemPolicies[policyRoleName];
                    hasPolicy = true;

                    if (policy.users?.create) tempPerms.users.create = true;
                    if (policy.users?.read) tempPerms.users.read = true;
                    if (policy.users?.update) tempPerms.users.update = true;
                    if (policy.users?.delete) tempPerms.users.delete = true;
                    if (policy.users?.sidebar) tempPerms.users.sidebar = true;

                    if (policy.analytics?.read) tempPerms.analytics.read = true;
                    if (policy.analytics?.sidebar) tempPerms.analytics.sidebar = true;

                    if (policy.tasks?.create) tempPerms.tasks.create = true;
                    if (policy.tasks?.read) tempPerms.tasks.read = true;
                    if (policy.tasks?.update) tempPerms.tasks.update = true;
                    if (policy.tasks?.delete) tempPerms.tasks.delete = true;
                    if (policy.tasks?.sidebar) tempPerms.tasks.sidebar = true;

                    // Granular Task List
                    if (policy.task_list?.create) tempPerms.task_list.create = true;
                    if (policy.task_list?.read) tempPerms.task_list.read = true;
                    if (policy.task_list?.update) tempPerms.task_list.update = true;
                    if (policy.task_list?.delete) tempPerms.task_list.delete = true;
                    if (policy.task_list?.sidebar) tempPerms.task_list.sidebar = true;

                    // Granular Task Kanban
                    if (policy.task_kanban?.create) tempPerms.task_kanban.create = true;
                    if (policy.task_kanban?.read) tempPerms.task_kanban.read = true;
                    if (policy.task_kanban?.update) tempPerms.task_kanban.update = true;
                    if (policy.task_kanban?.delete) tempPerms.task_kanban.delete = true;
                    if (policy.task_kanban?.sidebar) tempPerms.task_kanban.sidebar = true;

                    if (policy.projects?.create) tempPerms.projects.create = true;
                    if (policy.projects?.read) tempPerms.projects.read = true;
                    if (policy.projects?.update) tempPerms.projects.update = true;
                    if (policy.projects?.delete) tempPerms.projects.delete = true;
                    if (policy.projects?.sidebar) tempPerms.projects.sidebar = true;

                    if (policy.reports?.read) tempPerms.reports.read = true;
                    if (policy.reports?.sidebar) tempPerms.reports.sidebar = true;

                    if (policy.audit?.read) tempPerms.audit.read = true;
                    if (policy.audit?.sidebar) tempPerms.audit.sidebar = true;

                    if (policy.roles?.read) tempPerms.roles.read = true;
                    if (policy.roles?.sidebar) tempPerms.roles.sidebar = true;

                    if (policy.policies?.read) tempPerms.policies.read = true;
                    if (policy.policies?.sidebar) tempPerms.policies.sidebar = true;

                    if (policy.settings?.read) tempPerms.settings.read = true;
                    if (policy.settings?.sidebar) tempPerms.settings.sidebar = true;

                    if (policy.notifications?.read) tempPerms.notifications.read = true;
                    if (policy.notifications?.sidebar) tempPerms.notifications.sidebar = true;

                    if (policy.security?.read) tempPerms.security.read = true;
                    if (policy.security?.sidebar) tempPerms.security.sidebar = true;

                    if (policy.backup?.read) tempPerms.backup.read = true;
                    if (policy.backup?.sidebar) tempPerms.backup.sidebar = true;
                }
            });

            if (hasPolicy) {
                computedPermissions.view_users = tempPerms.users.sidebar;
                computedPermissions.read_users = tempPerms.users.read;
                computedPermissions.create_users = tempPerms.users.create;
                computedPermissions.update_users = tempPerms.users.update;
                computedPermissions.delete_users = tempPerms.users.delete;

                computedPermissions.view_charts = tempPerms.analytics.sidebar;
                computedPermissions.read_charts = tempPerms.analytics.read;

                computedPermissions.view_tasks = tempPerms.tasks.sidebar;
                computedPermissions.read_tasks = tempPerms.tasks.read;
                computedPermissions.create_tasks = tempPerms.tasks.create;
                computedPermissions.update_tasks = tempPerms.tasks.update;
                computedPermissions.delete_tasks = tempPerms.tasks.delete;

                // Granular Task List Permissions
                computedPermissions.view_task_list = !!tempPerms.task_list?.sidebar;
                computedPermissions.read_task_list = !!tempPerms.task_list?.read;
                computedPermissions.create_task_list = !!tempPerms.task_list?.create;
                computedPermissions.update_task_list = !!tempPerms.task_list?.update;
                computedPermissions.delete_task_list = !!tempPerms.task_list?.delete;

                // Granular Task Kanban Permissions
                computedPermissions.view_task_kanban = !!tempPerms.task_kanban?.sidebar;
                computedPermissions.read_task_kanban = !!tempPerms.task_kanban?.read;
                computedPermissions.create_task_kanban = !!tempPerms.task_kanban?.create;
                computedPermissions.update_task_kanban = !!tempPerms.task_kanban?.update;
                computedPermissions.delete_task_kanban = !!tempPerms.task_kanban?.delete;

                computedPermissions.view_projects = tempPerms.projects.sidebar;
                computedPermissions.read_projects = tempPerms.projects.read;
                computedPermissions.create_projects = tempPerms.projects.create;
                computedPermissions.update_projects = tempPerms.projects.update;
                computedPermissions.delete_projects = tempPerms.projects.delete;

                computedPermissions.view_reports = tempPerms.reports.sidebar;
                computedPermissions.read_reports = tempPerms.reports.read;

                computedPermissions.view_audit = tempPerms.audit.sidebar;
                computedPermissions.read_audit = tempPerms.audit.read;

                computedPermissions.view_roles = tempPerms.roles.sidebar;
                computedPermissions.read_roles = tempPerms.roles.read;

                computedPermissions.view_policies = tempPerms.policies.sidebar;
                computedPermissions.read_policies = tempPerms.policies.read;

                computedPermissions.view_settings = tempPerms.settings.sidebar;
                computedPermissions.read_settings = tempPerms.settings.read;

                computedPermissions.view_notifications = tempPerms.notifications.sidebar;
                computedPermissions.read_notifications = tempPerms.notifications.read;

                computedPermissions.view_security = tempPerms.security.sidebar;
                computedPermissions.read_security = tempPerms.security.read;

                computedPermissions.view_backup = tempPerms.backup.sidebar;
                computedPermissions.read_backup = tempPerms.backup.read;
            }
        }

        setPermissions(computedPermissions);
    }, [user]);

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
        fetchPermissions();
    }, [token, navigate, fetchUsers, fetchPermissions]);

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
                        onAddUser={permissions.create_users ? () => setShowAddModal(true) : null} // Disable if no permission
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
            // [NEW] Tasks View
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
            // [NEW] Projects View
            case 'projects':
                if (!permissions.view_projects) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return (
                    <AdminResourceView
                        resourceName="Project"
                        canCreate={permissions.create_projects}
                        canUpdate={permissions.update_projects}
                        canDelete={permissions.delete_projects}
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
