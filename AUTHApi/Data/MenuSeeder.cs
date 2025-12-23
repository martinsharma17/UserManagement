using AUTHApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace AUTHApi.Data
{
    public static class MenuSeeder
    {
        public static async Task SeedMenuItemsAsync(ApplicationDbContext context)
        {
            // DEV MODE: Clear existing menu items to apply changes
            context.MenuItems.RemoveRange(context.MenuItems);
            await context.SaveChangesAsync();

            Console.WriteLine("Seeding Menu Items...");

            // 1. Core Top-Level Items
            var dashboardItem = new MenuItem { Title = "Dashboard", ViewId = "dashboard", Icon = "DashboardIcon", Permission = "dashboard", Order = 1 };
            
            // Users Management (Single Entry)
            var usersItem = new MenuItem { Title = "User Management", ViewId = "users", Icon = "UsersIcon", Permission = "view_users", Order = 2 };
            
            var items = new List<MenuItem>
            {
                dashboardItem,
                usersItem,
                new MenuItem { Title = "Roles & Permissions", ViewId = "roles", Icon = "RolesIcon", Permission = "view_roles", Order = 3 },
                new MenuItem { Title = "Policy Editor", ViewId = "policies", Icon = "PolicyIcon", Permission = "view_policies", Order = 4 },
                new MenuItem { Title = "Charts & Analytics", ViewId = "charts", Icon = "ChartsIcon", Permission = "view_charts", Order = 5 },
            };

            // Projects (Parent)
            var projectsItem = new MenuItem { Title = "Projects", ViewId = "projects", Icon = "ProjectIcon", Permission = "view_projects", Order = 6 };
            items.Add(projectsItem);

            // Tasks (Parent)
            var tasksItem = new MenuItem { Title = "Tasks", ViewId = "tasks", Icon = "TaskIcon", Permission = "view_tasks", Order = 7 };
            items.Add(tasksItem);
            
            items.Add(new MenuItem { Title = "Reports", ViewId = "reports", Icon = "ReportsIcon", Permission = "view_reports", Order = 8 });
            items.Add(new MenuItem { Title = "Audit Logs", ViewId = "audit", Icon = "AuditIcon", Permission = "view_audit", Order = 9 });
            items.Add(new MenuItem { Title = "Notifications", ViewId = "notifications", Icon = "NotificationsIcon", Permission = "view_notifications", Order = 10 });
            items.Add(new MenuItem { Title = "Settings", ViewId = "settings", Icon = "SettingsIcon", Permission = "view_settings", Order = 11 });
            items.Add(new MenuItem { Title = "Security", ViewId = "security", Icon = "SecurityIcon", Permission = "view_security", Order = 12 });
            items.Add(new MenuItem { Title = "Backup & Restore", ViewId = "backup", Icon = "BackupIcon", Permission = "view_backup", Order = 13 });

            // Add Parents first to generate IDs
            await context.MenuItems.AddRangeAsync(items);
            await context.SaveChangesAsync();

            // --- Level 2: Projects ---
            var myProjects = new MenuItem { Title = "My Projects", ViewId = "my_projects", Permission = "view_my_projects", Order = 1, ParentId = projectsItem.Id };
            await context.MenuItems.AddAsync(myProjects);
            await context.SaveChangesAsync();

            // --- Level 3: Project Content ---
            var projectContent = new MenuItem { Title = "Project Content", ViewId = "project_content", Permission = "view_project_content", Order = 1, ParentId = myProjects.Id };
            await context.MenuItems.AddAsync(projectContent);
            await context.SaveChangesAsync();

            // --- Level 4: Project Team ---
            var projectTeam = new MenuItem { Title = "Team & Workflow", ViewId = "project_team", Permission = "view_project_team", Order = 1, ParentId = projectContent.Id };
            await context.MenuItems.AddAsync(projectTeam);
            await context.SaveChangesAsync();

            // --- Level 5: Project Settings ---
            var projectSettings = new MenuItem { Title = "Project Settings", ViewId = "project_settings", Permission = "view_project_settings", Order = 1, ParentId = projectTeam.Id };
            await context.MenuItems.AddAsync(projectSettings);
            await context.SaveChangesAsync();


            // --- Level 2: Tasks ---
            var taskList = new MenuItem { Title = "List", ViewId = "task_list", Permission = "view_task_list", Order = 1, ParentId = tasksItem.Id };
            var taskKanban = new MenuItem { Title = "Kanban", ViewId = "task_kanban", Permission = "view_task_kanban", Order = 2, ParentId = tasksItem.Id };
            await context.MenuItems.AddRangeAsync(taskList, taskKanban);
            await context.SaveChangesAsync();

            Console.WriteLine("Menu Items Seeded Successfully.");
        }
    }
}




// INSERT INTO MenuItems (Title, ViewId, Icon, Permission, [Order], ParentId, IsVisible)
// VALUES (
//     'Support',        -- Title
//     'support_view',   -- ViewId
//     'HelpIcon',       -- Icon Component Name
//     'view_support',   -- Permission Key
//     10,               -- Order
//     NULL,             -- ParentId (Top level)
//     1                 -- IsVisible (1 = True, required for your schema)
// );