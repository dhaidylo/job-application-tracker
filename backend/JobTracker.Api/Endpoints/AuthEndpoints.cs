using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.Models.DTOs.Auth;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Endpoints
{
    public static class AuthEndpoints
    {
        /// <summary>
        /// Maps the authentication endpoints for user registration and login.
        /// </summary>
        /// <param name="app">The web application.</param>
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth").WithTags("Authentication");

            group.MapPost("/register", Register);
            group.MapPost("/login", Login);
        }

        /// <summary>
        /// Registers a new user in the system.
        /// </summary>
        /// <param name="request">The registration request.</param>
        /// <param name="db">The database context.</param>
        /// <param name="tokenService">The token service.</param>
        /// <returns>The result of the registration operation.</returns>
        private static async Task<IResult> Register(RegisterRequest request, AppDbContext db, TokenService tokenService)
        {
            // Check if email is already registered.
            var exists = await db.Users.AnyAsync(u => u.Email == request.Email);
            if (exists)
                return Results.Conflict(new { message = "Email is already in use." });

            var hasher = new PasswordHasher<User>();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email.ToLowerInvariant().Trim(),
                FullName = request.FullName,
                PasswordHash = string.Empty // set below after hashing
            };

            user.PasswordHash = hasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var token = tokenService.GenerateToken(user);

            return Results.Created($"/api/users/{user.Id}", new AuthResponse(token, user.Email, user.FullName));
        }

        /// <summary>
        /// Authenticates a user and generates a JWT token if the credentials are valid.
        /// </summary>
        /// <param name="request">The login request.</param>
        /// <param name="db">The database context.</param>
        /// <param name="tokenService">The token service.</param>
        /// <returns>The result of the login operation.</returns>
        private static async Task<IResult> Login(LoginRequest request, AppDbContext db, TokenService tokenService)
        {
            // Look up the user by email (case-insensitive).
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim());

            if (user is null)
                return Results.Unauthorized();

            // Verify hashed password.
            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
                return Results.Unauthorized();

            var token = tokenService.GenerateToken(user);

            return Results.Ok(new AuthResponse(token, user.Email, user.FullName));
        }
}
}
