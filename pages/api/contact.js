import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const { name, phone, email, destination, travelDate, travelers, message } = req.body;

  // Validate required fields
  if (!name?.trim() || !phone?.trim() || !email?.trim()) {
    return res.status(422).json({ success: false, message: 'Name, phone, and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({ success: false, message: 'Invalid email address.' });
  }

  // HTML email template
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #212529; background: #f8f9fa; margin: 0; padding: 0; }
    .wrap { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0D47A1, #1565C0); padding: 30px 36px; }
    .header h1 { color: #fff; margin: 0; font-size: 1.4rem; }
    .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 0.88rem; }
    .body { padding: 32px 36px; }
    .row { margin-bottom: 18px; }
    .label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; margin-bottom: 4px; }
    .value { font-size: 1rem; color: #212529; padding: 10px 14px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #D4A017; }
    .footer { background: #0d1b2e; padding: 20px 36px; color: rgba(255,255,255,0.5); font-size: 0.8rem; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>&#9992; New Consultation Request</h1>
      <p>Submitted via Al Faran Travel &amp; Tours website contact form</p>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Full Name</div>
        <div class="value">${name}</div>
      </div>
      <div class="row">
        <div class="label">Phone Number</div>
        <div class="value">${phone}</div>
      </div>
      <div class="row">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${email}" style="color:#0D47A1;">${email}</a></div>
      </div>
      ${destination ? `<div class="row"><div class="label">Destination</div><div class="value">${destination}</div></div>` : ''}
      ${travelDate  ? `<div class="row"><div class="label">Travel Date</div><div class="value">${travelDate}</div></div>` : ''}
      ${travelers   ? `<div class="row"><div class="label">No. of Travelers</div><div class="value">${travelers}</div></div>` : ''}
      ${message     ? `<div class="row"><div class="label">Message</div><div class="value" style="white-space:pre-line;">${message}</div></div>` : ''}
    </div>
    <div class="footer">
      Al Faran Travel &amp; Tours &mdash; Your Journey, Our Priority<br>
      0334-3044483 &bull; Gulistan-e-Johar Block 19, Karachi
    </div>
  </div>
</body>
</html>`;

  const textBody = [
    'NEW CONSULTATION REQUEST',
    '========================',
    `Name:        ${name}`,
    `Phone:       ${phone}`,
    `Email:       ${email}`,
    destination ? `Destination: ${destination}` : '',
    travelDate  ? `Travel Date: ${travelDate}`  : '',
    travelers   ? `Travelers:   ${travelers}`   : '',
    message     ? `\nMessage:\n${message}`       : '',
  ].filter(Boolean).join('\n');

  // Nodemailer transporter — SMTP SSL port 465
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   465,
    secure: true,             // SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from:     `"Al Faran Travel & Tours" <${process.env.SMTP_USER}>`,
      to:       process.env.MAIL_TO,
      replyTo:  `"${name}" <${email}>`,
      subject:  `New Consultation Request from ${name} — Al Faran Travel`,
      html:     htmlBody,
      text:     textBody,
    });

    return res.status(200).json({
      success: true,
      message: 'Your consultation request has been received. Our team will contact you within 24 hours.',
    });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({
      success: false,
      message: 'Mail could not be sent. Please call us directly at 0334-3044483.',
    });
  }
}
