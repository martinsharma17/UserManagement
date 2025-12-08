using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using UserManagement.Api.Auth;
using UserManagement.Api.Models;

namespace UserManagement.Api.Data;

public static class SeedData
{
    public static async Task EnsureSeedAsync(IServiceProvider services, ILogger logger, IWebHostEnvironment env)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var roleName in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
                logger.LogInformation("Created role {Role}", roleName);
            }
        }

        var superAdminEmail = "superadmin@gmail.com";
        var superAdminPassword = "password";
        var superAdmin = await userManager.FindByEmailAsync(superAdminEmail);
        if (superAdmin == null)
        {
            superAdmin = new ApplicationUser
            {
                Email = superAdminEmail,
                UserName = superAdminEmail,
                DisplayName = "Super Admin"
            };
            var result = await userManager.CreateAsync(superAdmin, superAdminPassword);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create SuperAdmin: {string.Join(",", result.Errors.Select(e => e.Description))}");
            }
            await userManager.AddToRoleAsync(superAdmin, Roles.SuperAdmin);
            await userManager.AddClaimAsync(superAdmin, new System.Security.Claims.Claim(CustomClaims.IsSuperAdmin, "true"));
            logger.LogInformation("Seeded SuperAdmin account {Email}", superAdminEmail);
        }

        // Example admin and users
        var adminEmail = "admin@example.com";
        var admin = await EnsureUserAsync(userManager, adminEmail, "Admin User", Roles.Admin, "Password1!");

        await EnsureUserAsync(userManager, "user1@example.com", "Owned User 1", Roles.User, "Password1!", admin.Id);
        await EnsureUserAsync(userManager, "user2@example.com", "Owned User 2", Roles.User, "Password1!", admin.Id);
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string displayName,
        string role,
        string password,
        string? managedByAdminId = null)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing != null) return existing;

        var user = new ApplicationUser
        {
            Email = email,
            UserName = email,
            DisplayName = displayName,
            ManagedByAdminId = managedByAdminId
        };
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to seed user {email}: {string.Join(",", result.Errors.Select(e => e.Description))}");
        }
        await userManager.AddToRoleAsync(user, role);
        return user;
    }
}

