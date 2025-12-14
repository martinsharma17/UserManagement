namespace AUTHApi.Core.Security
{
    public static class Permissions
    {
        public static class Users
        {
            public const string View = "Permissions.Users.View";
            public const string Create = "Permissions.Users.Create";
            public const string Edit = "Permissions.Users.Edit";
            public const string Delete = "Permissions.Users.Delete";
        }

        public static class Tasks
        {
            public const string View = "Permissions.Tasks.View"; // Generic parent view
            
            // Task List
            public const string ViewList = "Permissions.Tasks.List.View";
            public const string CreateList = "Permissions.Tasks.List.Create";
            public const string EditList = "Permissions.Tasks.List.Edit";
            public const string DeleteList = "Permissions.Tasks.List.Delete";

            // Task Kanban
            public const string ViewKanban = "Permissions.Tasks.Kanban.View";
            public const string CreateKanban = "Permissions.Tasks.Kanban.Create";
            public const string EditKanban = "Permissions.Tasks.Kanban.Edit";
            public const string DeleteKanban = "Permissions.Tasks.Kanban.Delete";
        }

        public static class Projects
        {
            public const string View = "Permissions.Projects.View";
            public const string Create = "Permissions.Projects.Create";
            public const string Edit = "Permissions.Projects.Edit";
            public const string Delete = "Permissions.Projects.Delete";

            // Level 2: My Projects
            public const string ViewMyProjects = "Permissions.Projects.MyProjects.View";
            public const string CreateMyProjects = "Permissions.Projects.MyProjects.Create";
            public const string EditMyProjects = "Permissions.Projects.MyProjects.Edit";
            public const string DeleteMyProjects = "Permissions.Projects.MyProjects.Delete";

            // Level 3: Project Content
            public const string ViewContent = "Permissions.Projects.Content.View";
            public const string CreateContent = "Permissions.Projects.Content.Create";
            public const string EditContent = "Permissions.Projects.Content.Edit";
            public const string DeleteContent = "Permissions.Projects.Content.Delete";

            // Level 4: Team & Workflow
            public const string ViewTeam = "Permissions.Projects.Team.View";
            public const string CreateTeam = "Permissions.Projects.Team.Create";
            public const string EditTeam = "Permissions.Projects.Team.Edit";
            public const string DeleteTeam = "Permissions.Projects.Team.Delete";

            // Level 5: Project Settings
            public const string ViewSettings = "Permissions.Projects.Settings.View";
            public const string CreateSettings = "Permissions.Projects.Settings.Create";
            public const string EditSettings = "Permissions.Projects.Settings.Edit";
            public const string DeleteSettings = "Permissions.Projects.Settings.Delete";
        }
        
        public static class Analytics
        {
            public const string View = "Permissions.Analytics.View";
        }

        // Helper to get all permissions for seeding or listing
        public static List<string> GetAllPermissions()
        {
            return new List<string>
            {
                Users.View, Users.Create, Users.Edit, Users.Delete,
                Tasks.View,
                Tasks.ViewList, Tasks.CreateList, Tasks.EditList, Tasks.DeleteList,
                Tasks.ViewKanban, Tasks.CreateKanban, Tasks.EditKanban, Tasks.DeleteKanban,
                Projects.View, Projects.Create, Projects.Edit, Projects.Delete,
                Projects.ViewMyProjects, Projects.CreateMyProjects, Projects.EditMyProjects, Projects.DeleteMyProjects,
                Projects.ViewContent, Projects.CreateContent, Projects.EditContent, Projects.DeleteContent,
                Projects.ViewTeam, Projects.CreateTeam, Projects.EditTeam, Projects.DeleteTeam,
                Projects.ViewSettings, Projects.CreateSettings, Projects.EditSettings, Projects.DeleteSettings,
                Analytics.View
            };
        }
    }
}
