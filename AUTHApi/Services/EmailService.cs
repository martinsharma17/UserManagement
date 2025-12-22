// Services/EmailService.cs
// Implementation of email sending service

using Microsoft.Extensions.Configuration;

namespace AUTHApi.Services
{
    /// <summary>
    /// Email service implementation
    /// Currently uses console logging for development
    /// TODO: Replace with SMTP or SendGrid for production
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Sends a password reset email
        /// DEVELOPMENT MODE: Logs to console
        /// PRODUCTION MODE: Should use SMTP/SendGrid (see comments below)
        /// </summary>
        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            // ============================================================================
            // DEVELOPMENT MODE: Console Logging
            // ============================================================================
            // This is for development only. In production, replace this with actual email sending.
            
            Console.WriteLine("========================================");
            Console.WriteLine("📧 PASSWORD RESET EMAIL");
            Console.WriteLine("========================================");
            Console.WriteLine($"To: {email}");
            Console.WriteLine($"Reset Link: {resetLink}");
            Console.WriteLine("========================================");
            Console.WriteLine("⚠️  DEV MODE: Copy the link above to test password reset");
            Console.WriteLine("========================================");

            // Simulate async operation
            await Task.CompletedTask;

            // ============================================================================
            // PRODUCTION MODE: Uncomment and configure one of the options below
            // ============================================================================

            /* 
            // OPTION 1: Gmail SMTP
            // -----------------------------------------------------------------------
            // 1. Enable 2FA on your Gmail account
            // 2. Generate an "App Password" from Google Account settings
            // 3. Add to appsettings.json:
            //    "Email": {
            //      "SmtpServer": "smtp.gmail.com",
            //      "SmtpPort": 587,
            //      "SmtpUser": "your-email@gmail.com",
            //      "SmtpPassword": "your-app-password"
            //    }
            
            var smtpServer = _configuration["Email:SmtpServer"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"]);
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];

            using var smtpClient = new System.Net.Mail.SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(smtpUser, smtpPassword)
            };

            var mailMessage = new System.Net.Mail.MailMessage
            {
                From = new System.Net.Mail.MailAddress(smtpUser, "User Management System"),
                Subject = "Password Reset Request",
                Body = $"Click the following link to reset your password: {resetLink}",
                IsBodyHtml = false
            };
            mailMessage.To.Add(email);

            await smtpClient.SendMailAsync(mailMessage);
            */

            /* 
            // OPTION 2: SendGrid (Recommended for Production)
            // -----------------------------------------------------------------------
            // 1. Install NuGet: Install-Package SendGrid
            // 2. Create account at https://sendgrid.com
            // 3. Get API key from SendGrid dashboard
            // 4. Add to appsettings.json:
            //    "Email": {
            //      "SendGridApiKey": "your-sendgrid-api-key",
            //      "FromEmail": "noreply@yourapp.com",
            //      "FromName": "User Management System"
            //    }
            
            var apiKey = _configuration["Email:SendGridApiKey"];
            var client = new SendGrid.SendGridClient(apiKey);
            
            var from = new SendGrid.Helpers.Mail.EmailAddress(
                _configuration["Email:FromEmail"], 
                _configuration["Email:FromName"]
            );
            var to = new SendGrid.Helpers.Mail.EmailAddress(email);
            var subject = "Password Reset Request";
            var plainTextContent = $"Click the following link to reset your password: {resetLink}";
            var htmlContent = $@"
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <a href='{resetLink}' style='display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;'>
                    Reset Password
                </a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
            ";
            
            var msg = SendGrid.Helpers.Mail.MailHelper.CreateSingleEmail(
                from, to, subject, plainTextContent, htmlContent
            );
            
            await client.SendEmailAsync(msg);
            */
        }
    }
}
