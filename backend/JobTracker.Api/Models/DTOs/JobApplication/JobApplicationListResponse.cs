namespace JobTracker.Api.Models.DTOs.JobApplication
{
    /// <summary>
    /// Response model for a list of job applications, including the total count of applications.
    /// </summary>
    public record JobApplicationListResponse(IEnumerable<JobApplicationResponse> JobApplications, int TotalCount);
}
