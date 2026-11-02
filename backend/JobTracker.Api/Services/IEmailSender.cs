namespace JobTracker.Api.Services
{
    /// <summary>
    /// A service interface for sending emails.
    /// </summary>
    public interface IEmailSender
    {
        Task SendAsync(string to, string subject, string htmlBody);
    }
}
