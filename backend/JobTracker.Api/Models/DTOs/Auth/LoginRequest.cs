namespace JobTracker.Api.Models.DTOs.Auth
{
    /// <summary>
    /// Payload for logging in an existing user.
    /// </summary>
    /// <param name="Email">The email address of the user.</param>
    /// <param name="Password">The password for the user.</param>
    public record LoginRequest(
        string Email,
        string Password
    );
}
