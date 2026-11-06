namespace JobTracker.Api.Models.DTOs.Account
{
    /// <summary>
    /// Confirmation request for changing the user's email address.
    /// </summary>
    /// <param name="Email">The user's email address.</param>
    /// <param name="Token">The confirmation token.</param>
    public record ConfirmEmailChangeRequest(string Email, string Token);
}
