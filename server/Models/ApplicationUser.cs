using Microsoft.AspNetCore.Identity;

namespace UserManagement.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? ManagedByAdminId { get; set; }
    public bool IsDeleted { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

