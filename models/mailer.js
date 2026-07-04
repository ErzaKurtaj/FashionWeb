const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(to, name, verifyUrl) {
  await transporter.sendMail({
    from: `"Passionis" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your Passionis account',
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for creating a Passionis account. Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendVerificationEmail };
