using UserManagement.Api.Models;

namespace UserManagement.Api.Services;

public interface IAuthService
{
    Task<TokenResponse> RegisterAsync(RegisterDto dto, string role);
    Task<TokenResponse> LoginAsync(LoginDto dto);
    Task<TokenResponse> RefreshAsync(string refreshToken, string accessToken);
    Task LogoutAsync(string userId, string refreshToken);
    Task<ApplicationUserDto?> GetCurrentAsync(string userId);
}

