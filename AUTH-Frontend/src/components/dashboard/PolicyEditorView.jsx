// src/components/dashboard/PolicyEditorView.jsx
import React, { useState, useEffect } from 'react';

/**
 * PolicyEditorView Component
 * 
 * Allows the SuperAdmin to define granular permissions (Policies) for each role.
 * Structured as a "Policy Editor" where specific resources (rows) have specific actions (columns).
 * 
 * Data Structure:
 * policies = {
 *   "Admin": {
 *      "users": { create: true, read: true, update: true, delete: false },
 *      "reports": { create: false, read: true ... }
 *   },
 *   "Manager": { ... }
 * }
 */
const PolicyEditorView = ({ roles }) => {
    // Available Resources in the system (can be dynamic in future)
    const resources = [
        { id: 'users', name: 'Users & Admins' },
        { id: 'roles', name: 'Roles & Permissions' },
        { id: 'policies', name: 'Policy Editor' }, // [NEW] Added to allow hiding policy editor itself from others
        { id: 'charts', name: 'Charts & Analytics' },
        { id: 'settings', name: 'Settings' },
        { id: 'projects', name: 'Projects' },
        { id: 'tasks', name: 'Tasks' },
        { id: 'reports', name: 'Reports' },
        { id: 'audit', name: 'Audit Logs' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'security', name: 'Security' },
        { id: 'backup', name: 'Backup & Restore' }
    ];

    // Available Actions for each resource
    const actions = [
        { id: 'create', name: 'Create', color: 'bg-purple-100 text-purple-700' },
        { id: 'read', name: 'Read', color: 'bg-blue-100 text-blue-700' },
        { id: 'update', name: 'Update', color: 'bg-orange-100 text-orange-700' },
        { id: 'delete', name: 'Delete', color: 'bg-red-100 text-red-700' },
        { id: 'sidebar', name: 'Sidebar', color: 'bg-green-100 text-green-700' } // [NEW] Explicit Sidebar Visibility
    ];

    const [policies, setPolicies] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");

    // Load policies from LocalStorage on mount
    useEffect(() => {
        const storedPolicies = localStorage.getItem('system_policies');
        if (storedPolicies) {
            setPolicies(JSON.parse(storedPolicies));
        } else {
            // Initialize default policies if none exist
            initializeDefaultPolicies();
        }
        setLoading(false);
    }, [roles]); // Re-init if roles change and we need to add new ones

    // Initialize defaults based on current roles
    const initializeDefaultPolicies = () => {
        const defaults = {};
        roles.forEach(role => {
            const roleName = role.Name || role.name || role;
            defaults[roleName] = {};
            resources.forEach(res => {
                // By default, SuperAdmin gets everything, others get nothing (safest)
                // We'll give 'User' read-only on 'projects' as a starter demo
                const isSuper = roleName === 'SuperAdmin';
                defaults[roleName][res.id] = {
                    create: isSuper,
                    read: isSuper || (roleName === 'User' && res.id === 'projects'),
                    update: isSuper,
                    delete: isSuper,
                    sidebar: isSuper || (roleName === 'User' && res.id === 'projects') // Sync sidebar with read initially
                };
            });
        });
        setPolicies(defaults);
        // Don't save yet, let user save
    };

    const handlePermissionChange = (roleName, resourceId, actionId) => {
        setPolicies(prev => {
            const rolePolicy = prev[roleName] || {};
            const resourcePolicy = rolePolicy[resourceId] || {};

            return {
                ...prev,
                [roleName]: {
                    ...rolePolicy,
                    [resourceId]: {
                        ...resourcePolicy,
                        [actionId]: !resourcePolicy[actionId]
                    }
                }
            };
        });
    };

    const handleSave = () => {
        localStorage.setItem('system_policies', JSON.stringify(policies));
        setSaveMessage("Policies saved successfully! Updates will apply immediately.");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    if (loading) return <div className="p-8 text-center">Loading policies...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Policy Editor</h2>
                    <p className="text-gray-500 mt-1">Manage dynamic role-based access control.</p>
                    <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-block">
                        <span className="font-semibold">💡 Tip:</span> Use the <strong>Sidebar</strong> column to show/hide items from the user's menu independently of their Read permissions.
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <span>Save Changes</span>
                </button>
            </div>

            {saveMessage && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {saveMessage}
                </div>
            )}

            {/* Render a Policy Card for each Role */}
            <div className="grid grid-cols-1 gap-8">
                {roles.map(role => {
                    const roleName = role.Name || role.name || role;
                    if (roleName === 'SuperAdmin') return null; // Skip SuperAdmin editing (always full access)

                    return (
                        <div key={roleName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                                        {roleName}
                                    </span>
                                    <span className="text-gray-400 text-sm font-mono">id: {roleName.toLowerCase().replace(/\s+/g, '_')}</span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                </button>
                            </div>

                            <div className="p-6 overflow-x-auto">
                                <table className="w-full min-w-max">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="pb-4 font-semibold text-gray-500 uppercase text-xs tracking-wider w-48">Resource</th>
                                            {actions.map(action => (
                                                <th key={action.id} className="pb-4 font-semibold text-gray-500 uppercase text-xs tracking-wider w-32">
                                                    {action.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {resources.map(resource => {
                                            const rolePolicy = policies[roleName] || {};
                                            const resPolicy = rolePolicy[resource.id] || {};

                                            return (
                                                <tr key={resource.id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                                <span className="text-xs font-bold">{resource.name[0]}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700">{resource.name}</p>
                                                                {/* Helper text for dynamic explanation */}
                                                                <p className="text-[10px] text-gray-400">id: {resource.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {actions.map(action => {
                                                        const isChecked = resPolicy[action.id] === true;

                                                        return (
                                                            <td key={action.id} className="py-4 align-top">
                                                                <div className="flex flex-col">
                                                                    <button
                                                                        onClick={() => handlePermissionChange(roleName, resource.id, action.id)}
                                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isChecked ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                                        role="switch"
                                                                        aria-checked={isChecked}
                                                                    >
                                                                        <span
                                                                            aria-hidden="true"
                                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}
                                                                        />
                                                                    </button>
                                                                    <span className="mt-1 text-xs text-gray-500 font-medium">
                                                                        {isChecked ? 'On' : 'Off'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PolicyEditorView;
