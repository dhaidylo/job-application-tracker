namespace JobTracker.Api.Models.DTOs.Account
{
    /// <summary>
    /// Request to change the user's email address.
    /// </summary>
    /// <param name="NewEmail">The new email address for the user.</param>
    /// <param name="CurrentPassword">The user's current password.</param>
    public record ChangeEmailRequest(string NewEmail,string CurrentPassword);
}
