async function sendEmail(to, name, subject, htmlContent) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key':      process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name:  'Passionis',
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [{ email: to, name }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Brevo API error ${res.status}: ${errText}`);
  }
}

async function sendVerificationEmail(to, name, verifyUrl) {
  await sendEmail(to, name, 'Verify your Passionis account', `
    <p>Hi ${name},</p>
    <p>Thanks for creating a Passionis account. Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>If you didn't create this account, you can ignore this email.</p>
  `);
}

async function sendPasswordResetEmail(to, name, resetUrl) {
  await sendEmail(to, name, 'Reset your Passionis password', `
    <p>Hi ${name},</p>
    <p>We received a request to reset your Passionis password. Click the link below to choose a new one:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
  `);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
