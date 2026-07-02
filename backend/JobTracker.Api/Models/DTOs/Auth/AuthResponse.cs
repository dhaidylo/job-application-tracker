namespace JobTracker.Api.Models.DTOs.Auth
{
    /// <summary>
    /// Returned to the client after successful register or login.
    /// </summary>
    /// <param name="Token">The authentication token.</param>
    /// <param name="Email">The email address of the user.</param>
    /// <param name="FullName">The full name of the user.</param>
    public record AuthResponse(
        string Token,
        string Email,
        string FullName
    );
}
