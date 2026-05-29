const express = require('express');
const axios   = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router     = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

const calendarCache = new Map();
const CALENDAR_TTL  = 30 * 60 * 1000;
const inflightMap   = new Map();

async function fetchCalendar(from, to) {
  const token = await getToken();
  return axios.get(
    `https://booking.guesty.com/api/listings/${LISTING_ID}/calendar`,
    { params: { from, to }, headers: { Authorization: `Bearer ${token}` } }
  );
}

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to query params required' });

    const cacheKey = `${from}:${to}`;
    const cached = calendarCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CALENDAR_TTL) return res.json(cached.data);

    if (!inflightMap.has(cacheKey)) {
      const p = fetchCalendar(from, to).then(({ data }) => {
        const calendarMap = {};
        for (const day of data) {
          calendarMap[day.date] = {
            status: day.status,       // "available" | "booked" | "unavailable"
            minNights: day.minNights,
            maxNights: day.maxNights,
            cta: day.cta,             // closed to arrival
            ctd: day.ctd,             // closed to departure
          };
        }
        calendarCache.set(cacheKey, { data: calendarMap, at: Date.now() });
        return calendarMap;
      }).finally(() => { inflightMap.delete(cacheKey); });
      inflightMap.set(cacheKey, p);
    }

    res.json(await inflightMap.get(cacheKey));
  } catch (err) {
    const stale = calendarCache.get(`${req.query.from}:${req.query.to}`);
    if (stale) return res.json(stale.data);
    const isQuota = err.message?.startsWith('TOKEN_QUOTA_EXHAUSTED');
    res.status(isQuota ? 503 : 500).json({ error: err?.response?.data || err.message });
  }
});

module.exports = router;

