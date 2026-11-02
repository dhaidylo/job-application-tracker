namespace JobTracker.Api.Models.DTOs.Auth
{
    /// <summary>
    /// Payload for resending email confirmation, containing the user's email address.
    /// </summary>
    /// <param name="Email"></param>
    public record ResendConfirmationRequest(string Email);
}
