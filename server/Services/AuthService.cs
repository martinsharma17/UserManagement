using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserManagement.Api.Auth;
using UserManagement.Api.Data;
using UserManagement.Api.Models;
using System.Security.Claims;

namespace UserManagement.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext db,
        IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<TokenResponse> RegisterAsync(RegisterDto dto, string role)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null) throw new InvalidOperationException("User already exists");

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = dto.DisplayName
        };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(",", result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, string.IsNullOrWhiteSpace(role) ? Roles.User : role);
        await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(CustomClaims.CanEditUsers, "true"));
        return await IssueTokensAsync(user);
    }

    public async Task<TokenResponse> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || user.IsDeleted)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var passwordValid = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!passwordValid.Succeeded)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        return await IssueTokensAsync(user);
    }

    public async Task<TokenResponse> RefreshAsync(string refreshToken, string accessToken)
    {
        var principal = _jwtTokenService.GetPrincipalFromExpiredToken(accessToken);
        var userId = principal?.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userId == null) throw new UnauthorizedAccessException("Invalid token");

        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new UnauthorizedAccessException("Invalid token");

        var storedToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken && !rt.Revoked);
        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token expired");
        }

        storedToken.Revoked = true;
        var newTokens = await IssueTokensAsync(user);
        storedToken.ReplacedByToken = newTokens.RefreshToken;
        await _db.SaveChangesAsync();
        return newTokens;
    }

    public async Task LogoutAsync(string userId, string refreshToken)
    {
        var user = await _userManager.Users.Include(u => u.RefreshTokens).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;
        foreach (var token in user.RefreshTokens.Where(t => t.Token == refreshToken))
        {
            token.Revoked = true;
        }
        await _db.SaveChangesAsync();
    }

    public async Task<ApplicationUserDto?> GetCurrentAsync(string userId)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return null;
        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);
        return ApplicationUserDto.From(user, roles, claims);
    }

    private async Task<TokenResponse> IssueTokensAsync(ApplicationUser user)
    {
        var token = await _jwtTokenService.BuildTokensAsync(user);
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = token.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = user.Id
        });
        await _db.SaveChangesAsync();
        return token;
    }
}

