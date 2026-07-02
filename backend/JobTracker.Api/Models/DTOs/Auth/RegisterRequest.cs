namespace JobTracker.Api.Models.DTOs.Auth
{
    /// <summary>
    /// Payload for registering a new user.
    /// </summary>
    /// <param name="Email">The email address of the user.</param>
    /// <param name="Password">The password for the user.</param>
    /// <param name="FullName">The full name of the user.</param>
    public record RegisterRequest(
        string Email,
        string Password,
        string FullName
    );
}
