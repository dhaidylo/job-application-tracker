namespace JobTracker.Api.Models.DTOs.Account
{
    /// <summary>
    /// Request to change the user's password.
    /// </summary>
    /// <param name="CurrentPassword">The current password of the user.</param>
    /// <param name="NewPassword">The new password for the user.</param>
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
}
