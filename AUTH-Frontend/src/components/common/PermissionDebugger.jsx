// src/components/PermissionDebugger.jsx
// Add this component to any dashboard to see what permissions are loaded

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const PermissionDebugger = () => {
    const { permissions, user } = useAuth();

    const handleRefreshPermissions = () => {
        console.log('🔄 Manually refreshing page to fetch new permissions...');
        window.location.reload();
    };

    const handleCheckAPI = async () => {
        const token = localStorage.getItem('authToken'); // Fixed key from 'token' to 'authToken'
        console.log('📡 Manually fetching permissions from API...');

        if (!token) {
            console.error('❌ No auth token found in localStorage');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/user/my-permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const text = await response.text();
                // Try to parse as JSON if possible, otherwise use text
                try {
                    const json = JSON.parse(text);
                    console.error('❌ API Error (JSON):', response.status, json);
                } catch {
                    console.error('❌ API Error (Text):', response.status, text);
                }
                return;
            }

            const data = await response.json();
            console.log('📥 API Response:', data);
        } catch (error) {
            console.error('❌ Network/Script Error:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#1f2937',
            color: '#fff',
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'auto',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                🔍 Permission Debugger
            </h3>

            <div style={{ marginBottom: '10px' }}>
                <strong>User:</strong> {user?.email || 'Not loaded'}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Roles:</strong> {user?.roles?.join(', ') || 'Not loaded'}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Permissions Loaded:</strong> {permissions ? 'Yes ✅' : 'No ❌'}
            </div>

            {permissions && (
                <div style={{ marginBottom: '10px' }}>
                    <strong>Sidebar Permissions:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>view_users: {permissions.view_users ? '✅' : '❌'}</li>
                        <li>view_charts: {permissions.view_charts ? '✅' : '❌'}</li>
                        <li>view_projects: {permissions.view_projects ? '✅' : '❌'}</li>
                        <li>view_tasks: {permissions.view_tasks ? '✅' : '❌'}</li>
                        <li>view_task_list: {permissions.view_task_list ? '✅' : '❌'}</li>
                        <li>view_task_kanban: {permissions.view_task_kanban ? '✅' : '❌'}</li>
                    </ul>
                </div>
            )}

            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                <button
                    onClick={handleRefreshPermissions}
                    style={{
                        padding: '8px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    🔄 Refresh Page
                </button>

                <button
                    onClick={handleCheckAPI}
                    style={{
                        padding: '8px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    📡 Check API
                </button>

                <button
                    onClick={() => console.log('Full permissions object:', permissions)}
                    style={{
                        padding: '8px',
                        background: '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    📋 Log to Console
                </button>
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
                Press F12 to see console logs
            </div>
        </div>
    );
};

export default PermissionDebugger;
