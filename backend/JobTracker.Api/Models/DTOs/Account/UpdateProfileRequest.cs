namespace JobTracker.Api.Models.DTOs.Account
{
    /// <summary>
    /// Request to update the user's display name.
    /// </summary>
    /// <param name="FullName"></param>
    public record UpdateProfileRequest(string FullName);
}
