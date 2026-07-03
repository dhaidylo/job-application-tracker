using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.Models.DTOs.JobApplication;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JobTracker.Api.Endpoints
{
    /// <summary>
    /// Contains endpoints for managing job applications.
    /// </summary>
    public static class JobApplicationEndpoints
    {
        /// <summary>
        /// Maps the job application endpoints to the specified WebApplication instance.
        /// </summary>
        /// <param name="app">The web application.</param>
        public static void MapJobApplicationEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/applications")
                .WithTags("Job Applications")
                .RequireAuthorization();

            group.MapGet("/", GetAll)
                .Produces<JobApplicationListResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized);

            group.MapGet("/{Id:guid}", GetById)
                .Produces<JobApplicationResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status404NotFound);

            group.MapPost("/", Create)
                .Accepts<CreateJobApplicationRequest>("application/json")
                .Produces<JobApplicationResponse>(StatusCodes.Status201Created)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized);

            group.MapPut("/{Id:guid}", Update)
                .Accepts<UpdateJobApplicationRequest>("application/json")
                .Produces<JobApplicationResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status404NotFound);

            group.MapDelete("/{Id:guid}", Delete)
                .Produces(StatusCodes.Status204NoContent)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status404NotFound);
        }

        /// <summary>
        /// Gets all job applications for the authenticated user.
        /// </summary>
        /// <param name="db">The database context.</param>
        /// <param name="user">The authenticated user.</param>
        /// <returns>The result of the operation.</returns>
        private static async Task<IResult> GetAll(AppDbContext db, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null)
                return Results.Unauthorized();

            var applications = await db.JobApplications
                .Where(a => a.UserId == Guid.Parse(userId))
                .Select(a => new JobApplicationResponse(
                    a.Id,
                    a.CompanyName,
                    a.Position,
                    a.Location,
                    a.Status,
                    a.AppliedDate,
                    a.JobPostingUrl,
                    a.Notes,
                    a.Source,
                    a.CreatedAt,
                    a.UpdatedAt
                ))
                .ToListAsync();

            var response = new JobApplicationListResponse(applications, applications.Count);

            return Results.Ok(response);
        }

        /// <summary>
        /// Gets a specific job application by ID for the authenticated user.
        /// </summary>
        /// <param name="Id">The ID of the job application to retrieve.</param>
        /// <param name="db">The database context.</param>
        /// <param name="user">The authenticated user.</param>
        /// <returns>The result of the operation.</returns>
        private static async Task<IResult> GetById(Guid Id, AppDbContext db, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Results.Unauthorized();

            var application = await db.JobApplications
                .Where(a => a.Id == Id && a.UserId == Guid.Parse(userId))
                .Select(a => new JobApplicationResponse(
                    a.Id,
                    a.CompanyName,
                    a.Position,
                    a.Location,
                    a.Status,
                    a.AppliedDate,
                    a.JobPostingUrl,
                    a.Notes,
                    a.Source,
                    a.CreatedAt,
                    a.UpdatedAt
                ))
                .FirstOrDefaultAsync();

            if (application is null)
                return Results.NotFound();

            return Results.Ok(application);
        }

        /// <summary>
        /// Creates a new job application for the authenticated user.
        /// </summary>
        /// <param name="request">The request containing the job application details.</param>
        /// <param name="db">The database context.</param>
        /// <param name="user">The authenticated user.</param>
        /// <returns>The result of the operation.</returns>
        private static async Task<IResult> Create(
            CreateJobApplicationRequest request,
            AppDbContext db,
            ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null)
                return Results.Unauthorized();

            var application = new JobApplication()
            {
                Id = Guid.NewGuid(),
                CompanyName = request.CompanyName,
                Position = request.Position,
                Location = request.Location,
                Status = request.Status,
                AppliedDate = DateTime.SpecifyKind(request.AppliedDate, DateTimeKind.Utc),
                JobPostingUrl = request.JobPostingUrl,
                Notes = request.Notes,
                Source = request.Source,
                UserId = Guid.Parse(userId)
            };

            db.JobApplications.Add(application);
            await db.SaveChangesAsync();

            var response = new JobApplicationResponse(
                application.Id,
                application.CompanyName,
                application.Position,
                application.Location,
                application.Status,
                application.AppliedDate,
                application.JobPostingUrl,
                application.Notes,
                application.Source,
                application.CreatedAt,
                null
            );

            return Results.Created($"/api/applications/{application.Id}", response);
        }

        /// <summary>
        /// Updates an existing job application for the authenticated user.
        /// </summary>
        /// <param name="Id">The ID of the job application to update.</param>
        /// <param name="request">The request containing the updated job application details.</param>
        /// <param name="db">The database context.</param>
        /// <param name="user">The authenticated user.</param>
        /// <returns>The result of the operation.</returns>
        private static async Task<IResult> Update(Guid Id, UpdateJobApplicationRequest request, AppDbContext db, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null)
                return Results.Unauthorized();

            var application = await db.JobApplications.FindAsync(Id);
            if (application is null)
                return Results.NotFound();

            if (application.UserId != Guid.Parse(userId))
                return Results.Forbid(); // Maybe should also return NotFound to avoid leaking information about the existence of the application

            application.CompanyName = request.CompanyName;
            application.Position = request.Position;
            application.Location = request.Location;
            application.Status = request.Status;
            application.AppliedDate = DateTime.SpecifyKind(request.AppliedDate, DateTimeKind.Utc);
            application.JobPostingUrl = request.JobPostingUrl;
            application.Notes = request.Notes;
            application.Source = request.Source;
            application.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            var response = new JobApplicationResponse(
                application.Id,
                application.CompanyName,
                application.Position,
                application.Location,
                application.Status,
                application.AppliedDate,
                application.JobPostingUrl,
                application.Notes,
                application.Source,
                application.CreatedAt,
                application.UpdatedAt
            );

            return Results.Ok(response);
        }

        /// <summary>
        /// Deletes an existing job application for the authenticated user.
        /// </summary>
        /// <param name="Id">The ID of the job application to delete.</param>
        /// <param name="db">The database context.</param>
        /// <param name="user">The authenticated user.</param>
        /// <returns>The result of the operation.</returns>
        private static async Task<IResult> Delete(Guid Id, AppDbContext db, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null)
                return Results.Unauthorized();

            var application = await db.JobApplications.FindAsync(Id);
            if (application is null)
                return Results.NotFound();

            if (application.UserId != Guid.Parse(userId))
                return Results.Forbid(); // Maybe should also return NotFound to avoid leaking information about the existence of the application

            db.JobApplications.Remove(application);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }
    }
}
