const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
};

const emailTemplate = (title, body, ctaText, ctaLink) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0a0a0f; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3d; }
  .header { background: linear-gradient(135deg, #6d28d9, #8b5cf6); padding: 28px 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 1.4rem; }
  .body { padding: 28px 32px; color: #e2e8f0; line-height: 1.7; font-size: 0.95rem; }
  .cta { text-align: center; margin: 28px 0 8px; }
  .cta a { background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
  .footer { padding: 16px 32px; text-align: center; color: #4b5563; font-size: 0.75rem; border-top: 1px solid #2a2a3d; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>⚡ SkillSwap</h1></div>
    <div class="body">
      <h2 style="color:#a78bfa;margin-top:0">${title}</h2>
      ${body}
      ${ctaText && ctaLink ? `<div class="cta"><a href="${ctaLink}">${ctaText}</a></div>` : ''}
    </div>
    <div class="footer">SkillSwap · You're receiving this because you have an account · <a href="#" style="color:#6b7280">Unsubscribe</a></div>
  </div>
</body>
</html>`;

const sendEmail = async (to, subject, title, body, ctaText = '', ctaLink = '') => {
  const transporter = getTransporter();
  if (!transporter) { console.log('[Email] Not configured — skipping:', subject); return; }
  try {
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
      to, subject,
      html: emailTemplate(title, body, ctaText, ctaLink)
    });
    console.log('[Email] Sent to:', to);
  } catch (err) { console.error('[Email] Error:', err.message); }
};

// ── Email types ───────────────────────────────────────────────────
exports.sendExchangeRequestEmail = async (recipientEmail, recipientName, senderName, skill) => {
  await sendEmail(
    recipientEmail,
    `🔄 ${senderName} wants to exchange skills with you`,
    'New Exchange Request!',
    `<p>Hi ${recipientName},</p>
     <p><strong>${senderName}</strong> has sent you a skill exchange request!</p>
     <p>They want to learn <strong>${skill}</strong> from you and have skills to offer in return.</p>
     <p>Log in to review their request and start learning together.</p>`,
    'View Request →',
    `${process.env.CLIENT_URL}/exchanges`
  );
};

exports.sendMessageEmail = async (recipientEmail, recipientName, senderName) => {
  await sendEmail(
    recipientEmail,
    `💬 New message from ${senderName}`,
    `${senderName} sent you a message`,
    `<p>Hi ${recipientName},</p>
     <p>You have a new message from <strong>${senderName}</strong> on SkillSwap.</p>
     <p>Reply to keep the conversation going!</p>`,
    'Read Message →',
    `${process.env.CLIENT_URL}/messages`
  );
};

exports.sendReviewEmail = async (recipientEmail, recipientName, reviewerName, rating) => {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  await sendEmail(
    recipientEmail,
    `⭐ ${reviewerName} left you a review`,
    'You got a new review!',
    `<p>Hi ${recipientName},</p>
     <p><strong>${reviewerName}</strong> left you a <strong>${rating}/5</strong> star review ${stars}</p>
     <p>Check your profile to see what they said!</p>`,
    'View Review →',
    `${process.env.CLIENT_URL}/profile`
  );
};

exports.sendWelcomeEmail = async (email, name) => {
  await sendEmail(
    email,
    '🚀 Welcome to SkillSwap!',
    `Welcome, ${name}!`,
    `<p>You're now part of SkillSwap — the platform where developers trade skills instead of money.</p>
     <ul style="color:#94a3b8">
       <li>Browse developers and find your perfect skill exchange partner</li>
       <li>Use AI tools to review code and generate learning paths</li>
       <li>Collaborate on projects with your team</li>
     </ul>
     <p>Get started by completing your profile and exploring other developers!</p>`,
    'Explore Developers →',
    `${process.env.CLIENT_URL}/explore`
  );
};
