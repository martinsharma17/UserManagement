// src/components/dashboard/RolesManagementView.jsx
import React, { useState, useEffect } from 'react';

const RolesManagementView = ({ apiBase, token, users, onRefreshUsers }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [assignRoleData, setAssignRoleData] = useState({ email: "", roleName: "" });
    const [selectedUser, setSelectedUser] = useState(null);

    // System roles that cannot be deleted
    const systemRoles = ["SuperAdmin", "Admin", "User"];

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/api/Roles`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setRoles(data.roles || []);
            } else {
                setError("Failed to fetch roles");
            }
        } catch (err) {
            setError("Network error while fetching roles");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            setError("Role name is required");
            return;
        }

        try {
            const response = await fetch(`${apiBase}/api/Roles/CreateRole`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ RoleName: newRoleName.trim() })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(`Role "${newRoleName}" created successfully`);
                setNewRoleName("");
                setShowCreateModal(false);
                fetchRoles();
            } else {
                setError(data.message || "Failed to create role");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleDeleteRole = async (roleName) => {
        if (systemRoles.includes(roleName)) {
            setError("Cannot delete system roles");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;

        try {
            const response = await fetch(`${apiBase}/api/Roles/DeleteRole/${encodeURIComponent(roleName)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(`Role "${roleName}" deleted successfully`);
                fetchRoles();
            } else {
                setError(data.message || "Failed to delete role");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleAssignRole = async () => {
        if (!assignRoleData.email || !assignRoleData.roleName) {
            setError("Email and role are required");
            return;
        }

        try {
            const response = await fetch(`${apiBase}/api/Roles/AssignRole`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    Email: assignRoleData.email,
                    RoleName: assignRoleData.roleName
                })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || "Role assigned successfully");
                setAssignRoleData({ email: "", roleName: "" });
                setShowAssignModal(false);
                setSelectedUser(null);
                if (onRefreshUsers) onRefreshUsers();
            } else {
                setError(data.message || "Failed to assign role");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleRemoveRole = async (email, roleName) => {
        if (!window.confirm(`Are you sure you want to remove the role "${roleName}" from this user?`)) return;

        try {
            const response = await fetch(`${apiBase}/api/Roles/RemoveRole`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    Email: email,
                    RoleName: roleName
                })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || "Role removed successfully");
                if (onRefreshUsers) onRefreshUsers();
            } else {
                setError(data.message || "Failed to remove role");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const openAssignModal = (user) => {
        setSelectedUser(user);
        setAssignRoleData({ email: user.Email || user.email, roleName: "" });
        setShowAssignModal(true);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading roles...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions Management</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Create New Role
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            {/* Roles List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">All Roles ({roles.length})</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map((role) => {
                            const isSystemRole = systemRoles.includes(role.Name);
                            return (
                                <div
                                    key={role.Id}
                                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">{role.Name}</h4>
                                        {isSystemRole && (
                                            <span className="text-xs text-blue-600 mt-1">System Role</span>
                                        )}
                                    </div>
                                    {!isSystemRole && (
                                        <button
                                            onClick={() => handleDeleteRole(role.Name)}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Users with Roles */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Assign Roles to Users</h3>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Roles</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => {
                                const userRoles = user.Roles || user.roles || [];
                                return (
                                    <tr key={user.Id || user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{user.Name || user.UserName || user.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{user.Email || user.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {userRoles.length === 0 ? (
                                                    <span className="text-xs text-gray-500">No roles</span>
                                                ) : (
                                                    userRoles.map((role, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                                        >
                                                            {role}
                                                            <button
                                                                onClick={() => handleRemoveRole(user.Email || user.email, role)}
                                                                className="hover:text-red-700"
                                                                title="Remove role"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openAssignModal(user)}
                                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                            >
                                                Assign Role
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Manager, Editor, Viewer"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleCreateRole();
                                    }}
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                <p>Note: System roles (SuperAdmin, Admin, User) cannot be deleted.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewRoleName("");
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRole}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Role Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Assign Role to User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                                <input
                                    type="email"
                                    value={assignRoleData.email}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                                {selectedUser && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedUser.Name || selectedUser.UserName || selectedUser.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                                <select
                                    value={assignRoleData.roleName}
                                    onChange={(e) => setAssignRoleData({ ...assignRoleData, roleName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => {
                                        const userRoles = selectedUser?.Roles || selectedUser?.roles || [];
                                        const hasRole = userRoles.includes(role.Name);
                                        return (
                                            <option
                                                key={role.Id}
                                                value={role.Name}
                                                disabled={hasRole}
                                            >
                                                {role.Name} {hasRole && "(Already assigned)"}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setAssignRoleData({ email: "", roleName: "" });
                                    setSelectedUser(null);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignRole}
                                disabled={!assignRoleData.roleName}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Assign Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesManagementView;

