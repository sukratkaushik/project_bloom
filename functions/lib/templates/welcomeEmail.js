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
exports.WELCOME_EMAIL_SUBJECT = "A personal note from the team behind Our Pregnancy";
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
    Welcome to Our Pregnancy. Gentle guidance and organized prenatal care for you and your baby.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px -4px rgba(44, 62, 80, 0.06); border: 1px solid #E8EDE9;">
          
          <!-- Top Brand Header with Lotus Logo -->
          <tr>
            <td style="padding: 36px 36px 22px; text-align: center; border-bottom: 1px solid #F4F2EC;">
              <a href="https://ourpregnancy.in" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://ourpregnancy.in/logo.png" width="48" height="48" alt="Our Pregnancy" style="display: block; margin: 0 auto; width: 48px; height: 48px; border: 0;" />
              </a>
              <h2 style="margin: 10px 0 2px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 500; color: #2C3E50; letter-spacing: 0.2px;">
                Our Pregnancy
              </h2>
              <p style="margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8AB6A3;">
                A Calm Companion for Expectant Parents
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
                First of all — <strong>congratulations</strong>. You are carrying life, and that is nothing short of miraculous.
              </p>

              <p style="margin: 0 0 16px;">
                I wanted to send a quick personal note to welcome you to our family and share why <em>Our Pregnancy</em> was born.
              </p>

              <p style="margin: 0 0 20px;">
                Based on our research on expectant parents, we noticed two major challenges:
              </p>

              <!-- Problem Box -->
              <div style="background-color: #F8FAF9; border-left: 3px solid #8AB6A3; border-radius: 0 12px 12px 0; padding: 16px 20px; margin: 0 0 24px; font-size: 13.5px; color: #4A5B55;">
                <p style="margin: 0 0 10px; line-height: 1.5;">
                  <strong>1. Overwhelming &amp; Generic Advice</strong> — Most information online is one-size-fits-all and doesn't account for Indian dietary habits, traditional practices, or cultural nuances.
                </p>
                <p style="margin: 0; line-height: 1.5;">
                  <strong>2. Information &amp; Document Clutter</strong> — Managing medical reports, test schedules, immunization dates, and scattered pregnancy notes across different clinics quickly becomes chaotic and stressful.
                </p>
              </div>

              <p style="margin: 0 0 24px;">
                We wanted to build something fundamentally different: a <strong>calm, organized companion</strong> designed to simplify your pregnancy journey and provide gentle reassurance at every step.
              </p>

              <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; color: #2C3E50; margin: 0 0 16px; border-bottom: 1px solid #F0F4F2; padding-bottom: 8px;">
                Here is how we’re here to support you every day:
              </h2>

              <!-- Feature Highlights -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 18px;">🌿</td>
                  <td style="padding: 10px 0 10px 8px; vertical-align: top; font-size: 13.5px; line-height: 1.5; color: #4A5B55;">
                    <strong style="color: #2C3E50;">24/7 Bloom AI Prenatal Guide</strong> — Instant, gentle answers to your daily pregnancy and lifestyle questions whenever you need reassurance.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 18px;">🥗</td>
                  <td style="padding: 10px 0 10px 8px; vertical-align: top; font-size: 13.5px; line-height: 1.5; color: #4A5B55;">
                    <strong style="color: #2C3E50;">AI Food Safety Scanner</strong> — Instant safety verdicts tailored for both Indian and global ingredients (papaya, saffron, street food, and teas).
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 18px;">🏛️</td>
                  <td style="padding: 10px 0 10px 8px; vertical-align: top; font-size: 13.5px; line-height: 1.5; color: #4A5B55;">
                    <strong style="color: #2C3E50;">Up to ₹6,000 in Govt Benefits</strong> — Step-by-step checklists to claim financial support under PMMVY and JSY.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 18px;">🤝</td>
                  <td style="padding: 10px 0 10px 8px; vertical-align: top; font-size: 13.5px; line-height: 1.5; color: #4A5B55;">
                    <strong style="color: #2C3E50;">Encrypted Partner Sync</strong> — Share milestones, journals, and clinic appointments in real time so you're never in this alone.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 28px; font-size: 18px;">📋</td>
                  <td style="padding: 10px 0 10px 8px; vertical-align: top; font-size: 13.5px; line-height: 1.5; color: #4A5B55;">
                    <strong style="color: #2C3E50;">Doctor-Ready EHR Summaries</strong> — 1-click clinical summaries formatted for your OB-GYN checkups, keeping all your records in one place.
                  </td>
                </tr>
              </table>

              <!-- Promo Gift Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFBF9; border: 1.5px dashed #8AB6A3; border-radius: 16px; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8AB6A3; margin-bottom: 6px;">
                      🎁 A Welcome Gift for Your Journey
                    </div>
                    <div style="font-size: 14px; color: #2C3E50; font-weight: 600; margin-bottom: 8px;">
                      Enjoy 30 Days of Free Premium Access
                    </div>
                    <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #8AB6A3; border-radius: 8px; padding: 6px 16px; font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: bold; color: #2C3E50; letter-spacing: 2.5px; margin-bottom: 8px;">
                      OPIN30
                    </div>
                    <div style="font-size: 11.5px; color: #7B8C86;">
                      Enter code at checkout. No credit card required. No hidden auto-renewals.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="https://ourpregnancy.in/dashboard" style="display: inline-block; background-color: #2C3E50; color: #FDFBF7; text-decoration: none; font-size: 14.5px; font-weight: 700; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 12px rgba(44, 62, 80, 0.15);">
                  ✨ Open My Pregnancy Dashboard
                </a>
              </div>

              <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.6;">
                If you ever have any questions, suggestions, or need assistance, please visit the <strong>Feedback &amp; Support</strong> section in your app footer — our team reviews every message.
              </p>

              <p style="margin: 0; font-size: 14.5px; color: #2C3E50; line-height: 1.5;">
                Wishing you and your little one radiant health,<br>
                <strong>Our Pregnancy Team</strong><br>
                <a href="https://ourpregnancy.in" style="color: #8AB6A3; text-decoration: none; font-size: 12.5px;">ourpregnancy.in</a>
              </p>

            </td>
          </tr>

          <!-- Footer Trust Seals -->
          <tr>
            <td style="background-color: #FAFBF9; border-top: 1px solid #E8EDE9; padding: 20px 36px; text-align: center; font-size: 11.5px; color: #8F9E99; line-height: 1.5;">
              <p style="margin: 0 0 6px;">
                🇮🇳 <strong>Dedicated to Maternal Health</strong> &nbsp;•&nbsp; 🤍 <strong>Made with care for expectant mothers</strong>
              </p>
              <p style="margin: 0;">
                © ${currentYear} Our Pregnancy. Dedicated to maternal care.
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