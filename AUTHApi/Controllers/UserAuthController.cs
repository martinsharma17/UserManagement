using AUTHApi.Data;
using AUTHApi.DTOs;
using AUTHApi.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AUTHApi.Controllers
{

    /// <summary>
    /// Controller for user authentication management (Register, Login, Logout).
    /// This controller exposes public endpoints that do not require valid tokens (except Logout).
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthController : ControllerBase
    {
        // ==========================================
        // DEPENDENCY INJECTION
        // ==========================================
        // These services are provided by ASP.NET Core Identity and Configuration system.
        
        private readonly UserManager<ApplicationUser> _userManager;  // API for managing users (create, delete, find, etc.)
        private readonly SignInManager<ApplicationUser> _signinManager;  // API for handling sign-in/sign-out logic
        private readonly RoleManager<IdentityRole> _roleManager;  // API for managing roles
        
        // JWT Configuration values read from appsettings.json
        private readonly string? _jwtKey;  // Secret key for signing tokens
        private readonly string? _JwtIssuer;  // Issuer of the token (this server)
        private readonly string? _JwtAudience;  // Audience of the token (who can use it)
        private readonly int _JwtExpiry;  // Expiration time in minutes

        public UserAuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signinManager = signInManager;
            _roleManager = roleManager;
            
            // Read JWT settings from configuration
            _jwtKey = configuration["Jwt:Key"];
            _JwtIssuer = configuration["Jwt:Issuer"];
            _JwtAudience = configuration["Jwt:Audience"];
            _JwtExpiry = int.Parse(configuration["Jwt:ExpireMinutes"] ?? "60");
        }


        /// <summary>
        /// Registers a new user in the system.
        /// Endpoint: POST /api/UserAuth/Register
        /// </summary>
        /// <param name="registerModel">JSON object containing Name, Email, Password</param>
        /// <returns>Success message or error list</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel registerModel)
        {
            // 1. Input Validation
            if (registerModel == null
                 || string.IsNullOrEmpty(registerModel.Name)
                 || string.IsNullOrEmpty(registerModel.Email)
                 || string.IsNullOrEmpty(registerModel.Password))
            {
                return BadRequest(new { success = false, message = "Invalid client request. Missing required fields." });
            }

            // 2. Check for existing user
            var existingUser = await _userManager.FindByEmailAsync(registerModel.Email);
            if (existingUser != null)
            {
                return BadRequest(new { success = false, message = "User with this email already exists." });
            }

            // 3. Create ApplicationUser instance
            var user = new ApplicationUser
            {
                UserName = registerModel.Email, // Identity uses UserName for login usually, we use Email
                Email = registerModel.Email,
                Name = registerModel.Name
            };

            // 4. Save user to database using UserManager
            // This hashes the password automatically before saving
            var result = await _userManager.CreateAsync(user, registerModel.Password);
            
            if (result.Succeeded)
            {
                // 5. Default Role Assignment
                // IMPORTANT: Every new user is automatically assigned the "User" role.
                // This grants them basic access permission (see policies in Program.cs).
                await _userManager.AddToRoleAsync(user, "User");
                
                return Ok(new { success = true, message = "User registered successfully" });
            }
            else
            {
                // Return detailed errors (e.g., password too weak)
                return BadRequest(new { success = false, message = "User registration failed", errors = result.Errors });
            }
        }

        /// <summary>
        /// Authenticates a user and returns a JWT Token.
        /// Endpoint: POST /api/UserAuth/Login
        /// </summary>
        /// <param name="loginModel">JSON object containing Email and Password</param>
        /// <returns>JWT Token and User Roles</returns>
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            // 1. Find user by email
            var user = await _userManager.FindByEmailAsync(loginModel.Email);
            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Invalid email or password" });
            }

            // 2. Verify password
            // false parameter indicates we don't want to lock out the account after failed attempts here
            var result = await _signinManager.CheckPasswordSignInAsync(user, loginModel.Password, false);
            
            if (!result.Succeeded)
            {
                return Unauthorized(new { success = false, message = "Invalid email or password" });
            }

            // 3. Generate JWT Token
            // This token contains all the permissions (claims & roles) the user has.
            var token = await GenerateJWTToken(user);
            
            // 4. Get Roles for frontend (so frontend knows what UI to show)
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new { success = true, token = token, roles = roles });
        }

        /// <summary>
        /// Signs out the current user (Valid for Cookie schemes, less relevant for purely stateless JWT).
        /// Endpoint: POST /api/UserAuth/Logout
        /// </summary>
        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _signinManager.SignOutAsync();
            return Ok(new { success = true, message = "User logged out successfully" });
        }

        /// <summary>
        /// Helper method to generate a JWT (JSON Web Token).
        /// The token is signed with a secret key and contains user Claims (data).
        /// </summary>
        /// <param name="user">The user to generate the token for</param>
        /// <returns>A signed JWT token string</returns>
        [NonAction] // Tells Swagger this is NOT an API endpoint
        public async Task<string> GenerateJWTToken(ApplicationUser user)
        {
            // --- Step 1: Gather Claims (User Data) ---
            
            // Get user roles (e.g., "Admin", "User")
            // These are critical for [Authorize(Roles = "...")] checks
            var roles = await _userManager.GetRolesAsync(user);

            // Get custom claims stored in database
            var userClaims = await _userManager.GetClaimsAsync(user);

            // Create standard claims list
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),            // UserID
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""), // Email
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique Token ID
                new Claim(ClaimTypes.Name, user.Name ?? ""),                // User Name
                new Claim(ClaimTypes.NameIdentifier, user.Id)               // Standard Name ID
            };

            // Add Roles to claims list
            // This is what allows the backend to know "This user is an Admin" just by looking at the token.
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add any other custom claims
            foreach (var claim in userClaims)
            {
                claims.Add(claim);
            }

            // --- Step 2: Sign the Token ---
            
            // Create the security key from our secret string
            var key = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(
                    _jwtKey ?? throw new InvalidOperationException("JWT Key is not configured")));
            
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // --- Step 3: Create the Token Object ---
            var token = new JwtSecurityToken(
                issuer: _JwtIssuer,
                audience: _JwtAudience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(_JwtExpiry), // Token matches the set expiry time
                signingCredentials: creds
            );

            // Return the serialised string version of the token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

}
