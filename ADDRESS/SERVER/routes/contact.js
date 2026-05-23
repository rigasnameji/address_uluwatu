const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, checkin, checkout, guests, type, message, include } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const inclusions = Array.isArray(include) ? include.join(', ') : include || '—';
  const toEmail = process.env.NOTIFY_EMAIL || 'addressbaliulu@gmail.com';

  const html = `
    <h2 style="font-family:sans-serif">New Enquiry — Address Bali Villa</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px;font-weight:bold;color:#555">Name</td><td style="padding:8px">${name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Phone</td><td style="padding:8px">${phone || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Enquiry type</td><td style="padding:8px">${type || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Check-in</td><td style="padding:8px">${checkin || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Check-out</td><td style="padding:8px">${checkout || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Guests</td><td style="padding:8px">${guests || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Inclusions</td><td style="padding:8px">${inclusions}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#555">Message</td><td style="padding:8px">${message}</td></tr>
    </table>
    <p style="color:#888;font-size:12px;font-family:sans-serif">Sent from Address Bali Villa website</p>
  `;

  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'Address Bali Villa <onboarding@resend.dev>',
        to: [toEmail],
        reply_to: email,
        subject: `New Enquiry from ${name} — Address Bali Villa`,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Email sent:', response.data.id);
    res.json({ success: true, message: 'Enquiry sent successfully' });
  } catch (err) {
    const errMsg = err?.response?.data?.message || err.message;
    console.error('Resend error:', errMsg);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

module.exports = router;
