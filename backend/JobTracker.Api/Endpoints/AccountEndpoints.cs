using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.Models.DTOs.Account;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System.Security.Claims;
using System.Security.Cryptography;

namespace JobTracker.Api.Endpoints
{
    /// <summary>
    /// Endpoints for the logged-in user to manage their own account.
    /// </summary>
    public static class AccountEndpoints
    {
        private const int MinPasswordLength = 8;

        /// <summary>
        /// Maps the account-related endpoints to the application.
        /// </summary>
        /// <param name="app">The web application.</param>
        public static void MapAccountEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/account").RequireAuthorization();

            group.MapGet("/", GetProfile)
                .Produces<ProfileResponse>(StatusCodes.Status200OK)
                .Produces<ProfileResponse>(StatusCodes.Status401Unauthorized);

            group.MapPut("/profile", UpdateProfile)
                .Accepts<UpdateProfileRequest>("application/json")
                .Produces<ProfileResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces<ProfileResponse>(StatusCodes.Status401Unauthorized);

            group.MapPut("/password", ChangePassword)
                .Accepts<ChangePasswordRequest>("application/json")
                .Produces(StatusCodes.Status204NoContent)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized);

            group.MapPut("/email", ChangeEmail)
                .Accepts<ChangeEmailRequest>("application/json")
                .Produces<ProfileResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status409Conflict);

            group.MapPost("/confirm-email-change", ConfirmEmailChange)
                .Accepts<ConfirmEmailChangeRequest>("application/json")
                .Produces(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status409Conflict);
        }

        /// <summary>
        /// Gets the current user's profile information.
        /// </summary>
        /// <param name="db">The application database context.</param>
        /// <param name="principal">The current user's principal.</param>
        /// <returns></returns>
        private static async Task<IResult> GetProfile(AppDbContext db, ClaimsPrincipal principal)
        {
            var user = await GetCurrentUser(db, principal);
            if (user is null)
                return Results.Unauthorized();

            return Results.Ok(new ProfileResponse(user.FullName, user.Email, user.PendingEmail));
        }

        /// <summary>
        /// Updates the current user's profile information.
        /// </summary>
        /// <param name="request">The request containing the updated profile information.</param>
        /// <param name="db">The application database context.</param>
        /// <param name="principal">The current user's principal.</param>
        /// <returns></returns>
        private static async Task<IResult> UpdateProfile(
            UpdateProfileRequest request, AppDbContext db, ClaimsPrincipal principal)
        {
            var user = await GetCurrentUser(db, principal);
            if (user is null)
                return Results.Unauthorized();

            var fullName = request.FullName?.Trim();
            if (string.IsNullOrEmpty(fullName))
                return Results.BadRequest(new { message = "Name cannot be empty." });

            user.FullName = fullName;
            await db.SaveChangesAsync();

            return Results.Ok(new ProfileResponse(user.FullName, user.Email, user.PendingEmail));
        }

        /// <summary>
        /// Changes the current user's password.
        /// </summary>
        /// <param name="request">The request containing the current and new passwords.</param>
        /// <param name="db">The application database context.</param>
        /// <param name="principal">The current user's principal.</param>
        /// <returns></returns>
        private static async Task<IResult> ChangePassword(ChangePasswordRequest request, AppDbContext db, ClaimsPrincipal principal)
        {
            var user = await GetCurrentUser(db, principal);
            if (user is null)
                return Results.Unauthorized();

            if (request.NewPassword is null || request.NewPassword.Length < MinPasswordLength)
                return Results.BadRequest(new { message = $"Password must be at least {MinPasswordLength} characters." });

            var hasher = new PasswordHasher<User>();

            var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (verification == PasswordVerificationResult.Failed)
                return Results.BadRequest(new { message = "Current password is incorrect." });

            if (request.CurrentPassword == request.NewPassword)
                return Results.BadRequest(new { message = "New password must be different from the current one." });

            user.PasswordHash = hasher.HashPassword(user, request.NewPassword);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }

        /// <summary>
        /// Changes the current user's email address, sending a confirmation email to the new address.
        /// </summary>
        /// <param name="request">The request containing the new email address and current password.</param>
        /// <param name="db">The application database context.</param>
        /// <param name="principal">The current user's principal.</param>
        /// <param name="emailSender">The email sender.</param>
        /// <param name="config">The application configuration.</param>
        /// <returns></returns>
        private static async Task<IResult> ChangeEmail(ChangeEmailRequest request, AppDbContext db, ClaimsPrincipal principal, IEmailSender emailSender, IConfiguration config)
        {
            var user = await GetCurrentUser(db, principal);
            if (user is null)
                return Results.Unauthorized();

            var hasher = new PasswordHasher<User>();
            if (hasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword) == PasswordVerificationResult.Failed)
                return Results.BadRequest(new { message = "Current password is incorrect." });

            var newEmail = request.NewEmail.ToLowerInvariant().Trim();
            if (!MailboxAddress.TryParse(newEmail, out _))
                return Results.BadRequest(new { message = "Invalid email address." });

            if (newEmail == user.Email)
                return Results.BadRequest(new { message = "This is already your email." });

            if (await db.Users.AnyAsync(u => u.Email == newEmail))
                return Results.Conflict(new { message = "Email is already in use." });

            var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            user.PendingEmail = newEmail;
            user.EmailConfirmationTokenHash = AuthEndpoints.HashToken(token);
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await db.SaveChangesAsync();

            var link = $"{config["App:FrontendUrl"]}/confirm-email-change" +
                       $"?email={Uri.EscapeDataString(newEmail)}&token={token}";

            // Link goes to the NEW address, proving the user owns it
            await emailSender.SendAsync(newEmail, "Confirm your new JobTracker email",
                $"<p>Confirm your new email by clicking <a href=\"{link}\">this link</a>. Valid for 24 hours.</p>");

            // Warn the OLD address, so a hijacked session can't silently take over the account
            await emailSender.SendAsync(user.Email, "Email change requested",
                $"<p>A change of your JobTracker email to {newEmail} was requested. If this wasn't you, change your password now.</p>");

            return Results.Ok(new ProfileResponse(user.FullName, user.Email, user.PendingEmail));
        }

        /// <summary>
        /// Confirms the change of the user's email address using a token sent to the new email.
        /// </summary>
        /// <param name="request">The request containing the new email address and confirmation token.</param>
        /// <param name="db">The application database context.</param>
        /// <returns></returns>
        private static async Task<IResult> ConfirmEmailChange(ConfirmEmailChangeRequest request, AppDbContext db)
        {
            var email = request.Email.ToLowerInvariant().Trim();
            var user = await db.Users.FirstOrDefaultAsync(u => u.PendingEmail == email);

            if (user is null ||
                user.EmailConfirmationTokenHash != AuthEndpoints.HashToken(request.Token) ||
                user.EmailConfirmationTokenExpiresAt < DateTime.UtcNow)
                return Results.BadRequest(new { message = "Invalid or expired link." });

            // Someone may have registered this address while the change was pending
            if (await db.Users.AnyAsync(u => u.Email == email))
                return Results.Conflict(new { message = "Email is already in use." });

            user.Email = email;
            user.PendingEmail = null;
            user.EmailConfirmationTokenHash = null;
            user.EmailConfirmationTokenExpiresAt = null;
            await db.SaveChangesAsync();

            return Results.Ok();
        }

        /// <summary>
        /// Loads the user from the JWT's user id.
        /// </summary>
        /// <param name="db"></param>
        /// <param name="principal"></param>
        /// <returns>Current <see cref="User"/>. Returns <see langword="null"/> if the claim is missing or the user no longer exists.</returns>
        private static async Task<User?> GetCurrentUser(AppDbContext db, ClaimsPrincipal principal)
        {
            var id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var userId) ? await db.Users.FindAsync(userId) : null;
        }
    }
}
