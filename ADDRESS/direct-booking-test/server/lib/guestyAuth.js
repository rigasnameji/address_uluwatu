const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const TOKEN_FILE       = path.join(__dirname, '../.token-cache.json');
const TOKEN_BLOCK_FILE = path.join(__dirname, '../.token-block.json');

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
  console.error(`[auth] ⚠️  All 5 daily token slots used. Blocked until ${new Date(blockedUntil).toISOString()}`);
  try { fs.writeFileSync(TOKEN_BLOCK_FILE, JSON.stringify({ blockedUntil }), 'utf8'); }
  catch { /* ignore */ }
}

let cachedToken    = null;
let tokenExpiresAt = 0;
let tokenInflight  = null;

// Pre-load from disk on startup
const persisted = loadPersistedToken();
if (persisted) {
  cachedToken    = persisted.token;
  tokenExpiresAt = persisted.expiresAt;
}

async function refreshToken() {
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
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  } catch (err) {
    if (err?.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '86400', 10);
      setTokenQuotaBlock(retryAfter);
      throw new Error(`TOKEN_QUOTA_EXHAUSTED: All 5 daily token slots used. Try again in ~${Math.ceil(retryAfter / 3600)} hours.`);
    }
    throw err;
  }

  const token = res.data.access_token;
  const resetHeader = res.headers['x-rate-limit-reset'];
  const expiresAt = resetHeader
    ? Number(resetHeader) * 1000
    : Date.now() + (res.data.expires_in ?? 86400) * 1000;

  console.log(`[auth] New token — expires ${new Date(expiresAt).toISOString()}`);

  try { fs.unlinkSync(TOKEN_BLOCK_FILE); } catch { /* ok */ }
  persistToken(token, expiresAt);
  return { token, expiresAt };
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 120_000) return cachedToken;

  if (!tokenInflight) {
    tokenInflight = refreshToken()
      .then(({ token, expiresAt }) => { cachedToken = token; tokenExpiresAt = expiresAt; })
      .finally(() => { tokenInflight = null; });
  }

  await tokenInflight;
  return cachedToken;
}

module.exports = { getToken };

