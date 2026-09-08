const express = require('express');
const axios = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

// Hard ceilings so a slow upstream can never hang the request.
const GUESTY_TIMEOUT_MS = 20000;
const EMAIL_TIMEOUT_MS = 10000;

const parseRecipients = (value, fallback) => {
  const list = String(value || '')
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length ? list : fallback;
};

// ── Guesty reservation creation ──────────────────────────────────────────────
async function createGuestyReservation(payload, retries = 2) {
  const token = await getToken();
  try {
    return await axios.post(
      'https://booking.guesty.com/api/reservations',
      payload,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: GUESTY_TIMEOUT_MS,
      }
    );
  } catch (err) {
    if (err?.response?.status === 429 && retries > 0) {
      const wait = Math.min(parseInt(err.response.headers['retry-after'] || '5', 10), 10) * 1000;
      await new Promise((r) => setTimeout(r, wait));
      return createGuestyReservation(payload, retries - 1);
    }
    throw err;
  }
}

// ── Email notification (Resend HTTP API — Railway blocks outbound SMTP) ──────
async function sendBookingEmail(booking, guestyStatus) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[reservations] RESEND_API_KEY not configured — no notification sent');
    return false;
  }

  const fmt = (n) => (Number.isFinite(Number(n)) ? `$${Number(n).toLocaleString()}` : '—');
  const toEmails = parseRecipients(process.env.NOTIFY_EMAIL, ['addressbaliulu@gmail.com']);

  const banner = guestyStatus === 'created'
    ? '<p style="padding:10px;background:#e8f5e9;color:#1b5e20"><strong>Confirmed in Guesty.</strong></p>'
    : '<p style="padding:10px;background:#fff4e5;color:#8a4b00"><strong>Not created in Guesty — needs manual confirmation.</strong></p>';

  const html = `
    <h2 style="font-family:sans-serif">New Direct Booking Request</h2>
    ${banner}
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px;font-weight:bold">Guest</td><td style="padding:8px">${booking.firstName} ${booking.lastName}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
      <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${booking.phone || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Check-in</td><td style="padding:8px">${booking.checkIn}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Check-out</td><td style="padding:8px">${booking.checkOut}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Nights</td><td style="padding:8px">${booking.nights || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Guests</td><td style="padding:8px">${booking.guestsCount || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;color:#c9a96e;font-size:18px">${fmt(booking.total)} ${booking.currency || ''}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${booking.message || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Quote ID</td><td style="padding:8px;font-family:monospace">${booking.quoteId || '—'}</td></tr>
    </table>
    <p style="color:#888;font-size:12px;font-family:sans-serif">Sent from the AddressBali direct booking engine</p>
  `;

  const send = (from, to) =>
    axios.post(
      'https://api.resend.com/emails',
      {
        from,
        to,
        reply_to: booking.email,
        subject: `New Booking Request — ${booking.firstName} ${booking.lastName} — ${booking.checkIn} to ${booking.checkOut}`,
        html,
      },
      {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: EMAIL_TIMEOUT_MS,
      }
    );

  try {
    const response = await send('Address Bali Villa <info@addressbaliuluwatu.com>', toEmails);
    console.log('[reservations] Booking email sent (custom domain):', response.data.id);
    return true;
  } catch (err) {
    console.warn('[reservations] Custom domain send failed:', JSON.stringify(err?.response?.data || err.message));
    try {
      const fallbackTo = parseRecipients(process.env.FALLBACK_EMAIL, ['rigasnameji@gmail.com']);
      const response = await send('Address Bali Villa <onboarding@resend.dev>', fallbackTo);
      console.log('[reservations] Booking email sent (fallback):', response.data.id);
      return true;
    } catch (fallbackErr) {
      console.error('[reservations] Booking email failed:', JSON.stringify(fallbackErr?.response?.data || fallbackErr.message));
      return false;
    }
  }
}

// ── POST /api/reservations ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { quoteId, ratePlanId, checkIn, checkOut, nights, guestsCount, total, currency,
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
      const payload = {
        quoteId,
        listingId: LISTING_ID,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount: Number(guestsCount),
        guest: { firstName, lastName, email, phone: phone || '' },
      };
      if (ratePlanId) payload.ratePlanId = ratePlanId;

      const { data } = await createGuestyReservation(payload);
      guestyReservation = data;
    } catch (err) {
      guestyError = err?.response?.data || err.message;
      console.error('[reservations] Guesty reservation failed:', JSON.stringify(guestyError));
    }
  }

  // ── Always notify the villa, whatever Guesty did ─────────────────────────
  const emailSent = await sendBookingEmail(bookingData, guestyReservation?._id ? 'created' : 'failed');

  // ── Guesty created the reservation — full success ────────────────────────
  if (guestyReservation?._id) {
    return res.json({
      success: true,
      source: 'guesty',
      confirmationCode: guestyReservation.confirmationCode,
      reservationId: guestyReservation._id,
      message: 'Booking confirmed!',
    });
  }

  // ── Guesty did not create it — the enquiry still reached the villa ────────
  if (emailSent) {
    return res.status(202).json({
      success: false,
      pending: true,
      source: 'email',
      message: 'Your booking request has been received. Our team will confirm it within 24 hours.',
      guestyError: process.env.NODE_ENV === 'development' ? guestyError : undefined,
    });
  }

  // ── Nothing worked — tell the guest to contact the villa directly ────────
  return res.status(502).json({
    success: false,
    pending: false,
    source: 'none',
    message: 'We could not submit your request automatically. Please email addressbaliulu@gmail.com or message us on WhatsApp and we will confirm right away.',
    guestyError: process.env.NODE_ENV === 'development' ? guestyError : undefined,
  });
});

module.exports = router;
