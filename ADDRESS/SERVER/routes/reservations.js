const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { getToken } = require('../lib/guestyAuth');

const router = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

// ── Guesty reservation creation ──────────────────────────────────────────────
async function createGuestyReservation(payload, retries = 2) {
  const token = await getToken();
  try {
    return await axios.post(
      'https://booking.guesty.com/api/reservations',
      payload,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    if (err?.response?.status === 429 && retries > 0) {
      const wait = parseInt(err.response.headers['retry-after'] || '5', 10) * 1000;
      await new Promise(r => setTimeout(r, wait));
      return createGuestyReservation(payload, retries - 1);
    }
    throw err;
  }
}

// ── Email notification fallback ───────────────────────────────────────────────
async function sendBookingEmail(booking) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  await transporter.sendMail({
    from: `"AddressBali Bookings" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `🏡 New Booking Request — ${booking.checkIn} to ${booking.checkOut}`,
    html: `
      <h2>New Direct Booking Request</h2>
      <table style="border-collapse:collapse;font-family:sans-serif">
        <tr><td style="padding:8px;font-weight:bold">Guest</td><td style="padding:8px">${booking.firstName} ${booking.lastName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${booking.phone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Check-in</td><td style="padding:8px">${booking.checkIn}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Check-out</td><td style="padding:8px">${booking.checkOut}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Nights</td><td style="padding:8px">${booking.nights}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Guests</td><td style="padding:8px">${booking.guestsCount}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;color:#c9a96e;font-size:18px">${fmt(booking.total)} ${booking.currency}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${booking.message || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Quote ID</td><td style="padding:8px;font-family:monospace">${booking.quoteId}</td></tr>
      </table>
      <p style="color:#888;font-size:12px">Sent from AddressBali direct booking engine</p>
    `,
  });
}

// ── POST /api/reservations ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { quoteId, checkIn, checkOut, nights, guestsCount, total, currency,
          firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'firstName, lastName, email, checkIn, checkOut required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const bookingData = {
    quoteId, checkIn, checkOut, nights, guestsCount, total, currency,
    firstName, lastName, email, phone, message,
  };

  // ── Try Guesty first ──────────────────────────────────────────────────────
  let guestyReservation = null;
  let guestyError = null;

  if (quoteId) {
    try {
      const { data } = await createGuestyReservation({
        quoteId,
        listingId: LISTING_ID,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount: Number(guestsCount),
        guest: { firstName, lastName, email, phone: phone || '' },
      });
      guestyReservation = data;
    } catch (err) {
      guestyError = err?.response?.data || err.message;
      console.error('Guesty reservation failed:', guestyError);
    }
  }

  // ── Always send email notification ───────────────────────────────────────
  try {
    await sendBookingEmail(bookingData);
  } catch (emailErr) {
    console.error('Email notification failed:', emailErr.message);
  }

  // ── If Guesty created the reservation — full success ─────────────────────
  if (guestyReservation?._id) {
    return res.json({
      success: true,
      source: 'guesty',
      confirmationCode: guestyReservation.confirmationCode,
      reservationId: guestyReservation._id,
      message: 'Booking confirmed!',
    });
  }

  // ── Guesty failed — return "pending" so owner can manually confirm ────────
  const isPerm = guestyError?.error?.message?.includes('Authorized') ||
                 guestyError?.message?.includes('Authorized');

  return res.status(isPerm ? 202 : 422).json({
    success: false,
    pending: isPerm,
    source: 'email',
    message: isPerm
      ? 'Your booking request has been received. We will confirm within 24 hours.'
      : 'Booking could not be completed automatically. Our team will contact you.',
    guestyError: process.env.NODE_ENV === 'development' ? guestyError : undefined,
  });
});

module.exports = router;
