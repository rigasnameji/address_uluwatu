import React, { useState } from 'react';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  accepted: false,
};

export default function BookingForm({ quote, onSubmit, loading, error }) {
  const [form, setForm] = useState(initialForm);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!quote || !form.accepted) return;
    onSubmit({
      ...form,
      quoteId: quote.quoteId,
      ratePlanId: quote.ratePlanId,
      checkIn: quote.checkIn,
      checkOut: quote.checkOut,
      nights: quote.nights,
      guestsCount: quote.guestsCount,
      total: quote.total,
      currency: quote.currency,
    });
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Guest details</p>
          <h2>Request booking</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>First name</span>
          <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required autoComplete="given-name" />
        </label>
        <label>
          <span>Last name</span>
          <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required autoComplete="family-name" />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required autoComplete="email" />
        </label>
        <label>
          <span>Phone</span>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" />
        </label>
      </div>

      <label>
        <span>Message</span>
        <textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Arrival plans, group details, chef requests, celebrations, or anything the team should know." />
      </label>

      <label className="terms-check">
        <input type="checkbox" checked={form.accepted} onChange={(e) => update('accepted', e.target.checked)} />
        <span>I understand this test flow sends a booking request for confirmation.</span>
      </label>

      {error ? <div className="quote-error">{error}</div> : null}
      <button className="button button--primary" type="submit" disabled={!quote || !form.accepted || loading}>
        {loading ? 'Sending...' : 'Send booking request'}
      </button>
    </form>
  );
}
