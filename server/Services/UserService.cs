using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserManagement.Api.Auth;
using UserManagement.Api.Models;

namespace UserManagement.Api.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<IEnumerable<ApplicationUserDto>> GetUsersAsync(string requesterId, bool isSuperAdmin, bool isAdmin)
    {
        var query = _userManager.Users.AsQueryable();
        if (!isSuperAdmin && isAdmin)
        {
            query = query.Where(u => u.ManagedByAdminId == requesterId);
        }
        else if (!isSuperAdmin && !isAdmin)
        {
            query = query.Where(u => u.Id == requesterId);
        }

        var users = await query.ToListAsync();
        var list = new List<ApplicationUserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = await _userManager.GetClaimsAsync(user);
            list.Add(ApplicationUserDto.From(user, roles, claims));
        }
        return list;
    }

    public async Task<ApplicationUserDto?> GetUserAsync(string requesterId, string id, bool isSuperAdmin, bool isAdmin)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return null;
        if (!isSuperAdmin && isAdmin && user.ManagedByAdminId != requesterId) return null;
        if (!isSuperAdmin && !isAdmin && user.Id != requesterId) return null;
        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);
        return ApplicationUserDto.From(user, roles, claims);
    }

    public async Task<ApplicationUserDto> CreateUserAsync(string requesterId, CreateUserDto dto, bool isSuperAdmin, bool isAdmin)
    {
        if (!isSuperAdmin && !isAdmin)
        {
            throw new UnauthorizedAccessException("Not allowed");
        }

        var managedBy = isSuperAdmin ? dto.ManagedByAdminId : requesterId;
        var role = isSuperAdmin ? dto.Role : Roles.User;

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = dto.DisplayName,
            ManagedByAdminId = managedBy
        };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(",", result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, role);
        if (role == Roles.Admin)
        {
            await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(CustomClaims.CanEditUsers, "true"));
        }
        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);
        return ApplicationUserDto.From(user, roles, claims);
    }

    public async Task<ApplicationUserDto> UpdateUserAsync(string requesterId, string id, UpdateProfileDto dto, bool isSuperAdmin, bool isAdmin)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id) ?? throw new KeyNotFoundException("User not found");
        if (!isSuperAdmin && isAdmin && user.ManagedByAdminId != requesterId) throw new UnauthorizedAccessException();
        if (!isSuperAdmin && !isAdmin && user.Id != requesterId) throw new UnauthorizedAccessException();

        if (!string.IsNullOrWhiteSpace(dto.DisplayName)) user.DisplayName = dto.DisplayName;
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            user.Email = dto.Email;
            user.UserName = dto.Email;
        }
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);
            if (!passResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join(",", passResult.Errors.Select(e => e.Description)));
            }
        }
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join(",", updateResult.Errors.Select(e => e.Description)));
        }
        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);
        return ApplicationUserDto.From(user, roles, claims);
    }

    public async Task DeleteUserAsync(string requesterId, string id, bool isSuperAdmin, bool isAdmin)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id) ?? throw new KeyNotFoundException("User not found");
        if (!isSuperAdmin && isAdmin && user.ManagedByAdminId != requesterId) throw new UnauthorizedAccessException();
        if (!isSuperAdmin && !isAdmin && user.Id != requesterId) throw new UnauthorizedAccessException();

        user.IsDeleted = true;
        await _userManager.UpdateAsync(user);
    }
}

