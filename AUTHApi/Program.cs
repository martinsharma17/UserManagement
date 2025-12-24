using Microsoft.EntityFrameworkCore;
using AUTHApi.Data;
using AUTHApi.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using AUTHApi.Core.Security;



/// <summary>
/// Entry point for the User Management API.
/// Configures services, authentication, authorization, and the HTTP request pipeline.
/// </summary>
internal class Program
{
    private static async Task Main(string[] args)
    {
        // ==========================================
        // 1. INITIALIZATION
        // ==========================================
        // Create the WebApplication builder to configure services and the app pipeline.
        var builder = WebApplication.CreateBuilder(args);

        // ==========================================
        // 2. SERVICE REGISTRATION (Dependency Injection)
        // ==========================================
        
        // Add controllers to the service container so API endpoints work.
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            });
        // Add Swagger for API documentation and testing UI.
        builder.Services.AddSwaggerGen();

        // --- CORS Configuration ---
        // Defines who can access this API. Here we allow the frontend URL.
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigin",
                builder =>
                {
                    // Allow requests from React Frontend running on localhost:5173
                    builder.WithOrigins("http://localhost:5173","http://localhost:3000")
                    .AllowAnyHeader() // Allow any HTTP headers (e.g., Authorization, Content-Type)
                    .AllowAnyMethod(); // Allow any HTTP methods (GET, POST, PUT, DELETE, etc.)
                });
        });

        // --- IDENTITY (USER MANAGEMENT) Configuration ---
        // Configures ASP.NET Core Identity for user storage and management.
        builder.Services.AddIdentity<ApplicationUser, IdentityRole>(option =>
        {
            // Password settings (relaxed for development, tighten for production!)
            option.Password.RequireDigit = false;
            option.Password.RequireLowercase = false;
            option.Password.RequireUppercase = false;
            option.Password.RequireNonAlphanumeric = false;
            option.Password.RequiredLength = 4; // Minimum password length
        })
        .AddEntityFrameworkStores<ApplicationDbContext>() // Connect Identity to our EF Core DB Context
        .AddDefaultTokenProviders(); // Generates tokens for email confirmation, password reset, etc.

        // --- DATABASE CONTEXT ---
        // Connects to SQL Server using the connection string from appsettings.json.
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        });

        // ==========================================
        // 3. AUTHENTICATION & AUTHORIZATION CONFIG
        // ==========================================

        // Configure Authentication Services
        builder.Services.AddAuthentication(options =>
        {
            // Set JWT (JSON Web Token) as the default scheme for authentication.
            // This means the API expects a Bearer token in the Authorization header.
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        // --- JWT Bearer Configuration ---
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                // Validate that the token was signed by this server (Issuer)
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],

                // Validate that the token is intended for this API (Audience)
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],

                // Ensure the token hasn't expired
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                // The secret key used to sign the token (MUST match the one used during generation)
                IssuerSigningKey = new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
                ),

                // Map standard claims to .NET types
                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name
            };
        })
        // --- External Auth (Google) Configuration ---
        .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme) // Cookies needed for Google sign-in flow
        .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
        {
            // Get Google credentials from configuration (appsettings.json or User Secrets)
            options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
            options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
            options.CallbackPath = "/signin-google"; // Endpoint where Google redirects back
            options.SaveTokens = true;
            
            // Request additional scopes for profile picture
            options.Scope.Add("profile");
            options.Scope.Add("email");
            
            // Map Google claims to our internal user claims
            options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
            options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
            options.ClaimActions.MapJsonKey("picture", "picture");
        });

        // --- Authorization Policies ---
        // Define policies based on Roles. These are used in [Authorize(Policy="...")] attributes.
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy("UserOnly", policy =>
                policy.RequireRole("User"));

            options.AddPolicy("AdminOrUser", policy =>
                policy.RequireRole("Admin", "User"));
        });

        // --- Custom Permission-Based Authorization ---
        // Register our dynamic policy provider and handler
        builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        // --- Email Service Registration ---
        // Register the email service for password reset and other email functionality
        builder.Services.AddScoped<AUTHApi.Services.IEmailService, AUTHApi.Services.EmailService>();



        var app = builder.Build();

        // ==========================================
        // 4. DATA SEEDING
        // ==========================================
        // create a scope to get services (since app has started but request scope doesn't exist yet)
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;

            try
            {
                // Seed Roles (Admin, User, Manager) and the SuperAdmin user if they don't exist.
                await RoleSeeder.SeedRolesAsync(services);
                await RoleSeeder.SeedSuperAdminAsync(services);
                
                // Seed Menu Items
                await MenuSeeder.SeedMenuItemsAsync(scope.ServiceProvider.GetRequiredService<ApplicationDbContext>());

                // Seed default permissions for each role
                await PermissionSeeder.SeedDefaultPermissionsAsync(services);
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "Error while seeding roles or superadmin.");
            }
        }

        // ==========================================
        // 5. MIDDLEWARE PIPELINE
        // ==========================================
        
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            // Enable Swagger in Development mode
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "AUTHApi");
            });
        }
        app.UseCors("AllowSpecificOrigin");
        app.UseHttpsRedirection(); // Redirect HTTP to HTTPS
        // Enable CORS (Must be before Auth)

        // Enable Authentication (Who are you?)
        app.UseAuthentication();
        // Enable Authorization (Are you allowed here?)
        app.UseAuthorization();

        // Map controller endpoints
        app.MapControllers();

        // Run the application
        await app.RunAsync();
    }
}

