using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.Models.DTOs.Auth;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace JobTracker.Api.Endpoints
{
    /// <summary>
    /// Provides endpoints for user authentication.
    /// </summary>
    public static class AuthEndpoints
    {
        /// <summary>
        /// Maps the authentication endpoints for user registration and login.
        /// </summary>
        /// <param name="app">The web application.</param>
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth")
                .WithTags("Authentication");

            group.MapPost("/register", Register)
                .WithName("Register")
                .Produces<AuthResponse>(StatusCodes.Status202Accepted)
                .Produces(StatusCodes.Status409Conflict);

            group.MapPost("/login", Login)
                .WithName("Login")
                .Produces<AuthResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status403Forbidden);

            group.MapPost("/confirm-email", ConfirmEmail)
                .WithName("ConfirmEmail")
                .Produces(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status400BadRequest);

            group.MapPost("/resend-confirmation", ResendConfirmation)
                .WithName("ResendConfirmation")
                .Produces(StatusCodes.Status200OK);
        }

        /// <summary>
        /// Registers a new user in the system.
        /// </summary>
        /// <param name="request">The registration request.</param>
        /// <param name="db">The database context.</param>
        /// <param name="emailSender">The email sender service.</param>
        /// <param name="config">The configuration.</param>
        /// <returns>The result of the registration operation.</returns>
        private static async Task<IResult> Register(RegisterRequest request, AppDbContext db, IEmailSender emailSender, IConfiguration config)
        {
            // Normalize the email to lower case and trim whitespace.
            var email = request.Email.ToLowerInvariant().Trim();

            // Check if email is already registered.
            var exists = await db.Users.AnyAsync(u => u.Email == email);
            if (exists)
                return Results.Conflict(new { message = "Email is already in use." });

            var hasher = new PasswordHasher<User>();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                FullName = request.FullName,
                PasswordHash = string.Empty, // set below after hashing
                EmailConfirmed = false
            };

            user.PasswordHash = hasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            await SendConfirmationEmail(user, emailSender, config, db);

            return Results.Accepted(value: new { message = "Check your inbox to confirm your email." });
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

            if (!user.EmailConfirmed)
                return Results.Json(new { code = "EmailNotConfirmed" }, statusCode: StatusCodes.Status403Forbidden);

            var token = tokenService.GenerateToken(user);

            return Results.Ok(new AuthResponse(token, user.Email, user.FullName));
        }

        /// <summary>
        /// Confirms a user's email address using a token sent to their email.
        /// </summary>
        /// <param name="request">The email confirmation request.</param>
        /// <param name="db">The database context.</param>
        /// <returns>The result of the email confirmation operation.</returns>
        private static async Task<IResult> ConfirmEmail(ConfirmEmailRequest request, AppDbContext db)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim());

            // Same vague error for every failure so nothing leaks about which accounts exist
            if (user is null)
                return Results.BadRequest(new { message = "Invalid or expired link." });

            if (user.EmailConfirmed)
                return Results.Ok();

            if (user.EmailConfirmationTokenHash != HashToken(request.Token) ||
                user.EmailConfirmationTokenExpiresAt < DateTime.UtcNow)
                return Results.BadRequest(new { message = "Invalid or expired link." });

            user.EmailConfirmed = true;
            user.EmailConfirmationTokenHash = null;
            user.EmailConfirmationTokenExpiresAt = null;
            await db.SaveChangesAsync();

            return Results.Ok();
        }

        /// <summary>
        /// Resends the email confirmation link to the user if their email is not yet confirmed.
        /// </summary>
        /// <param name="request">The resend confirmation request.</param>
        /// <param name="db">The database context.</param>
        /// <param name="emailSender">The email sender service.</param>
        /// <param name="config">The configuration.</param>
        /// <returns>The result of the resend confirmation operation.</returns>
        private static async Task<IResult> ResendConfirmation(ResendConfirmationRequest request, AppDbContext db, IEmailSender emailSender, IConfiguration config)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim());

            // Always return OK so this endpoint can't be used to find out which emails are registered
            if (user is not null && !user.EmailConfirmed)
                await SendConfirmationEmail(user, emailSender, config, db);

            return Results.Ok();
        }

        #region Helpers

        internal static string HashToken(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

        /// <summary>
        /// Sends a confirmation email to the user with a unique token for email verification.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="emailSender"></param>
        /// <param name="config"></param>
        /// <param name="db"></param>
        /// <returns></returns>
        private static async Task SendConfirmationEmail(User user, IEmailSender emailSender, IConfiguration config, AppDbContext db)
        {
            var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            user.EmailConfirmationTokenHash = HashToken(token);
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await db.SaveChangesAsync();

            var link = $"{config["App:FrontendUrl"]}/confirm-email" +
                       $"?email={Uri.EscapeDataString(user.Email)}&token={token}";

            await emailSender.SendAsync(
                user.Email,
                "Confirm your JobTracker account",
                $"<p>Hi {user.FullName},</p>" +
                $"<p>Please confirm your email by clicking <a href=\"{link}\">this link</a>.</p>" +
                "<p>The link is valid for 24 hours.</p>");
        }

        #endregion
    }
}
