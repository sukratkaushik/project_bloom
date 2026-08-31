"use strict";
/**
 * Canonical Welcome Email Template for Our Pregnancy (OPIN)
 *
 * Always used as the official welcome email for all new expectant mothers
 * joining via Google Sign-In, Email OTP verification, or any other method.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WELCOME_EMAIL_REPLY_TO = exports.WELCOME_EMAIL_SENDER_NAME = exports.WELCOME_EMAIL_SUBJECT = void 0;
exports.renderWelcomeEmailHtml = renderWelcomeEmailHtml;
exports.WELCOME_EMAIL_SUBJECT = "A personal note from the team behind Our Pregnancy 🌸";
exports.WELCOME_EMAIL_SENDER_NAME = "Our Pregnancy Team";
exports.WELCOME_EMAIL_REPLY_TO = "hello@ourpregnancy.in";
function renderWelcomeEmailHtml(recipientFirstName) {
    const cleanName = recipientFirstName && recipientFirstName.trim().length > 0 && recipientFirstName.toLowerCase() !== "there"
        ? recipientFirstName.trim()
        : "there";
    const currentYear = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Pregnancy</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C3E50; -webkit-font-smoothing: antialiased;">
  <!-- Preheader preview text -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">
    Welcome to Our Pregnancy. Gentle, science-backed guidance for you and your baby.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px -4px rgba(44, 62, 80, 0.05); border: 1px solid #E8EDE9;">
          
          <!-- Top Brand Header with Lotus Logo -->
          <tr>
            <td style="padding: 36px 36px 20px; text-align: center; border-bottom: 1px solid #F4F2EC;">
              <a href="https://ourpregnancy.in" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://ourpregnancy.in/logo.png" width="48" height="48" alt="Our Pregnancy" style="display: block; margin: 0 auto; width: 48px; height: 48px; border: 0;" />
              </a>
              <h2 style="margin: 10px 0 2px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 500; color: #2C3E50; letter-spacing: 0.2px;">
                Our Pregnancy
              </h2>
              <p style="margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #8AB6A3;">
                Your pregnancy companion — secure &amp; synced
              </p>
            </td>
          </tr>

          <!-- Letter Content -->
          <tr>
            <td style="padding: 32px 36px; font-size: 14.5px; line-height: 1.65; color: #4A5B55;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #2C3E50; font-weight: 600;">
                Hi ${cleanName},
              </p>
              
              <p style="margin: 0 0 16px;">
                First of all — <strong>congratulations</strong>. Carrying life is a truly extraordinary journey.
              </p>

              <p style="margin: 0 0 16px;">
                I wanted to send a quick personal note to welcome you to Our Pregnancy and share a little bit about why we built this.
              </p>

              <p style="margin: 0 0 16px;">
                Pregnancy brings so many new feelings, questions, and decisions. We created Our Pregnancy to give expectant parents a calm, reliable companion with science-backed guidance, helpful medical tools, and compassionate support every step of the way.
              </p>

              <p style="margin: 0 0 16px;">
                To help you experience everything Our Pregnancy has to offer, you can use code <strong>OPIN30</strong> at checkout to unlock full Premium features for your first 30 days.
              </p>

              <p style="margin: 0 0 24px;">
                Whether this is your very first week or you are entering your final trimester: we are honored to walk beside you.
              </p>

              <div style="background-color: #F8FAF9; border-left: 3px solid #8AB6A3; border-radius: 0 12px 12px 0; padding: 18px 20px; margin: 0 0 24px; font-size: 13.5px; line-height: 1.6; color: #4A5B55;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #2C3E50;">Three simple things you can try today:</p>
                <p style="margin: 0 0 6px;">1. <strong>Ask Bloom AI</strong> any pregnancy or symptom question on your mind for gentle, instant guidance.</p>
                <p style="margin: 0 0 6px;">2. <strong>Check your daily timeline</strong> to see how your baby is developing today.</p>
                <p style="margin: 0;">3. <strong>Explore the dashboard</strong> and tools designed to make your journey smoother.</p>
              </div>

              <!-- Primary CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://ourpregnancy.in/dashboard" style="display: inline-block; background-color: #8AB6A3; color: #FFFFFF; text-decoration: none; font-size: 14.5px; font-weight: 600; padding: 13px 32px; border-radius: 9999px; box-shadow: 0 3px 12px rgba(138, 182, 163, 0.35);">
                  Open my dashboard
                </a>
              </div>

              <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.6;">
                If you ever have any questions, suggestions, or need assistance, please visit the <strong>Feedback &amp; Support</strong> section in your app footer — our team reviews every message.
              </p>

              <p style="margin: 0; font-size: 14.5px; color: #2C3E50; line-height: 1.5;">
                Wishing you and your little one radiant health and happiness,<br>
                <strong>Our Pregnancy Team</strong> 🌸<br>
                <a href="https://ourpregnancy.in" style="color: #8AB6A3; text-decoration: none; font-size: 12.5px;">ourpregnancy.in</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBF9; border-top: 1px solid #E8EDE9; padding: 20px 36px; text-align: center; font-size: 12.5px; color: #6B7A87; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                Our Pregnancy &middot; Made with &#x1F90D; for expectant mothers
              </p>
              <p style="margin: 0; font-size: 12px; color: #8F9E99;">
                &copy; ${currentYear} Our Pregnancy. Dedicated to maternal care.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
//# sourceMappingURL=welcomeEmail.js.map