// src/components/dashboard/admin/AdminUsersListView.jsx
import React from 'react';

const AdminUsersListView = ({ users, onAddUser, onDelete }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Assigned Users</h2>
                    <p className="text-gray-600 text-sm mt-1">Users assigned to you by SuperAdmin</p>
                </div>
                <button
                    onClick={onAddUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Users ({users.length})</h3>
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            Admin Access Only
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No users assigned to you yet. Contact SuperAdmin for access.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id || user.Id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{user.name || user.Name || user.UserName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">{user.email || user.Email || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                {user.roles?.join(', ') || user.Roles?.join(', ') || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onDelete(user.id || user.Id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersListView;

