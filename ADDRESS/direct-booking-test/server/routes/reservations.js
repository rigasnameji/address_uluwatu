const express    = require('express');
const axios      = require('axios');
const nodemailer = require('nodemailer');
const { getToken } = require('../lib/guestyAuth');

const router     = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

async function getQuote(quoteId) {
  const token = await getToken();
  const { data } = await axios.get(
    `https://booking.guesty.com/api/reservations/quotes/${quoteId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

function getRatePlanIdFromQuote(quote) {
  return quote?.rates?.ratePlans?.[0]?.ratePlan?._id ||
         quote?.rates?.ratePlans?.[0]?.ratePlanId ||
         quote?.ratePlanId ||
         null;
}

async function createGuestyBookingRequest(quoteId, payload, retries = 2) {
  const token = await getToken();
  try {
    return await axios.post(
      `https://booking.guesty.com/api/reservations/quotes/${quoteId}/inquiry`,
      payload,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    if (err?.response?.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, parseInt(err.response.headers['retry-after'] || '5', 10) * 1000));
      return createGuestyBookingRequest(quoteId, payload, retries - 1);
    }
    throw err;
  }
}

async function sendBookingEmail(booking) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587, secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  await transporter.sendMail({
    from: `"AddressBali Bookings" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `🏡 New Booking — ${booking.checkIn} to ${booking.checkOut}`,
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
    `,
  });
}

router.post('/', async (req, res) => {
  const { quoteId, ratePlanId, checkIn, checkOut, nights, guestsCount, total, currency,
          firstName, lastName, email, phone, message } = req.body;

  if (!quoteId || !firstName || !lastName || !email || !checkIn || !checkOut)
    return res.status(400).json({ error: 'quoteId, firstName, lastName, email, checkIn, checkOut required' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });

  const bookingData = { quoteId, checkIn, checkOut, nights, guestsCount, total, currency,
                        firstName, lastName, email, phone, message };

  let guestyReservation = null;
  let guestyError       = null;

  if (quoteId) {
    try {
      let selectedRatePlanId = ratePlanId;
      if (!selectedRatePlanId) {
        selectedRatePlanId = getRatePlanIdFromQuote(await getQuote(quoteId));
      }
      if (!selectedRatePlanId) {
        return res.status(422).json({ error: 'No rate plan ID available for this quote.' });
      }

      const { data } = await createGuestyBookingRequest(quoteId, {
        ratePlanId: selectedRatePlanId,
        reservedUntil: -1,
        guest: { firstName, lastName, email, phone: phone || '' },
      });
      guestyReservation = data;
    } catch (err) {
      guestyError = err?.response?.data || err.message;
      console.error('Guesty reservation failed:', guestyError);
    }
  }

  try { await sendBookingEmail(bookingData); }
  catch (e) { console.error('Email failed:', e.message); }

  if (guestyReservation?._id) {
    return res.json({
      success: true, source: 'guesty',
      confirmationCode: guestyReservation.confirmationCode,
      reservationId: guestyReservation._id,
      message: 'Booking request received. Our team will confirm shortly.',
    });
  }

  const isPerm = guestyError?.error?.message?.includes('Authorized') ||
                 guestyError?.message?.includes('Authorized');
  const guestyMessage = guestyError?.error?.message || guestyError?.message || null;
  return res.status(isPerm ? 202 : 422).json({
    success: false, pending: isPerm, source: 'email',
    message: isPerm
      ? 'Your booking request has been received. We will confirm within 24 hours.'
      : 'Booking could not be completed automatically. Our team will contact you.',
    details: guestyMessage,
  });
});

module.exports = router;
