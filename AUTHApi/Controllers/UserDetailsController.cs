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
                return Ok();
            }

            return Ok(details);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<ActionResult<UserDetails>> Post([FromBody] UserDetails details)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var existingDetails = await _context.UserDetails
                    .Include(d => d.UserImages)
                    .FirstOrDefaultAsync(d => d.ApplicationUserId == userId);

                if (existingDetails == null)
                {
                    details.ApplicationUserId = userId;
                    details.CreatedAt = DateTime.UtcNow;
                    details.UpdatedAt = DateTime.UtcNow;
                    
                    // Ensure nested images have correct IDs
                    if (details.UserImages != null)
                    {
                        foreach (var img in details.UserImages)
                        {
                            img.UploadedAt = DateTime.UtcNow;
                        }
                    }

                    _context.UserDetails.Add(details);
                    await _context.SaveChangesAsync();
                    return Ok(details);
                }
                else
                {
                    // Update scalar properties except IDs
                    _context.Entry(existingDetails).CurrentValues.SetValues(details);
                    
                    // Protect critical fields
                    existingDetails.ApplicationUserId = userId;
                    existingDetails.UpdatedAt = DateTime.UtcNow;

                    // Handle nested images: Wipe and replace
                    if (details.UserImages != null)
                    {
                        if (existingDetails.UserImages != null && existingDetails.UserImages.Any())
                        {
                            _context.UserImages.RemoveRange(existingDetails.UserImages);
                        }

                        foreach (var img in details.UserImages)
                        {
                            img.UserDetailsId = existingDetails.UserId;
                            img.UploadedAt = DateTime.UtcNow;
                            _context.UserImages.Add(img);
                        }
                    }

                    await _context.SaveChangesAsync();
                    return Ok(existingDetails);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error saving user details.", error = ex.Message, innerError = ex.InnerException?.Message });
            }
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
