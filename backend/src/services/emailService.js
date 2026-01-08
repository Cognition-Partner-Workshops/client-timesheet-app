const nodemailer = require('nodemailer');

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

const fromAddress = process.env.EMAIL_FROM || 'noreply@timesheet-app.com';
const appUrl = process.env.APP_URL || 'http://localhost:5173';

// Create transporter (lazy initialization)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();
  
  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sendTimesheetReminderEmail(userEmail, missedDates) {
  const dateList = missedDates.map(date => `  - ${date}`).join('\n');
  const dateListHtml = missedDates.map(date => `<li>${date}</li>`).join('');

  const subject = 'Reminder: Please submit your timesheet';
  
  const text = `Hello,

This is a friendly reminder that you have not submitted timesheets for the following date(s):

${dateList}

Please log in to the timesheet application and submit your work entries.

Login here: ${appUrl}

Thank you,
Timesheet App Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .dates-list { background-color: #fff; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
    .button { display: inline-block; background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Timesheet Reminder</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>This is a friendly reminder that you have not submitted timesheets for the following date(s):</p>
      <div class="dates-list">
        <ul>
          ${dateListHtml}
        </ul>
      </div>
      <p>Please log in to the timesheet application and submit your work entries.</p>
      <a href="${appUrl}" class="button">Submit Timesheet</a>
    </div>
    <div class="footer">
      <p>Thank you,<br>Timesheet App Team</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

// For testing purposes - allows injecting a mock transporter
function setTransporter(mockTransporter) {
  transporter = mockTransporter;
}

function resetTransporter() {
  transporter = null;
}

module.exports = {
  sendEmail,
  sendTimesheetReminderEmail,
  setTransporter,
  resetTransporter,
  getTransporter
};
