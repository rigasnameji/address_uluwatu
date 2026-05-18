const express = require('express');
const axios = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

// Cache calendar per date-range key for 30 minutes
const calendarCache = new Map();
const CALENDAR_TTL = 30 * 60 * 1000;

// In-flight deduplication per cache key
const inflightMap = new Map();

async function fetchCalendar(from, to) {
  const token = await getToken();
  return axios.get(
    `https://booking.guesty.com/api/listings/${LISTING_ID}/calendar`,
    {
      params: { from, to },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params required' });
    }

    const cacheKey = `${from}:${to}`;
    const cached = calendarCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CALENDAR_TTL) {
      return res.json(cached.data);
    }

    // Deduplicate concurrent fetches for the same range
    if (!inflightMap.has(cacheKey)) {
      const p = fetchCalendar(from, to).then(({ data }) => {
        // Normalize to a map keyed by date for fast frontend lookup
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

    const calendarMap = await inflightMap.get(cacheKey);
    res.json(calendarMap);
  } catch (err) {
    const msg = err?.response?.data?.error?.code || err.message;
    console.error('calendar error', err?.response?.status || '', msg);
    // Serve stale cache on any error
    const stale = calendarCache.get(`${req.query.from}:${req.query.to}`);
    if (stale) {
      console.log('[calendar] Serving stale cache after error');
      return res.json(stale.data);
    }
    const isQuota = err.message?.startsWith('TOKEN_QUOTA_EXHAUSTED');
    res.status(isQuota ? 503 : 500).json({ error: err?.response?.data || err.message });
  }
});

module.exports = router;
