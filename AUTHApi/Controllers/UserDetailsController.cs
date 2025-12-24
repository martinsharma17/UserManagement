using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AUTHApi.Data;
using AUTHApi.Entities;
using System.Security.Claims;

namespace AUTHApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<UserDetails>> Get()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var details = await _context.UserDetails
                .Include(d => d.UserImages)
                .FirstOrDefaultAsync(d => d.ApplicationUserId == userId);

            if (details == null)
            {
                return NotFound("User details not found.");
            }

            return details;
        }

        [HttpPost]
        public async Task<ActionResult<UserDetails>> Post([FromBody] UserDetails details)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var existingDetails = await _context.UserDetails
                .FirstOrDefaultAsync(d => d.ApplicationUserId == userId);

            if (existingDetails == null)
            {
                details.ApplicationUserId = userId;
                details.CreatedAt = DateTime.UtcNow;
                details.UpdatedAt = DateTime.UtcNow;
                _context.UserDetails.Add(details);
            }
            else
            {
                // Update existing details manually to avoid replacing the whole object if needed
                // For simplicity, we can use reflection or a library like AutoMapper, but here we do it explicitly
                _context.Entry(existingDetails).CurrentValues.SetValues(details);
                existingDetails.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(existingDetails ?? details);
        }

        [HttpPost("images")]
        public async Task<ActionResult<UserImage>> PostImage([FromBody] UserImage image)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var details = await _context.UserDetails
                .FirstOrDefaultAsync(d => d.ApplicationUserId == userId);

            if (details == null) return BadRequest("User details must be created first.");

            image.UserDetailsId = details.UserId;
            image.UploadedAt = DateTime.UtcNow;

            _context.UserImages.Add(image);
            await _context.SaveChangesAsync();

            return Ok(image);
        }
    }
}
