namespace JobTracker.Api.Models.DTOs.Account
{
    /// <summary>
    /// Current user's profile data.
    /// </summary>
    /// <param name="FullName">The full name of the user.</param>
    /// <param name="Email">The email address of the user.</param>
    /// <param name="PendingEmail">The new email address waiting for confirmation.</param>
    public record ProfileResponse(string FullName, string Email, string? PendingEmail);
}
