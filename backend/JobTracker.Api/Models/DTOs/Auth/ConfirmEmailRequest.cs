namespace JobTracker.Api.Models.DTOs.Auth
{
    /// <summary>
    /// Payload for confirming a user's email address, containing the email and the confirmation token.
    /// </summary>
    /// <param name="Email"></param>
    /// <param name="Token"></param>
    public record ConfirmEmailRequest(string Email, string Token);
}
