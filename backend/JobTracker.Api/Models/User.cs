namespace JobTracker.Api.Models
{
    /// <summary>
    /// Represents a user of the application.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Unique identifier for the user.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// User's display name or full name.
        /// </summary>
        public required string FullName { get; set; }

        /// <summary>
        /// User's email address, used for login. Must be unique across all users.
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// Hashed password for the user.
        /// </summary>
        public required string PasswordHash { get; set; }

        /// <summary>
        /// Timestamp of when the user account was created. Set automatically.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Navigation property for the job applications submitted by the user.
        /// </summary>
        public ICollection<JobApplication> JobApplications { get; } = [];
    }
}
