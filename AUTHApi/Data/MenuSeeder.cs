using AUTHApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace AUTHApi.Data
{
    public static class MenuSeeder
    {
        public static async Task SeedMenuItemsAsync(ApplicationDbContext context)
        {
            // DEV MODE: Clear existing menu items to apply changes and avoid duplicates
            // This ensures your sidebar always matches this code perfectly.
            context.MenuItems.RemoveRange(context.MenuItems);
            await context.SaveChangesAsync();

            Console.WriteLine("Seeding Menu Items...");

            // 1. Define Core Top-Level Items
            var dashboardItem = new MenuItem { Title = "Dashboard", ViewId = "dashboard", Icon = "DashboardIcon", Permission = "dashboard", Order = 1 };
            var profileItem = new MenuItem { Title = "My Profile", ViewId = "user_profile", Icon = "UserIcon", Permission = null, Order = 2 };
            var usersItem = new MenuItem { Title = "User Management", ViewId = "users", Icon = "UsersIcon", Permission = "view_users", Order = 3 };
            var rolesItem = new MenuItem { Title = "Roles & Permissions", ViewId = "roles", Icon = "RolesIcon", Permission = "view_roles", Order = 4 };
            var policyItem = new MenuItem { Title = "Policy Editor", ViewId = "policies", Icon = "PolicyIcon", Permission = "view_policies", Order = 5 };
            var chartsItem = new MenuItem { Title = "Charts & Analytics", ViewId = "charts", Icon = "ChartsIcon", Permission = "view_charts", Order = 6 };
            
            // Nested Parents
            var projectsItem = new MenuItem { Title = "Projects", ViewId = "projects", Icon = "ProjectIcon", Permission = "view_projects", Order = 7 };
            var tasksItem = new MenuItem { Title = "Tasks", ViewId = "tasks", Icon = "TaskIcon", Permission = "view_tasks", Order = 8 };

            // Remaining Top-Level
            var items = new List<MenuItem>
            {
                dashboardItem,
                profileItem,
                usersItem,
                rolesItem,
                policyItem,
                chartsItem,
                projectsItem,
                tasksItem,
                new MenuItem { Title = "Reports", ViewId = "reports", Icon = "ReportsIcon", Permission = "view_reports", Order = 9 },
                new MenuItem { Title = "Audit Logs", ViewId = "audit", Icon = "AuditIcon", Permission = "view_audit", Order = 10 },
                new MenuItem { Title = "Notifications", ViewId = "notifications", Icon = "NotificationsIcon", Permission = "view_notifications", Order = 11 },
                new MenuItem { Title = "Settings", ViewId = "settings", Icon = "SettingsIcon", Permission = "view_settings", Order = 12 },
                new MenuItem { Title = "Security", ViewId = "security", Icon = "SecurityIcon", Permission = "view_security", Order = 13 },
                new MenuItem { Title = "Backup & Restore", ViewId = "backup", Icon = "BackupIcon", Permission = "view_backup", Order = 14 },

// new MenuItem { 
//     Title = "Supportxxxx", 
//     ViewId = "support_viewxx", 
//     Icon = "SupportIcon", 
//     Permission = null, 
//     Order = 15 
// }


            };

            // Save Top-Level items first (so they get Database IDs)
            await context.MenuItems.AddRangeAsync(items);
            await context.SaveChangesAsync();

            // --- Level 2: Project Nesting ---
            var myProjects = new MenuItem { Title = "My Projects", ViewId = "my_projects", Permission = "view_my_projects", Order = 1, ParentId = projectsItem.Id };
            await context.MenuItems.AddAsync(myProjects);
            await context.SaveChangesAsync();

            var projectContent = new MenuItem { Title = "Project Content", ViewId = "project_content", Permission = "view_project_content", Order = 1, ParentId = myProjects.Id };
            await context.MenuItems.AddAsync(projectContent);
            await context.SaveChangesAsync();

            var projectTeam = new MenuItem { Title = "Team & Workflow", ViewId = "project_team", Permission = "view_project_team", Order = 1, ParentId = projectContent.Id };
            await context.MenuItems.AddAsync(projectTeam);
            await context.SaveChangesAsync();

            var projectSettings = new MenuItem { Title = "Project Settings", ViewId = "project_settings", Permission = "view_project_settings", Order = 1, ParentId = projectTeam.Id };
            await context.MenuItems.AddAsync(projectSettings);
            await context.SaveChangesAsync();

            // --- Level 2: Task Nesting ---
            var taskList = new MenuItem { Title = "List", ViewId = "task_list", Permission = "view_task_list", Order = 1, ParentId = tasksItem.Id };
            var taskKanban = new MenuItem { Title = "Kanban", ViewId = "task_kanban", Permission = "view_task_kanban", Order = 2, ParentId = tasksItem.Id };
            await context.MenuItems.AddRangeAsync(taskList, taskKanban);
            
            await context.SaveChangesAsync();

            Console.WriteLine("Menu Seeding Successful - All Duplicates Removed.");
        }
    }
}