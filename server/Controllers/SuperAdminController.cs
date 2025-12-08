using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using UserManagement.Api.Auth;
using UserManagement.Api.Models;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.SuperAdmin)]
public class SuperAdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public SuperAdminController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<ApplicationUserDto>>> GetAllUsers()
    {
        var users = _userManager.Users.ToList();
        var list = new List<ApplicationUserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = await _userManager.GetClaimsAsync(user);
            list.Add(ApplicationUserDto.From(user, roles, claims));
        }
        return Ok(list);
    }
}

