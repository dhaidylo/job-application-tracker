namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Request to explicitly change an application's status with an optional note.
    /// </summary>
    /// <param name="NewStatus"></param>
    /// <param name="Note"></param>
    public record UpdateStatusRequest(
        ApplicationStatus NewStatus,
        string? Note);
}
