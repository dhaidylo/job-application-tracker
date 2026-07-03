namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Returned to the client when a job application is created or retrieved.
    /// </summary>
    public record JobApplicationResponse(
        Guid Id,
        string CompanyName,
        string Position,
        string Location,
        ApplicationStatus Status,
        DateTime AppliedDate,
        string? JobPostingUrl,
        string? Notes,
        ApplicationSource Source,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
}
