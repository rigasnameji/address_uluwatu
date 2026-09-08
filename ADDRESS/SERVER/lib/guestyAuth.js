/**
 * Guesty token manager — persists to disk so server restarts never waste a
 * token slot. Guesty allows only 5 new tokens per API key per 24 hours.
 *
 * Token lifetime is read from the response header:
 *   x-rate-limit-reset: <unix timestamp of expiry>
 * We refresh 2 minutes before expiry so there is always a valid token in use.
 *
 * Token quota is tracked via:
 *   x-ratelimit-remaining-day: remaining slots
 *   ratelimit-reset: seconds until a used slot regenerates
 */

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

// Persisted next to the server — survives restarts
const TOKEN_FILE       = path.join(__dirname, '../.token-cache.json');
const TOKEN_BLOCK_FILE = path.join(__dirname, '../.token-block.json'); // tracks rate-limit window

// ── Persistence helpers ───────────────────────────────────────────────────────
function loadPersistedToken() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf8');
    const { token, expiresAt } = JSON.parse(raw);
    if (token && expiresAt && Date.now() < expiresAt - 120_000) {
      const mins = Math.round((expiresAt - Date.now()) / 60000);
      console.log(`[auth] Reusing persisted token — valid for ${mins} more minutes`);
      return { token, expiresAt };
    }
  } catch { /* file missing or stale */ }
  return null;
}

function persistToken(token, expiresAt) {
  try { fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, expiresAt }), 'utf8'); }
  catch (e) { console.warn('[auth] Could not persist token:', e.message); }
}

function isTokenQuotaBlocked() {
  try {
    const { blockedUntil } = JSON.parse(fs.readFileSync(TOKEN_BLOCK_FILE, 'utf8'));
    if (Date.now() < blockedUntil) return blockedUntil;
  } catch { /* no block file */ }
  return null;
}

function setTokenQuotaBlock(retryAfterSeconds) {
  const blockedUntil = Date.now() + retryAfterSeconds * 1000;
  const bali = new Date(blockedUntil).toLocaleString('en-US', { timeZone: 'Asia/Makassar', hour12: false });
  console.error(`[auth] ⚠️  All 5 daily token slots used. New tokens available at ${bali} (Bali time)`);
  try { fs.writeFileSync(TOKEN_BLOCK_FILE, JSON.stringify({ blockedUntil }), 'utf8'); }
  catch { /* ignore */ }
}

// ── In-memory state ───────────────────────────────────────────────────────────
let cachedToken    = null;
let tokenExpiresAt = 0;
let tokenInflight  = null;

// Pre-load from disk on startup — avoids any token request on first API call
const persisted = loadPersistedToken();
if (persisted) {
  cachedToken    = persisted.token;
  tokenExpiresAt = persisted.expiresAt;
}

// ── Token refresh ─────────────────────────────────────────────────────────────
async function refreshToken() {
  // Check if we know we're blocked (quota exhausted)
  const blockedUntil = isTokenQuotaBlocked();
  if (blockedUntil) {
    const secsLeft = Math.round((blockedUntil - Date.now()) / 1000);
    throw new Error(`TOKEN_QUOTA_EXHAUSTED: Daily token limit reached. Try again in ${Math.ceil(secsLeft / 3600)} hours.`);
  }

  const params = new URLSearchParams({
    grant_type:    'client_credentials',
    scope:         'booking_engine:api',
    client_id:     process.env.GUESTY_CLIENT_ID,
    client_secret: process.env.GUESTY_CLIENT_SECRET,
  });

  let res;
  try {
    res = await axios.post(
      'https://booking.guesty.com/oauth2/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );
  } catch (err) {
    if (err?.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '86400', 10);
      setTokenQuotaBlock(retryAfter);
      const hours = Math.ceil(retryAfter / 3600);
      throw new Error(`TOKEN_QUOTA_EXHAUSTED: All 5 daily token slots used. Try again in ~${hours} hours.`);
    }
    throw err;
  }

  const token = res.data.access_token;

  // Use the precise expiry from x-rate-limit-reset (Unix seconds → ms)
  const resetHeader = res.headers['x-rate-limit-reset'];
  const expiresAt = resetHeader
    ? Number(resetHeader) * 1000
    : Date.now() + (res.data.expires_in ?? 86400) * 1000;

  const remaining = res.headers['ratelimit-remaining'] ?? '?';
  const limitDay  = res.headers['x-ratelimit-limit-day'] ?? '5';
  console.log(`[auth] New token obtained — expires ${new Date(expiresAt).toISOString()} | token slots remaining today: ${remaining}/${limitDay}`);

  // Clear any stale block file
  try { fs.unlinkSync(TOKEN_BLOCK_FILE); } catch { /* no block file to delete */ }

  persistToken(token, expiresAt);
  return { token, expiresAt };
}

// ── Public API ────────────────────────────────────────────────────────────────
async function getToken() {
  // Return cached token if it has > 2 minutes of life left
  if (cachedToken && Date.now() < tokenExpiresAt - 120_000) {
    return cachedToken;
  }

  // Deduplicate: if a refresh is already in progress, wait for it
  if (!tokenInflight) {
    tokenInflight = refreshToken()
      .then(({ token, expiresAt }) => {
        cachedToken    = token;
        tokenExpiresAt = expiresAt;
      })
      .finally(() => { tokenInflight = null; });
  }

  await tokenInflight;
  return cachedToken;
}

module.exports = { getToken };
