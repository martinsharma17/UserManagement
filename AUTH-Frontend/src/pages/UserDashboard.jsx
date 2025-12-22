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
    const { user, logout, permissions: contextPermissions } = useAuth();
    const navigate = useNavigate();

    // State for sidebar and active view
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');

    // Use permissions from AuthContext (fetched from backend)
    const permissions = contextPermissions || {};

    // Show loading state while permissions are being fetched
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
                permissions={permissions}
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