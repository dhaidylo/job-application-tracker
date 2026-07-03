namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Payload for updating an existing job application.
    /// </summary>
    public record UpdateJobApplicationRequest(
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
