using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AUTHApi.Core.Security;

namespace AUTHApi.Data
{
    /// <summary>
    /// Seeds default permissions for each role.
    /// This ensures that when the application starts, roles have sensible default permissions.
    /// </summary>
    public static class PermissionSeeder
    {
        public static async Task SeedDefaultPermissionsAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Define default permissions for each role
            var rolePermissions = new Dictionary<string, List<string>>
            {
                // SuperAdmin gets everything (handled in PermissionAuthorizationHandler)
                // But we can still seed them for completeness
                ["SuperAdmin"] = Permissions.GetAllPermissions(),

                // Admin: Full access to Users, Tasks, Projects
                ["Admin"] = new List<string>
                {
                    Permissions.Users.View,
                    Permissions.Users.Create,
                    Permissions.Users.Edit,
                    Permissions.Users.Delete,
                    
                    Permissions.Tasks.View,
                    Permissions.Tasks.ViewList,
                    Permissions.Tasks.CreateList,
                    Permissions.Tasks.EditList,
                    Permissions.Tasks.DeleteList,
                    Permissions.Tasks.ViewKanban,
                    Permissions.Tasks.CreateKanban,
                    Permissions.Tasks.EditKanban,
                    Permissions.Tasks.DeleteKanban,
                    
                    Permissions.Projects.View,
                    Permissions.Projects.Create,
                    Permissions.Projects.Edit,
                    Permissions.Projects.Delete,
                    
                    Permissions.Analytics.View
                },

                // Manager: Can view and manage tasks, view users
                ["Manager"] = new List<string>
                {
                    Permissions.Users.View,
                    
                    Permissions.Tasks.View,
                    Permissions.Tasks.ViewList,
                    Permissions.Tasks.CreateList,
                    Permissions.Tasks.EditList,
                    Permissions.Tasks.DeleteList,
                    Permissions.Tasks.ViewKanban,
                    Permissions.Tasks.CreateKanban,
                    Permissions.Tasks.EditKanban,
                    Permissions.Tasks.DeleteKanban,
                    
                    Permissions.Projects.View,
                    Permissions.Analytics.View
                },

                // User: Basic read access to tasks
                ["User"] = new List<string>
                {
                    Permissions.Tasks.View,
                    Permissions.Tasks.ViewList,
                    Permissions.Tasks.ViewKanban,
                }
            };

            foreach (var rolePermission in rolePermissions)
            {
                var roleName = rolePermission.Key;
                var permissions = rolePermission.Value;

                var role = await roleManager.FindByNameAsync(roleName);
                if (role == null)
                {
                    Console.WriteLine($"Role {roleName} not found. Skipping permission seeding.");
                    continue;
                }

                // Get existing permission claims
                var existingClaims = await roleManager.GetClaimsAsync(role);
                var existingPermissions = existingClaims
                    .Where(c => c.Type == "Permission")
                    .Select(c => c.Value)
                    .ToHashSet();

                // IMPORTANT: Only seed permissions if the role has ZERO permissions
                // This prevents overwriting manually configured permissions from Policy Editor
                if (existingPermissions.Count == 0)
                {
                    foreach (var permission in permissions)
                    {
                        await roleManager.AddClaimAsync(role, new Claim("Permission", permission));
                        Console.WriteLine($"✓ Added default permission '{permission}' to role '{roleName}' (first-time setup)");
                    }
                }
                else
                {
                    Console.WriteLine($"⊘ Skipping permission seeding for '{roleName}' - role already has {existingPermissions.Count} configured permissions");
                }
            }

            Console.WriteLine("PERMISSION SEEDING COMPLETE ✔");
        }
    }
}
