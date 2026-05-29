const express = require('express');
const axios   = require('axios');
const { getToken } = require('../lib/guestyAuth');

const router     = express.Router();
const LISTING_ID = process.env.GUESTY_LISTING_ID;

let listingCache   = null;
let listingCacheAt = 0;
const LISTING_TTL  = 30 * 60 * 1000;
let inflight       = null;

async function fetchListing() {
  const token = await getToken();
  return axios.get(
    `https://booking.guesty.com/api/listings/${LISTING_ID}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function getListing() {
  if (listingCache && Date.now() - listingCacheAt < LISTING_TTL) return listingCache;
  if (!inflight) {
    inflight = fetchListing().then(({ data }) => {
      const payload = {
        id: data._id, title: data.title, nickname: data.nickname,
        accommodates: data.accommodates, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
        propertyType: data.propertyType, address: data.address,
        picture: data.picture, pictures: data.pictures || [],
        prices: data.prices, amenities: data.amenities || [],
        publicDescription: data.publicDescription || {},
        defaultCheckInTime: data.defaultCheckInTime,
        defaultCheckOutTime: data.defaultCheckOutTime,
        terms: data.terms || {},
      };
      listingCache = payload; listingCacheAt = Date.now();
      return payload;
    }).finally(() => { inflight = null; });
  }
  return inflight;
}

router.get('/', async (req, res) => {
  try {
    res.json(await getListing());
  } catch (err) {
    if (listingCache) return res.json(listingCache); // serve stale
    const isQuota = err.message?.startsWith('TOKEN_QUOTA_EXHAUSTED');
    res.status(isQuota ? 503 : 500).json({ error: err?.response?.data || err.message });
  }
});

module.exports = router;

