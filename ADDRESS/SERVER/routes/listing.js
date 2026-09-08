const express = require('express');
const axios = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

// Cache listing data for 30 minutes — it rarely changes
let listingCache = null;
let listingCacheAt = 0;
const LISTING_TTL = 30 * 60 * 1000;

// In-flight promise deduplication — prevents concurrent fetches to Guesty
let inflight = null;

async function fetchListing() {
  const token = await getToken();
  return axios.get(
    `https://booking.guesty.com/api/listings/${LISTING_ID}`,
    { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
  );
}

async function getListing() {
  // Return cached data if still fresh
  if (listingCache && Date.now() - listingCacheAt < LISTING_TTL) {
    return listingCache;
  }
  // Deduplicate concurrent requests — only one fetch at a time
  if (!inflight) {
    inflight = fetchListing().then(({ data }) => {
      const payload = {
        id: data._id,
        title: data.title,
        nickname: data.nickname,
        accommodates: data.accommodates,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        propertyType: data.propertyType,
        address: data.address,
        picture: data.picture,
        pictures: data.pictures || [],
        prices: data.prices,
        amenities: data.amenities || [],
        publicDescription: data.publicDescription || {},
        defaultCheckInTime: data.defaultCheckInTime,
        defaultCheckOutTime: data.defaultCheckOutTime,
        terms: data.terms || {},
      };
      listingCache = payload;
      listingCacheAt = Date.now();
      return payload;
    }).finally(() => { inflight = null; });
  }
  return inflight;
}

router.get('/', async (req, res) => {
  try {
    const payload = await getListing();
    res.json(payload);
  } catch (err) {
    const msg = err?.response?.data?.error?.code || err.message;
    console.error('listing error', err?.response?.status || '', msg);
    // Serve stale cache on any error so the page still loads
    if (listingCache) {
      console.log('[listing] Serving stale cache after error');
      return res.json(listingCache);
    }
    const isQuota = err.message?.startsWith('TOKEN_QUOTA_EXHAUSTED');
    res.status(isQuota ? 503 : 500).json({ error: err?.response?.data || err.message });
  }
});

module.exports = router;
