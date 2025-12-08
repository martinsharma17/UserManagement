using UserManagement.Api.Models;

namespace UserManagement.Api.Services;

public interface IUserService
{
    Task<IEnumerable<ApplicationUserDto>> GetUsersAsync(string requesterId, bool isSuperAdmin, bool isAdmin);
    Task<ApplicationUserDto?> GetUserAsync(string requesterId, string id, bool isSuperAdmin, bool isAdmin);
    Task<ApplicationUserDto> CreateUserAsync(string requesterId, CreateUserDto dto, bool isSuperAdmin, bool isAdmin);
    Task<ApplicationUserDto> UpdateUserAsync(string requesterId, string id, UpdateProfileDto dto, bool isSuperAdmin, bool isAdmin);
    Task DeleteUserAsync(string requesterId, string id, bool isSuperAdmin, bool isAdmin);
}

