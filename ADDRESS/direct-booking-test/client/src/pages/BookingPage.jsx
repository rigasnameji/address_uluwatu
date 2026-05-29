import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar.jsx';
import PriceBreakdown from '../components/PriceBreakdown.jsx';
import BookingForm from '../components/BookingForm.jsx';
import BookingConfirmation from '../components/BookingConfirmation.jsx';

const fallbackHero = 'https://a0.muscache.com/im/pictures/hosting/Hosting-51414187/original/d262c698-1dcd-474f-9aa0-3406f7908cc5.jpeg';
const isMockMode = new URLSearchParams(window.location.search).get('mock') === '1';
const mockListing = {
  title: 'Luxury 9BR Bingin Villa | Huge Pool, Walk to Beach',
  accommodates: 20,
  bedrooms: 9,
  bathrooms: 9.5,
  picture: { original: fallbackHero },
};

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function createMockCalendar(fromDate) {
  const data = {};
  for (let i = 0; i < 180; i += 1) {
    const iso = toISO(addDays(fromDate, i));
    data[iso] = {
      status: i % 13 === 0 ? 'booked' : 'available',
      minNights: i % 9 === 0 ? 3 : 2,
      maxNights: 30,
      cta: i % 17 === 0,
      ctd: i % 19 === 0,
    };
  }
  return data;
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'Request failed';
    throw new Error(error);
  }
  return data;
}

function imageFromListing(listing) {
  if (!listing) return fallbackHero;
  if (typeof listing.picture === 'string') return listing.picture;
  return listing.picture?.original || listing.picture?.large || listing.picture?.thumbnail || fallbackHero;
}

export default function BookingPage() {
  const today = useMemo(() => new Date(), []);
  const from = useMemo(() => toISO(today), [today]);
  const to = useMemo(() => toISO(addMonths(today, 12)), [today]);

  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [listing, setListing] = useState(null);
  const [listingError, setListingError] = useState('');
  const [calendar, setCalendar] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState('');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [activeDateField, setActiveDateField] = useState('checkIn');
  const [guestsCount, setGuestsCount] = useState(10);
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const syncHeader = () => setHeaderScrolled(window.scrollY > 12);
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
    return () => window.removeEventListener('scroll', syncHeader);
  }, []);

  useEffect(() => {
    if (isMockMode) {
      setListing(mockListing);
      setGuestsCount(10);
      return undefined;
    }

    let active = true;
    fetch('/api/listing')
      .then(parseResponse)
      .then((data) => {
        if (active) {
          setListing(data);
          if (data.accommodates) setGuestsCount(Math.min(10, Number(data.accommodates)));
        }
      })
      .catch((err) => {
        if (active) setListingError(err.message);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isMockMode) {
      setCalendar(createMockCalendar(today));
      setCalendarLoading(false);
      return undefined;
    }

    let active = true;
    setCalendarLoading(true);
    fetch(`/api/calendar?from=${from}&to=${to}`)
      .then(parseResponse)
      .then((data) => {
        if (active) {
          setCalendar(data || {});
          setCalendarError('');
        }
      })
      .catch((err) => {
        if (active) setCalendarError(err.message);
      })
      .finally(() => {
        if (active) setCalendarLoading(false);
      });
    return () => { active = false; };
  }, [from, to]);

  useEffect(() => {
    setQuote(null);
    setQuoteError('');
    setConfirmation(null);
  }, [dates.checkIn, dates.checkOut, guestsCount, couponCode]);

  const focusDateField = (field) => {
    setActiveDateField(field === 'checkOut' && !dates.checkIn ? 'checkIn' : field);
  };

  const handleQuote = async () => {
    if (!dates.checkIn || !dates.checkOut) {
      setQuoteError('Choose check-in and check-out dates first.');
      return;
    }

    setQuoteLoading(true);
    setQuoteError('');
    try {
      if (isMockMode) {
        const nights = Math.max(1, Math.round((new Date(dates.checkOut) - new Date(dates.checkIn)) / 86400000));
        setQuote({
          quoteId: 'mock-quote',
          status: 'available',
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          nights,
          guestsCount,
          currency: 'USD',
          fareAccommodation: nights * 990,
          fareCleaning: 200,
          totalFees: 0,
          totalTaxes: 0,
          subTotal: nights * 990 + 200,
          total: nights * 990 + 200,
          invoiceItems: [],
          perNightBreakdown: Array.from({ length: nights }, (_, index) => ({
            date: toISO(addDays(new Date(dates.checkIn), index)),
            price: 990,
          })),
        });
        return;
      }

      const data = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guestsCount,
          couponCode: couponCode.trim() || undefined,
        }),
      }).then(parseResponse);
      setQuote(data);
    } catch (err) {
      setQuoteError(err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleReservation = async (payload) => {
    setBookingLoading(true);
    setBookingError('');
    try {
      if (isMockMode) {
        setConfirmation({
          success: false,
          pending: true,
          source: 'mock',
          message: 'Mock booking request received. Real Guesty calls are disabled in preview mode.',
        });
        return;
      }

      const data = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(parseResponse);
      setConfirmation(data);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const maxGuests = Number(listing?.accommodates || 20);
  const hero = imageFromListing(listing);

  if (confirmation) {
    return (
      <main className="booking-page">
        <BookingConfirmation result={confirmation} />
      </main>
    );
  }

  return (
    <main className="booking-page">
      <nav className={headerScrolled ? 'topbar is-scrolled' : 'topbar'} aria-label="Primary navigation">
        <Link className="brand" to="/">AddressBali</Link>
        <div className="topbar-menu" aria-label="Main menu">
          <Link to="/">Home</Link>
          <Link to="/">Villa</Link>
          <Link to="/">Events</Link>
          <Link to="/">Experiences</Link>
          <Link to="/">Location</Link>
          <Link to="/">FAQ</Link>
          <Link to="/">Contact</Link>
        </div>
        <a className="nav-cta" href="#booking-calendar">Book now</a>
      </nav>

      <section className="booking-hero">
        <img src={hero} alt="AddressBali villa" />
        <div>
          <p className="eyebrow">Direct booking</p>
          <h1>
            <span className="booking-heading-line">Check live</span>
            <span className="booking-heading-line">dates and</span>
            <span className="booking-heading-line">book direct</span>
          </h1>
          <p>
            Live availability comes from Guesty.<br />
            Tokens are reused, so restarts<br />
            do not burn daily slots.
          </p>
          {isMockMode ? <div className="notice">Preview mode uses mock listing and calendar data.</div> : null}
        </div>
      </section>

      <section className="booking-shell" id="booking-calendar">
        <div className="booking-main">
          {listingError ? <div className="notice notice--error">{listingError}</div> : null}
          {calendarError ? <div className="notice notice--error">{calendarError}</div> : null}

          <BookingCalendar
            calendar={calendar}
            loading={calendarLoading}
            checkIn={dates.checkIn}
            checkOut={dates.checkOut}
            activeField={activeDateField}
            onChange={setDates}
            onActiveFieldChange={setActiveDateField}
          />

          <BookingForm
            quote={quote}
            onSubmit={handleReservation}
            loading={bookingLoading}
            error={bookingError}
          />
        </div>

        <div className="booking-side">
          <section className="trip-panel">
            <p className="eyebrow">Stay details</p>
            <label className={activeDateField === 'checkIn' ? 'date-field date-field--active' : 'date-field'}>
              <span>Check-in</span>
              <input value={dates.checkIn || 'Select date'} readOnly onClick={() => focusDateField('checkIn')} onFocus={() => focusDateField('checkIn')} />
            </label>
            <label className={activeDateField === 'checkOut' && dates.checkIn ? 'date-field date-field--active' : 'date-field'}>
              <span>Check-out</span>
              <input value={dates.checkOut || 'Select date'} readOnly onClick={() => focusDateField('checkOut')} onFocus={() => focusDateField('checkOut')} />
            </label>
            <label>
              <span>Guests</span>
              <select value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))}>
                {Array.from({ length: maxGuests }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Coupon code</span>
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Optional" />
            </label>
            <button className="button button--primary" type="button" onClick={handleQuote} disabled={quoteLoading || !dates.checkIn || !dates.checkOut}>
              {quoteLoading ? 'Calculating...' : 'Get quote'}
            </button>
          </section>

          <PriceBreakdown quote={quote} loading={quoteLoading} error={quoteError} />
        </div>
      </section>
    </main>
  );
}
