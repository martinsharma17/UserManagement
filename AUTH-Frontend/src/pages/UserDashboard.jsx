// src/pages/UserDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import { getUserMenuItems } from '../components/dashboard/sidebarItems.jsx';
import SettingsView from '../components/dashboard/SettingsView.jsx';
import NotificationsView from '../components/dashboard/NotificationsView.jsx';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for sidebar and active view
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');

    const menuItems = getUserMenuItems();

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
                            {/* Logout button removed from here as it's now in the sidebar */}
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
            case 'settings':
                return <SettingsView />;
            case 'notifications':
                return <NotificationsView />;
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