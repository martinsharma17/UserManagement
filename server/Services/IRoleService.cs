using System.Security.Claims;

namespace UserManagement.Api.Services;

public interface IRoleService
{
    Task AssignRoleAsync(string userId, string role);
    Task<IEnumerable<Claim>> SetPoliciesAsync(string userId, IEnumerable<Claim> claims);
}

