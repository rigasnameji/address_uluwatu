import React, { useMemo, useState } from 'react';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISO(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return next;
}

function diffDays(startISO, endISO) {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  return Math.round((end - start) / 86400000);
}

function defaultDay() {
  return { status: 'unavailable', minNights: 1, maxNights: null, cta: true, ctd: true };
}

function getDay(calendar, iso) {
  return calendar?.[iso] || defaultDay();
}

function monthCells(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  return cells;
}

function isBookedNextDay(calendar, checkIn) {
  const nextISO = toISO(addDays(parseISO(checkIn), 1));
  return getDay(calendar, nextISO).status === 'booked';
}

function isNightAvailable(calendar, iso) {
  return getDay(calendar, iso).status === 'available';
}

export function isCheckoutAllowed(calendar, checkIn, checkOut) {
  if (!checkIn || !checkOut) return false;

  const nights = diffDays(checkIn, checkOut);
  if (nights <= 0) return false;

  const startDay = getDay(calendar, checkIn);
  const checkoutDay = getDay(calendar, checkOut);
  if (checkoutDay.ctd) return false;

  const oneNightGapFill = nights === 1 && isBookedNextDay(calendar, checkIn);
  if (!oneNightGapFill && startDay.minNights && nights < startDay.minNights) return false;
  if (startDay.maxNights && nights > startDay.maxNights) return false;

  for (let i = 0; i < nights; i += 1) {
    const stayNight = toISO(addDays(parseISO(checkIn), i));
    if (!isNightAvailable(calendar, stayNight)) return false;
  }

  return true;
}

export function isCheckInAllowed(calendar, iso) {
  const day = getDay(calendar, iso);
  return day.status === 'available' && !day.cta;
}

export default function BookingCalendar({ calendar, loading, checkIn, checkOut, activeField = 'checkIn', onChange, onActiveFieldChange }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const currentMonth = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), monthOffset);
  const months = [currentMonth, addMonths(currentMonth, 1)];
  const selectingCheckOut = activeField === 'checkOut' && Boolean(checkIn);

  const handleClick = (iso) => {
    if (selectingCheckOut) {
      if (isCheckoutAllowed(calendar, checkIn, iso)) {
        onChange({ checkIn, checkOut: iso });
        onActiveFieldChange?.('checkOut');
      }
      return;
    }

    if (isCheckInAllowed(calendar, iso)) {
      onChange({ checkIn: iso, checkOut: '' });
      onActiveFieldChange?.('checkOut');
    }
  };

  const renderDay = (date) => {
    if (!date) return <span className="calendar-day calendar-day--empty" aria-hidden="true" />;

    const iso = toISO(date);
    const day = getDay(calendar, iso);
    const isPast = iso < toISO(today);
    const isStart = iso === checkIn;
    const isEnd = iso === checkOut;
    const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut;
    const startAllowed = !isPast && isCheckInAllowed(calendar, iso);
    const checkoutAllowed = checkIn && !isPast && isCheckoutAllowed(calendar, checkIn, iso);
    const clickable = Boolean(selectingCheckOut ? checkoutAllowed : startAllowed);
    const disabledReason = day.status !== 'available' ? day.status : day.cta ? 'no check-in' : '';

    return (
      <button
        key={iso}
        type="button"
        className={[
          'calendar-day',
          `calendar-day--${day.status || 'unavailable'}`,
          day.cta ? 'calendar-day--cta' : '',
          day.ctd ? 'calendar-day--ctd' : '',
          isStart ? 'calendar-day--selected-start' : '',
          isEnd ? 'calendar-day--selected-end' : '',
          inRange ? 'calendar-day--range' : '',
        ].filter(Boolean).join(' ')}
        disabled={!clickable}
        onClick={() => handleClick(iso)}
        aria-label={`${iso}${disabledReason ? `, ${disabledReason}` : ''}`}
      >
        <span>{date.getDate()}</span>
        {day.minNights > 1 && day.status === 'available' ? <small>{day.minNights}n</small> : null}
      </button>
    );
  };

  return (
    <section className="calendar-panel" aria-label="Booking calendar">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Availability</p>
          <h2>Select dates</h2>
        </div>
        <div className="month-controls">
          <button type="button" onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))} disabled={monthOffset === 0}>Prev</button>
          <button type="button" onClick={() => setMonthOffset(monthOffset + 1)}>Next</button>
        </div>
      </div>

      {loading ? <div className="calendar-loading">Loading live availability...</div> : null}

      <div className="months">
        {months.map((month) => (
          <div className="month" key={toISO(month)}>
            <h3>{monthNames[month.getMonth()]} {month.getFullYear()}</h3>
            <div className="weekdays">
              {dayNames.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-grid">
              {monthCells(month).map((date, index) => date ? renderDay(date) : <span className="calendar-day calendar-day--empty" key={`empty-${index}`} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="calendar-legend" aria-label="Calendar legend">
        <span><i className="legend-dot legend-dot--available" /> Available</span>
        <span><i className="legend-dot legend-dot--booked" /> Booked</span>
        <span><i className="legend-dot legend-dot--selected" /> Selected</span>
        <span><i className="legend-dot legend-dot--blocked" /> Closed to arrival/departure</span>
      </div>
    </section>
  );
}
