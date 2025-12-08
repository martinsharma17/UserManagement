using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using UserManagement.Api.Models;

namespace UserManagement.Api.Services;

public class RoleService : IRoleService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public RoleService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task AssignRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, role);
    }

    public async Task<IEnumerable<Claim>> SetPoliciesAsync(string userId, IEnumerable<Claim> claims)
    {
        var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        var existing = await _userManager.GetClaimsAsync(user);
        foreach (var claim in existing)
        {
            await _userManager.RemoveClaimAsync(user, claim);
        }
        foreach (var claim in claims)
        {
            await _userManager.AddClaimAsync(user, claim);
        }
        return await _userManager.GetClaimsAsync(user);
    }
}

