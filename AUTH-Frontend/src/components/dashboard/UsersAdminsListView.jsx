// src/components/dashboard/UsersAdminsListView.jsx
import React from 'react';

const UsersAdminsListView = ({ 
    users, 
    admins, 
    isAlreadyAdmin, 
    onAddUser, 
    onMakeAdmin, 
    onDelete, 
    onRevokeAdmin 
}) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Users & Admins Management</h2>
                <button
                    onClick={onAddUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add New User/Admin
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{user.Id || user.id || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{user.Name || user.UserName || user.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{user.Email || user.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onMakeAdmin(user.Id || user.id)}
                                                    disabled={isAlreadyAdmin(user)}
                                                    title={isAlreadyAdmin(user) ? "Already an admin" : "Promote to admin"}
                                                    className={`px-3 py-1 text-xs rounded ${isAlreadyAdmin(user)
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                >
                                                    Make Admin
                                                </button>
                                                <button
                                                    onClick={() => onDelete(user.Id || user.id, false)}
                                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admins Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Admins ({admins.length})</h2>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{admin.Id || admin.id || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{admin.Name || admin.UserName || admin.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{admin.Email || admin.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onRevokeAdmin(admin.Id || admin.id)}
                                                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                >
                                                    Revoke Admin
                                                </button>
                                                <button
                                                    onClick={() => onDelete(admin.Id || admin.id, true)}
                                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersAdminsListView;

