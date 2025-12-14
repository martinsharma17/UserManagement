// src/utils/permissionMapper.js

/**
 * ===================================================================================
 * 🛠️ DEVELOPER GUIDE: PERMISSION MAPPING
 * ===================================================================================
 * 
 * This file acts as the BRIDGE between Backend C# Permissions and Frontend React Logic.
 * 
 * 🔄 FLOW:
 * 1. Backend sends list of strings: ["Permissions.Users.View", "Permissions.Tasks.Edit"]
 * 2. This file converts them into a usable Object: { view_users: true, update_tasks: true }
 * 
 * ➕ HOW TO ADD A NEW PERMISSION:
 * 1. Add the backend string constant to `PERMISSION_CONSTANTS`.
 *    (Must match `Permissions.cs` in Backend).
 * 2. Update `mapBackendPermissionsToFrontend`:
 *    - Add a new key to the returned object (e.g., `view_new_feature`).
 *    - logical check on `permSet.has(...)`.
 * 3. Use this new key in `sidebarItems.jsx` or your components.
 * ===================================================================================
 */

/**
 * Maps backend permission strings (e.g., "Permissions.Tasks.ViewList") 
 * to the frontend permission structure used by dashboards.
 */

export const PERMISSION_CONSTANTS = {
    // Users
    USERS_VIEW: 'Permissions.Users.View',
    USERS_CREATE: 'Permissions.Users.Create',
    USERS_EDIT: 'Permissions.Users.Edit',
    USERS_DELETE: 'Permissions.Users.Delete',

    // Tasks
    TASKS_VIEW: 'Permissions.Tasks.View',

    // Task List
    TASKS_LIST_VIEW: 'Permissions.Tasks.List.View',
    TASKS_LIST_CREATE: 'Permissions.Tasks.List.Create',
    TASKS_LIST_EDIT: 'Permissions.Tasks.List.Edit',
    TASKS_LIST_DELETE: 'Permissions.Tasks.List.Delete',

    // Task Kanban
    TASKS_KANBAN_VIEW: 'Permissions.Tasks.Kanban.View',
    TASKS_KANBAN_CREATE: 'Permissions.Tasks.Kanban.Create',
    TASKS_KANBAN_EDIT: 'Permissions.Tasks.Kanban.Edit',
    TASKS_KANBAN_DELETE: 'Permissions.Tasks.Kanban.Delete',

    // Projects
    PROJECTS_VIEW: 'Permissions.Projects.View',
    PROJECTS_CREATE: 'Permissions.Projects.Create',
    PROJECTS_EDIT: 'Permissions.Projects.Edit',
    PROJECTS_DELETE: 'Permissions.Projects.Delete',

    // Nested Levels
    MY_PROJECTS_VIEW: 'Permissions.Projects.MyProjects.View',
    MY_PROJECTS_CREATE: 'Permissions.Projects.MyProjects.Create',
    MY_PROJECTS_EDIT: 'Permissions.Projects.MyProjects.Edit',
    MY_PROJECTS_DELETE: 'Permissions.Projects.MyProjects.Delete',

    PROJECT_CONTENT_VIEW: 'Permissions.Projects.Content.View',
    PROJECT_CONTENT_CREATE: 'Permissions.Projects.Content.Create',
    PROJECT_CONTENT_EDIT: 'Permissions.Projects.Content.Edit',
    PROJECT_CONTENT_DELETE: 'Permissions.Projects.Content.Delete',

    PROJECT_TEAM_VIEW: 'Permissions.Projects.Team.View',
    PROJECT_TEAM_CREATE: 'Permissions.Projects.Team.Create',
    PROJECT_TEAM_EDIT: 'Permissions.Projects.Team.Edit',
    PROJECT_TEAM_DELETE: 'Permissions.Projects.Team.Delete',

    PROJECT_SETTINGS_VIEW: 'Permissions.Projects.Settings.View',
    PROJECT_SETTINGS_CREATE: 'Permissions.Projects.Settings.Create',
    PROJECT_SETTINGS_EDIT: 'Permissions.Projects.Settings.Edit',
    PROJECT_SETTINGS_DELETE: 'Permissions.Projects.Settings.Delete',

    // Analytics
    ANALYTICS_VIEW: 'Permissions.Analytics.View',
};

/**
 * Converts an array of backend permission strings to the frontend permission object structure.
 * @param {string[]} backendPermissions - Array of permission strings from backend
 * @returns {Object} Frontend permission object
 */
export function mapBackendPermissionsToFrontend(backendPermissions) {
    const permSet = new Set(backendPermissions);

    return {
        // Users
        users: {
            create: permSet.has(PERMISSION_CONSTANTS.USERS_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.USERS_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.USERS_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.USERS_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.USERS_VIEW),
        },

        // Analytics
        analytics: {
            read: permSet.has(PERMISSION_CONSTANTS.ANALYTICS_VIEW),
            sidebar: permSet.has(PERMISSION_CONSTANTS.ANALYTICS_VIEW),
        },

        // Tasks (Parent)
        tasks: {
            create: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_CREATE) || permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.TASKS_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_EDIT) || permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_DELETE) || permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.TASKS_VIEW) ||
                permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW) ||
                permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),
        },

        // Task List
        task_list: {
            create: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW),
        },

        // Task Kanban
        task_kanban: {
            create: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),
        },

        // Projects
        projects: {
            create: permSet.has(PERMISSION_CONSTANTS.PROJECTS_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.PROJECTS_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.PROJECTS_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.PROJECTS_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.PROJECTS_VIEW),
        },
        my_projects: {
            create: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_VIEW),
        },
        project_content: {
            create: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_VIEW),
        },
        project_team: {
            create: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_VIEW),
        },
        project_settings: {
            create: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_CREATE),
            read: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_VIEW),
            update: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_EDIT),
            delete: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_DELETE),
            sidebar: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_VIEW),
        },

        // Legacy/Placeholder permissions (for components that haven't been updated yet)
        reports: { read: false, sidebar: false },
        audit: { read: false, sidebar: false },
        roles: { read: false, sidebar: false },
        policies: { read: false, sidebar: false },
        settings: { read: false, sidebar: false },
        notifications: { read: false, sidebar: false },
        security: { read: false, sidebar: false },
        backup: { read: false, sidebar: false },

        // Computed permissions for convenience
        create_users: permSet.has(PERMISSION_CONSTANTS.USERS_CREATE),
        read_users: permSet.has(PERMISSION_CONSTANTS.USERS_VIEW),
        update_users: permSet.has(PERMISSION_CONSTANTS.USERS_EDIT),
        delete_users: permSet.has(PERMISSION_CONSTANTS.USERS_DELETE),

        create_task_list: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_CREATE),
        read_task_list: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW),
        update_task_list: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_EDIT),
        delete_task_list: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_DELETE),

        create_task_kanban: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_CREATE),
        read_task_kanban: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),
        update_task_kanban: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_EDIT),
        delete_task_kanban: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_DELETE),

        create_projects: permSet.has(PERMISSION_CONSTANTS.PROJECTS_CREATE),
        read_projects: permSet.has(PERMISSION_CONSTANTS.PROJECTS_VIEW),
        update_projects: permSet.has(PERMISSION_CONSTANTS.PROJECTS_EDIT),
        delete_projects: permSet.has(PERMISSION_CONSTANTS.PROJECTS_DELETE),

        // Sidebar-specific permissions (for sidebarItems.jsx filtering)
        view_users: permSet.has(PERMISSION_CONSTANTS.USERS_VIEW),
        view_charts: permSet.has(PERMISSION_CONSTANTS.ANALYTICS_VIEW),
        view_analytics: permSet.has(PERMISSION_CONSTANTS.ANALYTICS_VIEW),

        // Projects Sidebar
        view_projects: permSet.has(PERMISSION_CONSTANTS.PROJECTS_VIEW),
        view_my_projects: permSet.has(PERMISSION_CONSTANTS.MY_PROJECTS_VIEW),
        view_project_content: permSet.has(PERMISSION_CONSTANTS.PROJECT_CONTENT_VIEW),
        view_project_team: permSet.has(PERMISSION_CONSTANTS.PROJECT_TEAM_VIEW),
        view_project_settings: permSet.has(PERMISSION_CONSTANTS.PROJECT_SETTINGS_VIEW),

        view_tasks: permSet.has(PERMISSION_CONSTANTS.TASKS_VIEW) ||
            permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW) ||
            permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),
        view_task_list: permSet.has(PERMISSION_CONSTANTS.TASKS_LIST_VIEW),
        view_task_kanban: permSet.has(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW),

        // Additional sidebar items (set to false for now, can be enabled via backend later)
        view_roles: false,
        view_policies: false,
        view_reports: false,
        view_audit: false,
        view_notifications: false,
        view_settings: false,
        view_security: false,
        view_backup: false,
        dashboard: true, // Dashboard is always visible
    };
}

/**
 * Converts frontend permission object back to backend permission array.
 * Used by PolicyEditorView when saving.
 * @param {Object} frontendPermissions - Frontend permission object for a single role
 * @returns {string[]} Array of permission strings for backend
 */
export function mapFrontendPermissionsToBackend(frontendPermissions) {
    const permissions = [];

    // Users
    if (frontendPermissions.users?.create) permissions.push(PERMISSION_CONSTANTS.USERS_CREATE);
    if (frontendPermissions.users?.read) permissions.push(PERMISSION_CONSTANTS.USERS_VIEW);
    if (frontendPermissions.users?.update) permissions.push(PERMISSION_CONSTANTS.USERS_EDIT);
    if (frontendPermissions.users?.delete) permissions.push(PERMISSION_CONSTANTS.USERS_DELETE);

    // Tasks Parent
    if (frontendPermissions.tasks?.read) permissions.push(PERMISSION_CONSTANTS.TASKS_VIEW);

    // Task List
    if (frontendPermissions.task_list?.create) permissions.push(PERMISSION_CONSTANTS.TASKS_LIST_CREATE);
    if (frontendPermissions.task_list?.read) permissions.push(PERMISSION_CONSTANTS.TASKS_LIST_VIEW);
    if (frontendPermissions.task_list?.update) permissions.push(PERMISSION_CONSTANTS.TASKS_LIST_EDIT);
    if (frontendPermissions.task_list?.delete) permissions.push(PERMISSION_CONSTANTS.TASKS_LIST_DELETE);

    // Task Kanban
    if (frontendPermissions.task_kanban?.create) permissions.push(PERMISSION_CONSTANTS.TASKS_KANBAN_CREATE);
    if (frontendPermissions.task_kanban?.read) permissions.push(PERMISSION_CONSTANTS.TASKS_KANBAN_VIEW);
    if (frontendPermissions.task_kanban?.update) permissions.push(PERMISSION_CONSTANTS.TASKS_KANBAN_EDIT);
    if (frontendPermissions.task_kanban?.delete) permissions.push(PERMISSION_CONSTANTS.TASKS_KANBAN_DELETE);

    // Projects (Parent)
    if (frontendPermissions.projects?.create) permissions.push(PERMISSION_CONSTANTS.PROJECTS_CREATE);
    if (frontendPermissions.projects?.read) permissions.push(PERMISSION_CONSTANTS.PROJECTS_VIEW);
    if (frontendPermissions.projects?.update) permissions.push(PERMISSION_CONSTANTS.PROJECTS_EDIT);
    if (frontendPermissions.projects?.delete) permissions.push(PERMISSION_CONSTANTS.PROJECTS_DELETE);

    // My Projects
    if (frontendPermissions.my_projects?.create) permissions.push(PERMISSION_CONSTANTS.MY_PROJECTS_CREATE);
    if (frontendPermissions.my_projects?.read) permissions.push(PERMISSION_CONSTANTS.MY_PROJECTS_VIEW);
    if (frontendPermissions.my_projects?.update) permissions.push(PERMISSION_CONSTANTS.MY_PROJECTS_EDIT);
    if (frontendPermissions.my_projects?.delete) permissions.push(PERMISSION_CONSTANTS.MY_PROJECTS_DELETE);

    // Project Content
    if (frontendPermissions.project_content?.create) permissions.push(PERMISSION_CONSTANTS.PROJECT_CONTENT_CREATE);
    if (frontendPermissions.project_content?.read) permissions.push(PERMISSION_CONSTANTS.PROJECT_CONTENT_VIEW);
    if (frontendPermissions.project_content?.update) permissions.push(PERMISSION_CONSTANTS.PROJECT_CONTENT_EDIT);
    if (frontendPermissions.project_content?.delete) permissions.push(PERMISSION_CONSTANTS.PROJECT_CONTENT_DELETE);

    // Project Team
    if (frontendPermissions.project_team?.create) permissions.push(PERMISSION_CONSTANTS.PROJECT_TEAM_CREATE);
    if (frontendPermissions.project_team?.read) permissions.push(PERMISSION_CONSTANTS.PROJECT_TEAM_VIEW);
    if (frontendPermissions.project_team?.update) permissions.push(PERMISSION_CONSTANTS.PROJECT_TEAM_EDIT);
    if (frontendPermissions.project_team?.delete) permissions.push(PERMISSION_CONSTANTS.PROJECT_TEAM_DELETE);

    // Project Settings
    if (frontendPermissions.project_settings?.create) permissions.push(PERMISSION_CONSTANTS.PROJECT_SETTINGS_CREATE);
    if (frontendPermissions.project_settings?.read) permissions.push(PERMISSION_CONSTANTS.PROJECT_SETTINGS_VIEW);
    if (frontendPermissions.project_settings?.update) permissions.push(PERMISSION_CONSTANTS.PROJECT_SETTINGS_EDIT);
    if (frontendPermissions.project_settings?.delete) permissions.push(PERMISSION_CONSTANTS.PROJECT_SETTINGS_DELETE);

    // Analytics
    if (frontendPermissions.analytics?.read || frontendPermissions.charts?.read) {
        permissions.push(PERMISSION_CONSTANTS.ANALYTICS_VIEW);
    }

    return permissions;
}
