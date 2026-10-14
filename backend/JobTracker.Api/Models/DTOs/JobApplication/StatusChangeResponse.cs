namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Response DTO for a single status change record.
    /// </summary>
    public record StatusChangeResponse(
        Guid Id,
        ApplicationStatus OldStatus,
        ApplicationStatus NewStatus,
        DateTime ChangedAt,
        string? Note
        );
}
