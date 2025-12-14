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
                Analytics.View
            };
        }
    }
}
