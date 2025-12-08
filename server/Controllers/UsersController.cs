using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserManagement.Api.Auth;
using UserManagement.Api.Models;
using UserManagement.Api.Services;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;

    public UsersController(IUserService userService, IRoleService roleService)
    {
        _userService = userService;
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ApplicationUserDto>>> GetUsers()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isSuper = User.IsInRole(Roles.SuperAdmin);
        var isAdmin = User.IsInRole(Roles.Admin);
        var users = await _userService.GetUsersAsync(userId, isSuper, isAdmin);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApplicationUserDto>> GetById(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isSuper = User.IsInRole(Roles.SuperAdmin);
        var isAdmin = User.IsInRole(Roles.Admin);
        var user = await _userService.GetUserAsync(userId, id, isSuper, isAdmin);
        if (user == null) return Forbid();
        return Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<ApplicationUserDto>> Create(CreateUserDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isSuper = User.IsInRole(Roles.SuperAdmin);
        var isAdmin = User.IsInRole(Roles.Admin);
        var created = await _userService.CreateUserAsync(userId, dto, isSuper, isAdmin);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApplicationUserDto>> Update(string id, UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isSuper = User.IsInRole(Roles.SuperAdmin);
        var isAdmin = User.IsInRole(Roles.Admin);
        var updated = await _userService.UpdateUserAsync(userId, id, dto, isSuper, isAdmin);
        return Ok(updated);
    }

    [HttpPatch("{id}/role")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] RoleDto dto)
    {
        await _roleService.AssignRoleAsync(id, dto.Role);
        return NoContent();
    }

    [HttpPatch("{id}/policy")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<ActionResult<IEnumerable<Claim>>> SetPolicies(string id, [FromBody] IEnumerable<PolicyDto> policies)
    {
        var claims = policies.Select(p => new Claim(p.Type, p.Value));
        var updated = await _roleService.SetPoliciesAsync(id, claims);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isSuper = User.IsInRole(Roles.SuperAdmin);
        var isAdmin = User.IsInRole(Roles.Admin);
        await _userService.DeleteUserAsync(userId, id, isSuper, isAdmin);
        return NoContent();
    }
}

