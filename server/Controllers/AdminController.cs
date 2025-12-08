using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using UserManagement.Api.Auth;
using UserManagement.Api.Models;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.SuperAdmin)]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ApplicationUserDto>>> GetAdmins()
    {
        var admins = await _userManager.GetUsersInRoleAsync(Roles.Admin);
        var list = new List<ApplicationUserDto>();
        foreach (var admin in admins)
        {
            var roles = await _userManager.GetRolesAsync(admin);
            var claims = await _userManager.GetClaimsAsync(admin);
            list.Add(ApplicationUserDto.From(admin, roles, claims));
        }
        return Ok(list);
    }
}

