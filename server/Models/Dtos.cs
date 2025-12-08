using System.Security.Claims;

namespace UserManagement.Api.Models;

public record RegisterDto(string Email, string Password, string? DisplayName);
public record LoginDto(string Email, string Password);
public record UpdateProfileDto(string? DisplayName, string? Email, string? Password);
public record CreateUserDto(string Email, string Password, string? DisplayName, string? ManagedByAdminId, string Role);
public record RoleDto(string Role);
public record PolicyDto(string Type, string Value);

public class ApplicationUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public IEnumerable<string> Roles { get; set; } = Array.Empty<string>();
    public IDictionary<string, string> Claims { get; set; } = new Dictionary<string, string>();
    public string? ManagedByAdminId { get; set; }

    public static ApplicationUserDto From(ApplicationUser user, IEnumerable<string> roles, IEnumerable<Claim> claims)
    {
        return new ApplicationUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            Roles = roles.ToArray(),
            ManagedByAdminId = user.ManagedByAdminId,
            Claims = claims.ToDictionary(c => c.Type, c => c.Value)
        };
    }
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public ApplicationUserDto? User { get; set; }
}

