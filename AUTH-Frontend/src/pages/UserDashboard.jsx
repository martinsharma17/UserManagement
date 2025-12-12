// src/pages/UserDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getUserMenuItems } from '../components/dashboard/sidebarItems.jsx';
import SettingsView from '../components/dashboard/SettingsView.jsx';
import NotificationsView from '../components/dashboard/NotificationsView.jsx';
import AdminResourceView from '../components/dashboard/admin/AdminResourceView.jsx'; // Reuse generic resource view
import TaskListView from '../components/dashboard/tasks/TaskListView.jsx';
import TaskKanbanView from '../components/dashboard/tasks/TaskKanbanView.jsx';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for sidebar and active view
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [permissions, setPermissions] = useState({});

    // Data state for views if permissions allow
    const [usersList, setUsersList] = useState([]);

    // Fetch permissions (Dynamic from Policy System)
    const fetchPermissions = useCallback(async () => {
        const systemPoliciesJson = localStorage.getItem('system_policies');
        let computedPermissions = {
            view_users: false,
            // defaults ...
        };

        if (systemPoliciesJson) {
            const systemPolicies = JSON.parse(systemPoliciesJson);

            // Get user roles
            let userRoles = [];
            if (user?.Role) userRoles = Array.isArray(user.Role) ? user.Role : [user.Role];
            else if (user?.roles) userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
            else if (user?.role) userRoles = Array.isArray(user.role) ? user.role : [user.role];
            else userRoles = ['User'];

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

                    // Helper to map generic permissions
                    // Users
                    if (policy.users?.read) tempPerms.users.read = true;
                    if (policy.users?.sidebar) tempPerms.users.sidebar = true;

                    // Analytics
                    if (policy.analytics?.read) tempPerms.analytics.read = true;
                    if (policy.analytics?.sidebar) tempPerms.analytics.sidebar = true;
                    if (policy.charts?.read) tempPerms.analytics.read = true; // Fallback helper
                    if (policy.charts?.sidebar) tempPerms.analytics.sidebar = true;

                    // Tasks
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

                    // Projects
                    if (policy.projects?.create) tempPerms.projects.create = true;
                    if (policy.projects?.read) tempPerms.projects.read = true;
                    if (policy.projects?.update) tempPerms.projects.update = true;
                    if (policy.projects?.delete) tempPerms.projects.delete = true;
                    if (policy.projects?.sidebar) tempPerms.projects.sidebar = true;

                    // Others
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
                // VIEW_ = Sidebar Visibility
                computedPermissions.view_users = tempPerms.users.sidebar;
                computedPermissions.read_users = tempPerms.users.read;

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

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const menuItems = getUserMenuItems(permissions);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // Render logic based on activeView
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    // Re-using the existing dashboard design
                    <div className="bg-white rounded-lg shadow p-6 md:p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h1>
                                <p className="text-gray-600 mt-2">Your personal dashboard</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Email:</span> {user?.email}</p>
                                    <p><span className="font-medium">Roles:</span> {user?.roles?.join(', ') || 'User'}</p>
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
                                <div className="space-y-2">
                                    <p>Member since: {new Date().toLocaleDateString()}</p>
                                    <p>Account status: <span className="text-green-600 font-medium">Active</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button onClick={() => setActiveView('settings')} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                    <h4 className="font-medium text-gray-900">Edit Profile</h4>
                                    <p className="text-sm text-gray-600 mt-1">Update your information</p>
                                </button>
                                <button onClick={() => setActiveView('settings')} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                    <h4 className="font-medium text-gray-900">Change Password</h4>
                                    <p className="text-sm text-gray-600 mt-1">Update your security</p>
                                </button>
                                <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                    <h4 className="font-medium text-gray-900">View Activity</h4>
                                    <p className="text-sm text-gray-600 mt-1">Check your account history</p>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                if (!permissions.read_users) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Users View (Requires Fetch Logic)</div>;
            case 'roles':
                if (!permissions.read_roles) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Roles View (Coming Soon)</div>;
            case 'policies':
                if (!permissions.read_policies) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Policy Editor (Restricted)</div>;
            case 'charts':
                if (!permissions.read_charts) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Analytics View</div>;
            case 'tasks':
                if (!permissions.read_tasks) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
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
                if (!permissions.read_projects) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return (
                    <AdminResourceView
                        resourceName="Project"
                        canCreate={permissions.create_projects}
                        canUpdate={permissions.update_projects}
                        canDelete={permissions.delete_projects}
                    />
                );
            case 'reports':
                if (!permissions.read_reports) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Reports Module</div>;
            case 'audit':
                if (!permissions.read_audit) return <div className="p-8 text-center text-red-500">Access Denied (Requires Read Permission)</div>;
                return <div className="p-8 text-center text-gray-500">Audit Logs Module</div>;
            case 'settings':
                // Check read OR view? Usually settings is "open" but let's enforce read if desired
                if (!permissions.read_settings && permissions.read_settings !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <SettingsView />;
            case 'notifications':
                if (!permissions.read_notifications && permissions.read_notifications !== undefined) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <NotificationsView />;
            case 'security':
                if (!permissions.read_security) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Security Settings</div>;
            case 'backup':
                if (!permissions.read_backup) return <div className="p-8 text-center text-red-500">Access Denied</div>;
                return <div className="p-8 text-center text-gray-500">Backup & Restore</div>;
            default:
                return <div>View not found</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Component */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                menuItems={menuItems}
                onLogout={handleLogout}
                user={user}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {renderActiveView()}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;