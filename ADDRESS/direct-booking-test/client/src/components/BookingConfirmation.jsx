import React from 'react';
import { Link } from 'react-router-dom';

export default function BookingConfirmation({ result }) {
  if (!result) return null;

  return (
    <section className="confirmation-panel">
      <p className="eyebrow">{result.success ? 'Confirmed' : result.pending ? 'Request received' : 'Follow-up needed'}</p>
      <h2>{result.message || 'Your request has been received.'}</h2>
      {result.confirmationCode ? <p>Confirmation code: <strong>{result.confirmationCode}</strong></p> : null}
      {result.reservationId ? <p>Reservation ID: <strong>{result.reservationId}</strong></p> : null}
      <Link className="button button--secondary" to="/booking">Start another enquiry</Link>
    </section>
  );
}

