namespace JobTracker.Api.Models
{
    /// <summary>
    /// Represents a job application submitted by a user to a company for a specific position.
    /// </summary>
    public class JobApplication
    {
        /// <summary>
        /// Unique identifier for the job application.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The name of the company to which the application was submitted.
        /// </summary>
        public required string CompanyName { get; set; }

        /// <summary>
        /// The position or job title for which the application was submitted.
        /// </summary>
        public required string Position { get; set; }

        /// <summary>
        /// The location of the company or the job position (e.g., city, state, or remote).
        /// </summary>
        public string Location { get; set; } = string.Empty;

        /// <summary>
        /// The current status of the job application (e.g., Applied, Interviewing, Offered, Rejected).
        /// </summary>
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

        /// <summary>
        /// The date when the application was submitted.
        /// </summary>
        public required DateTime AppliedDate { get; set; }

        /// <summary>
        /// URL to the job posting for this application. Optional.
        /// </summary>
        public string? JobPostingUrl { get; set; }
        
        /// <summary>
        /// Any additional notes or comments about the job application.
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// Where the job posting was found. Defaults to Unknown if not specified.
        /// </summary>
        public ApplicationSource Source { get; set; } = ApplicationSource.Unknown;

        /// <summary>
        /// Timestamp of when this record was created. Set automatically.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Timestamp of the last update to this record.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Foreign key referencing the user who owns this job application.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Navigation property to the user who owns this job application.
        /// </summary>
        public User User { get; set; } = null!;
    }
}
