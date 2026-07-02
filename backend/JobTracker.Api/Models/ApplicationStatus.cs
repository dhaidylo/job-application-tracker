namespace JobTracker.Api.Models
{
    /// <summary>
    /// Represents the possible statuses of a job application.
    /// </summary>
    public enum ApplicationStatus
    {
        /// <summary>
        /// Application submitted, awaiting response.
        /// </summary>
        Applied,

        /// <summary>
        /// Application is in the interview process.
        /// </summary>
        Interviewing,

        /// <summary>
        /// An offer has been received.
        /// </summary>
        Offered,

        /// <summary>
        /// Application has been rejected.
        /// </summary>
        Rejected
    }
}
