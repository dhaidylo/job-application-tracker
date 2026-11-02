using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace JobTracker.Api.Services
{
    /// <summary>
    /// Sends emails through any SMTP server.
    /// </summary>
    /// <param name="config"></param>
    public class SmtpEmailSender(IConfiguration config): IEmailSender
    {
        public async Task SendAsync(string to, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(config["Smtp:From"]!));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            var useTls = bool.Parse(config["Smtp:UseTls"] ?? "false");

            using var client = new SmtpClient();
            await client.ConnectAsync(
                config["Smtp:Host"],
                int.Parse(config["Smtp:Port"]!),
                useTls ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

            // Mailpit needs no credentials; real providers do
            if (!string.IsNullOrEmpty(config["Smtp:Username"]))
                await client.AuthenticateAsync(config["Smtp:Username"], config["Smtp:Password"]);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
