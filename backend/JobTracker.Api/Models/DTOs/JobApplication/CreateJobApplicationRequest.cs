namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Payload for creating a new job application.
    /// </summary>
    public record CreateJobApplicationRequest(
        string CompanyName,
        string Position,
        string Location,
        ApplicationStatus Status,
        DateTime AppliedDate,
        string? JobPostingUrl,
        string? Notes,
        ApplicationSource Source
    );
}
