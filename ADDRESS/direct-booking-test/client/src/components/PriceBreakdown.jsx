import React from 'react';

function money(value, currency = 'USD') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));
}

function Row({ label, value, currency, strong }) {
  return (
    <div className={strong ? 'price-row price-row--strong' : 'price-row'}>
      <span>{label}</span>
      <strong>{money(value, currency)}</strong>
    </div>
  );
}

export default function PriceBreakdown({ quote, loading, error }) {
  return (
    <aside className="quote-panel" aria-label="Price quote">
      <p className="eyebrow">Quote</p>
      <h2>Price breakdown</h2>

      {loading ? <div className="quote-state">Getting pricing...</div> : null}
      {error ? <div className="quote-error">{error}</div> : null}
      {!quote && !loading && !error ? (
        <div className="quote-state">Choose dates and guests to calculate the direct booking total.</div>
      ) : null}

      {quote ? (
        <>
          <div className="stay-summary">
            <span>{quote.checkIn} to {quote.checkOut}</span>
            <strong>{quote.nights} nights · {quote.guestsCount} guests</strong>
          </div>
          <div className="price-list">
            <Row label="Accommodation" value={quote.fareAccommodation} currency={quote.currency} />
            <Row label="Cleaning" value={quote.fareCleaning} currency={quote.currency} />
            <Row label="Taxes" value={quote.totalTaxes} currency={quote.currency} />
            <Row label="Subtotal" value={quote.subTotal} currency={quote.currency} />
            <Row label="Total" value={quote.total} currency={quote.currency} strong />
          </div>
          {quote.perNightBreakdown?.length ? (
            <details className="nightly-breakdown">
              <summary>Nightly details</summary>
              {quote.perNightBreakdown.slice(0, 12).map((night, index) => (
                <div className="price-row" key={night.date || index}>
                  <span>{night.date || `Night ${index + 1}`}</span>
                  <strong>{money(night.price || night.basePrice || night.amount, quote.currency)}</strong>
                </div>
              ))}
            </details>
          ) : null}
        </>
      ) : null}
    </aside>
  );
}
