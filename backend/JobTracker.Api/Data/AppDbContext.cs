using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Models;

namespace JobTracker.Api.Data
{
    /// <summary>
    /// Main db context for the JobTracker application.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Registered users.
        /// </summary>
        public DbSet<User> Users => Set<User>();

        /// <summary>
        /// Individual job applications linked to companies.
        /// </summary>
        public DbSet<JobApplication> JobApplications => Set<JobApplication>();

        /// <summary>
        /// Records of status changes for job applications.
        /// </summary>
        public DbSet<ApplicationStatusChange> ApplicationStatusChanges => Set<ApplicationStatusChange>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Register C# enums as native PostgreSQL enums.
            modelBuilder.HasPostgresEnum<ApplicationStatus>();
            modelBuilder.HasPostgresEnum<ApplicationSource>();

            // Ensure emails are unique across users.
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // One user has many job applications.
            // Deleting a user will cascade delete their job applications.
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.User)
                .WithMany(u => u.JobApplications)
                .HasForeignKey(ja => ja.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ApplicationStatusChange>(entity =>
            {
                // One job application has many status changes.
                // Deleting a job application will cascade delete its status changes.
                entity.HasOne<JobApplication>()
                      .WithMany(ja => ja.StatusChanges)
                      .HasForeignKey(asc => asc.JobApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
