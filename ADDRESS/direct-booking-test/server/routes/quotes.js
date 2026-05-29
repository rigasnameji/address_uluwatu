const express = require('express');
const axios   = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router     = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

async function callGuesty(payload, retries = 2) {
  const token = await getToken();
  try {
    return await axios.post(
      'https://booking.guesty.com/api/reservations/quotes',
      payload,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    if (err?.response?.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, parseInt(err.response.headers['retry-after'] || '30', 10) * 1000));
      return callGuesty(payload, retries - 1);
    }
    throw err;
  }
}

router.post('/', async (req, res) => {
  try {
    const { checkIn, checkOut, guestsCount, couponCode } = req.body;
    if (!checkIn || !checkOut || !guestsCount)
      return res.status(400).json({ error: 'checkIn, checkOut, guestsCount required' });

    const payload = {
      listingId: LISTING_ID,
      checkInDateLocalized: checkIn,
      checkOutDateLocalized: checkOut,
      guestsCount: Number(guestsCount),
    };
    if (couponCode) payload.couponCode = couponCode;

    const { data } = await callGuesty(payload);

    const plan = data.rates?.ratePlans?.[0]?.ratePlan;
    if (!plan) return res.status(422).json({ error: 'No rate plan available for these dates' });

    const money  = plan.money;
    const nights = data.rates.ratePlans[0].days?.length || 0;

    // ⚠️  IMPORTANT: money.hostPayout is the correct total — do NOT use any other field
    res.json({
      quoteId:            data._id,
      status:             data.status,
      checkIn, checkOut, nights,
      guestsCount:        data.guestsCount,
      currency:           money.currency,
      fareAccommodation:  money.fareAccommodation,
      fareCleaning:       money.fareCleaning,
      totalFees:          money.totalFees,
      totalTaxes:         money.totalTaxes,
      subTotal:           money.subTotalPrice,
      total:              money.hostPayout,       // ← THE REAL TOTAL
      invoiceItems:       money.invoiceItems || [],
      cancellationPolicy: plan.cancellationPolicy,
      cancellationFee:    plan.cancellationFee,
      promotions:         data.promotions || {},
      coupons:            data.coupons || [],
      ratePlanId:         plan._id,
      perNightBreakdown:  data.rates.ratePlans[0].days || [],
    });
  } catch (err) {
    const status      = err?.response?.status;
    const guestyError = err?.response?.data?.error;
    if (status === 429) return res.status(429).json({ error: 'Too many requests — please wait.' });
    if (guestyError) {
      const flags = guestyError.data?.moreDetails?.notApplicableRatePlans?.[0]?.notApplicable || {};
      let msg = guestyError.message;
      if (flags.minNights)          msg = 'These dates don\'t meet the minimum stay requirement.';
      else if (flags.maxNights)     msg = 'The selected stay exceeds the maximum nights allowed.';
      else if (flags.advanceNotice) msg = 'This listing requires more advance notice.';
      else if (flags.bookingWindow) msg = 'This date is too far in advance to book right now.';
      else if (flags.hardBlocked)   msg = 'These dates are not available for booking.';
      else if (flags.closed)        msg = 'The listing is closed on the selected dates.';
      return res.status(422).json({ error: msg, code: guestyError.code, flags });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

