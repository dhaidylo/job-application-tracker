namespace JobTracker.Api.Models.DTOs.Dashboard
{
    public record DashboardStatsResponse(
        int TotalApplications,
        int ActiveApplications,
        Dictionary<string, int> ByStatus,
        Dictionary<string, int> ByMonth
    );
}
