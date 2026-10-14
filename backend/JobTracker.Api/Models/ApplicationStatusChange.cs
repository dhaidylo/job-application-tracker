namespace JobTracker.Api.Models
{
    /// <summary>
    /// Records a single status change for a job application.
    /// </summary>
    public class ApplicationStatusChange
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Foreign key referencing the <see cref="JobApplication"/> this change belongs to.
        /// </summary>
        public Guid JobApplicationId { get; set; }

        /// <summary>
        /// Status before the change.
        /// </summary>
        public ApplicationStatus OldStatus { get; set; }

        /// <summary>
        /// Status after the change.
        /// </summary>
        public ApplicationStatus NewStatus { get; set; }

        /// <summary>
        /// When the change occured.
        /// </summary>
        public DateTime ChangedAt { get; set; }

        /// <summary>
        /// Optional note or comment about the status change.
        /// </summary>
        public string? Note { get; set; }
    }
}
