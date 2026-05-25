// Set playback speed on all autoplay looping videos
document.querySelectorAll("video[autoplay]").forEach((v) => {
  const setRate = () => { v.playbackRate = 0.8; };
  setRate();
  v.addEventListener("loadedmetadata", setRate);
  v.addEventListener("play", setRate);
  v.addEventListener("seeking", setRate);
});

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const bookingForms = document.querySelectorAll("[data-booking-form]");
const conciergeForms = document.querySelectorAll("[data-concierge-form]");
const navLinks = document.querySelectorAll(".main-nav a, .site-footer a, .text-link");
const tourEmbed = document.querySelector("[data-tour-embed]");
const tourLinks = document.querySelectorAll("[data-tour-link]");
const videoShells = document.querySelectorAll("[data-video-shell]");
const CONCIERGE_EMAIL = "addressbaliulu@gmail.com";

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const setDateMinimums = (form) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toInputValue = (date) => date.toISOString().split("T")[0];
  const checkin = form.querySelector('input[name="checkin"]');
  const checkout = form.querySelector('input[name="checkout"]');

  if (checkin) {
    checkin.min = toInputValue(today);
  }

  if (checkout) {
    checkout.min = toInputValue(tomorrow);
  }

  checkin?.addEventListener("change", () => {
    if (!checkout) return;
    const selectedArrival = new Date(`${checkin.value}T00:00:00`);
    selectedArrival.setDate(selectedArrival.getDate() + 1);
    checkout.min = toInputValue(selectedArrival);

    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = checkout.min;
    }
  });
};

const buildBookingUrl = (form) => {
  const data = new FormData(form);
  const params = new URLSearchParams();
  const checkin = data.get("checkin");
  const checkout = data.get("checkout");
  const guests = data.get("guests");
  const stayType = data.get("stayType");

  if (stayType) params.set("eventType", stayType);
  if (checkin) params.set("checkin", checkin);
  if (checkout) params.set("checkout", checkout);
  if (guests) params.set("guests", guests);
  params.set("message", "I would like to check availability and pricing for Address Bali Villa.");

  return `contact-concierge.html?${params.toString()}`;
};

const getCheckedValues = (form, name) =>
  Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);

const slugifyValue = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fillConciergeFormFromUrl = (form) => {
  const params = new URLSearchParams(window.location.search);
  const eventType = params.get("eventType");
  const message = params.get("message");
  const guests = params.get("guests");
  const checkin = params.get("checkin");
  const checkout = params.get("checkout");
  const name = params.get("name");
  const email = params.get("email");
  const phone = params.get("phone");

  if (eventType) {
    const normalizedType = eventType.toLowerCase();
    const matchingType = Array.from(form.querySelectorAll('input[name="type"]')).find((input) =>
      normalizedType.includes(input.value.split(" ")[0].toLowerCase()),
    );

    if (matchingType) {
      matchingType.checked = true;
    }
  }

  params.getAll("include").forEach((value) => {
    const matchingOption = Array.from(form.querySelectorAll('input[name="include"]')).find(
      (input) => input.value === value || slugifyValue(input.value) === value || slugifyValue(input.value).includes(value),
    );
    if (matchingOption) {
      matchingOption.checked = true;
    }
  });

  if (message) {
    const messageInput = form.querySelector('textarea[name="message"]');
    messageInput.value = message;
  }

  if (name) {
    const nameInput = form.querySelector('input[name="name"]');
    if (nameInput) nameInput.value = name;
  }

  if (email) {
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) emailInput.value = email;
  }

  if (phone) {
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) phoneInput.value = phone;
  }

  if (guests) {
    const guestSelect = form.querySelector('select[name="guests"]');
    const matchingGuestOption = Array.from(guestSelect?.options || []).find(
      (option) => option.value === guests || option.textContent.includes(guests) || (guests === "20" && option.textContent.includes("18+2")),
    );

    if (matchingGuestOption) {
      guestSelect.value = matchingGuestOption.value;
    }
  }

  if (checkin) {
    const checkinInput = form.querySelector('input[name="checkin"]');
    if (checkinInput) checkinInput.value = checkin;
  }

  if (checkout) {
    const checkoutInput = form.querySelector('input[name="checkout"]');
    if (checkoutInput) checkoutInput.value = checkout;
  }
};

const buildConciergeEmailUrl = (form) => {
  const data = new FormData(form);
  const lines = [
    "Hi Kristaps,",
    "",
    "A new Address Bali Villa enquiry was captured from the concierge form.",
    "",
    `Name: ${data.get("name") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `WhatsApp / phone: ${data.get("phone") || ""}`,
    `Enquiry type: ${data.get("type") || ""}`,
    `Guests: ${data.get("guests") || ""}`,
    `Arrival: ${data.get("checkin") || ""}`,
    `Departure: ${data.get("checkout") || ""}`,
    `Concierge interests: ${getCheckedValues(form, "include").join(", ") || ""}`,
    "",
    "Message:",
    data.get("message") || "",
  ];

  const params = new URLSearchParams({
    subject: "Address Bali Villa enquiry",
    body: lines.join("\n"),
  });

  return `mailto:${CONCIERGE_EMAIL}?${params.toString()}`;
};

const setConciergeFormStatus = (form, type, message, isHtml = false) => {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.className = `form-status is-${type}`;
  if (isHtml) {
    status.innerHTML = message;
  } else {
    status.textContent = message;
  }
};

const setConciergeFormSubmitting = (form, isSubmitting) => {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Sending enquiry..." : "Send Enquiry";
};

const submitConciergeForm = async (form) => {
  const formData = new FormData(form);
  const body = {};
  formData.forEach((value, key) => {
    if (body[key]) {
      body[key] = [].concat(body[key], value);
    } else {
      body[key] = value;
    }
  });
  body._url = window.location.href;

  const apiBase = (window.location.protocol === "file:" || window.location.hostname === "localhost")
    ? "http://localhost:3001"
    : "https://addressuluwatu-production.up.railway.app";

  const response = await fetch(`${apiBase}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const message = payload?.error || "Unable to send the enquiry right now.";
    throw new Error(message);
  }
};

const initTourPreview = () => {
  if (!tourEmbed && !tourLinks.length) return;

  if (tourEmbed) {
    tourEmbed.src = "tour/index.html";
  }

  tourLinks.forEach((link) => {
    link.href = "tour/index.html";
  });
};

const initVideoShells = () => {
  videoShells.forEach((shell) => {
    const video = shell.querySelector("[data-video-player]");
    const playButton = shell.querySelector("[data-video-play]");

    if (!video || !playButton) return;

    const syncState = () => {
      shell.classList.toggle("is-playing", !video.paused && !video.ended);
      shell.classList.toggle("is-started", video.currentTime > 0 || video.ended);
    };

    playButton.addEventListener("click", async () => {
      try {
        await video.play();
      } catch {
        syncState();
      }
    });

    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);
    video.addEventListener("seeked", syncState);
    syncState();
  });
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
initTourPreview();
initVideoShells();

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
    }

    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

bookingForms.forEach((form) => {
  setDateMinimums(form);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.open(buildBookingUrl(form), "_blank", "noopener,noreferrer");
  });
});

conciergeForms.forEach((form) => {
  setDateMinimums(form);
  fillConciergeFormFromUrl(form);
  // Auto-scroll to form if user arrived via a redirect from another page
  if (window.location.search && document.referrer) {
    setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    setConciergeFormSubmitting(form, true);
    setConciergeFormStatus(form, "loading", "Sending your enquiry to the concierge inbox...");

    try {
      await submitConciergeForm(form);
      form.reset();
      setDateMinimums(form);
      setConciergeFormStatus(
        form,
        "success",
        "Your enquiry has been sent to the villa team. You should hear back within a few hours.",
      );
    } catch (error) {
      const isFilePage = window.location.protocol === "file:";
      const fallbackUrl = buildConciergeEmailUrl(form);

      if (isFilePage) {
        setConciergeFormStatus(
          form,
          "warning",
          `Automatic sending is blocked while this page is opened as a raw file. <a href="${fallbackUrl}">Open the email fallback</a>, or serve the site over http to use the live form.`,
          true,
        );
      } else {
        const message = error instanceof Error ? error.message : "Unable to send the enquiry right now.";
        setConciergeFormStatus(
          form,
          "error",
          `${message} If this keeps happening, <a href="${fallbackUrl}">use the email fallback</a>.`,
          true,
        );
      }
    } finally {
      setConciergeFormSubmitting(form, false);
    }
  });
});

const initDirectBooking = () => {
  const root = document.querySelector("[data-direct-booking]");
  if (!root) return;

  if (!root.querySelector("[data-calendar-months]")) {
    root.innerHTML = `
      <div class="direct-booking-heading">
        <p class="eyebrow">Book direct</p>
        <h2>Check Live <span class="editorial-word">Availability</span></h2>
        <p>
          Select dates, confirm the direct total, and send your booking request through the villa's live Guesty
          connection.
        </p>
      </div>

      <div class="direct-booking-layout">
        <div class="direct-calendar-panel" id="direct-calendar-panel" aria-label="Availability calendar">
          <div class="direct-panel-heading">
            <div>
              <p class="section-kicker"><span>01</span> Availability</p>
              <h3 data-calendar-title>Select dates</h3>
            </div>
            <div class="direct-month-controls" aria-label="Calendar month controls">
              <button type="button" data-calendar-prev>Prev</button>
              <button type="button" data-calendar-next>Next</button>
            </div>
          </div>

          <div class="direct-calendar-status" data-calendar-status aria-live="polite">Loading live availability...</div>
          <div class="direct-months" data-calendar-months></div>
          <div class="direct-calendar-legend" aria-label="Calendar legend">
            <span><i class="legend-dot legend-dot-available"></i>Available</span>
            <span><i class="legend-dot legend-dot-booked"></i>Booked</span>
            <span><i class="legend-dot legend-dot-selected"></i>Selected</span>
            <span><i class="legend-dot legend-dot-blocked"></i>Closed</span>
          </div>
        </div>

        <form class="direct-trip-panel" data-direct-trip-form>
          <p class="section-kicker"><span>02</span> Stay details</p>
          <label class="direct-date-field" data-date-field="checkIn">
            <span>Check-in</span>
            <input type="text" name="checkIn" value="Select date" data-date-input="checkIn" readonly />
          </label>
          <label class="direct-date-field" data-date-field="checkOut">
            <span>Check-out</span>
            <input type="text" name="checkOut" value="Select date" data-date-input="checkOut" readonly />
          </label>
          <label>
            <span>Guests</span>
            <select name="guestsCount" aria-label="Guests"></select>
          </label>
          <label>
            <span>Coupon code</span>
            <input type="text" name="couponCode" placeholder="Optional" autocomplete="off" />
          </label>
          <button class="button button-primary" type="submit" data-quote-button disabled>Get Quote</button>
        </form>

        <div class="direct-quote-guest-grid" aria-label="Quote and guest details">
          <div class="direct-price-panel" data-price-panel aria-live="polite">
            <p class="section-kicker"><span>03</span> Quote</p>
            <h3>Price breakdown</h3>
            <p class="direct-empty-state">Choose dates and guests to calculate the direct booking total.</p>
          </div>

          <form class="direct-guest-form" data-guest-form hidden>
            <p class="section-kicker"><span>04</span> Guest details</p>
            <div class="direct-form-grid">
              <label>
                <span>First name</span>
                <input type="text" name="firstName" autocomplete="given-name" required />
              </label>
              <label>
                <span>Last name</span>
                <input type="text" name="lastName" autocomplete="family-name" required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" autocomplete="email" required />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" name="phone" autocomplete="tel" />
              </label>
            </div>
            <label>
              <span>Message</span>
              <textarea name="message" placeholder="Arrival plans, group details, chef requests, celebrations, or anything the team should know."></textarea>
            </label>
            <label class="terms-check">
              <input type="checkbox" name="accepted" required />
              <span>I understand this sends a booking request for confirmation.</span>
            </label>
            <div class="direct-form-error" data-booking-error hidden></div>
            <button class="button button-primary" type="submit" data-booking-button>Send Booking Request</button>
          </form>
        </div>

        <div class="direct-confirmation" data-booking-confirmation hidden></div>
      </div>
    `;
  }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isMockMode = new URLSearchParams(window.location.search).get("mock") === "1";
  const apiBase = ( window.location.protocol === "file:" || window.location.hostname === "localhost") ? "http://localhost:3001" : "https://addressuluwatu-production.up.railway.app";

  const monthsNode = root.querySelector("[data-calendar-months]");
  const statusNode = root.querySelector("[data-calendar-status]");
  const prevButton = root.querySelector("[data-calendar-prev]");
  const nextButton = root.querySelector("[data-calendar-next]");
  const tripForm = root.querySelector("[data-direct-trip-form]");
  const guestForm = root.querySelector("[data-guest-form]");
  const pricePanel = root.querySelector("[data-price-panel]");
  const confirmationPanel = root.querySelector("[data-booking-confirmation]");
  const bookingErrorNode = root.querySelector("[data-booking-error]");
  const quoteButton = root.querySelector("[data-quote-button]");
  const bookingButton = root.querySelector("[data-booking-button]");
  const guestsSelect = tripForm?.querySelector('select[name="guestsCount"]');
  const couponInput = tripForm?.querySelector('input[name="couponCode"]');
  const checkInInput = tripForm?.querySelector('input[name="checkIn"]');
  const checkOutInput = tripForm?.querySelector('input[name="checkOut"]');
  const checkInField = tripForm?.querySelector('[data-date-field="checkIn"]');
  const checkOutField = tripForm?.querySelector('[data-date-field="checkOut"]');

  const today = new Date();
  const state = {
    today,
    todayIso: "",
    from: "",
    to: "",
    maxGuests: 20,
    monthOffset: 0,
    calendar: {},
    calendarLoading: true,
    calendarError: "",
    fallbackMode: false,
    checkIn: "",
    checkOut: "",
    activeDateField: "checkIn",
    guestsCount: 10,
    couponCode: "",
    quote: null,
    quoteLoading: false,
    quoteError: "",
    bookingLoading: false,
    bookingError: "",
    confirmation: null,
  };

  const toISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseISO = (iso) => {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);

  const diffDays = (startISO, endISO) => Math.round((parseISO(endISO) - parseISO(startISO)) / 86400000);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const money = (value, currency = "USD") => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const parseResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = typeof data.error === "string" ? data.error : data.error?.message || data.message || "Request failed";
      const requestError = new Error(error);
      requestError.status = response.status;
      throw requestError;
    }
    return data;
  };

  const apiFetch = (path, options) => fetch(`${apiBase}${path}`, options).then(parseResponse);
  const isRecoverableApiError = (error) =>
    error?.name === "TypeError" ||
    /failed to fetch|networkerror|load failed/i.test(error?.message || "") ||
    Number(error?.status) >= 500;

  const defaultDay = () => ({ status: "unavailable", minNights: 1, maxNights: null, cta: true, ctd: true });

  const getDay = (iso) => state.calendar?.[iso] || defaultDay();

  const isCheckInAllowed = (iso) => {
    const day = getDay(iso);
    return iso >= state.todayIso && day.status === "available" && !day.cta;
  };

  const isBookedNextDay = (checkIn) => {
    const nextISO = toISO(addDays(parseISO(checkIn), 1));
    return getDay(nextISO).status === "booked";
  };

  const isCheckoutAllowed = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return false;
    const nights = diffDays(checkIn, checkOut);
    if (nights <= 0) return false;

    const startDay = getDay(checkIn);
    const checkoutDay = getDay(checkOut);
    if (checkoutDay.ctd) return false;

    const oneNightGapFill = nights === 1 && isBookedNextDay(checkIn);
    if (!oneNightGapFill && startDay.minNights && nights < startDay.minNights) return false;
    if (startDay.maxNights && nights > startDay.maxNights) return false;

    for (let i = 0; i < nights; i += 1) {
      const stayNight = toISO(addDays(parseISO(checkIn), i));
      if (getDay(stayNight).status !== "available") return false;
    }

    return true;
  };

  const monthCells = (monthDate) => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }
    return cells;
  };

  const createMockCalendar = (fromDate) => {
    const data = {};
    for (let i = 0; i < 365; i += 1) {
      const iso = toISO(addDays(fromDate, i));
      data[iso] = {
        status: i % 13 === 0 ? "booked" : "available",
        minNights: i % 9 === 0 ? 3 : 2,
        maxNights: 30,
        cta: i % 17 === 0,
        ctd: i % 19 === 0,
      };
    }
    return data;
  };

  const createEnquiryCalendar = (fromDate) => {
    const data = {};
    for (let i = 0; i < 365; i += 1) {
      const iso = toISO(addDays(fromDate, i));
      data[iso] = {
        status: "available",
        minNights: 1,
        maxNights: 30,
        cta: false,
        ctd: false,
      };
    }
    return data;
  };

  const createEnquiryQuote = () => {
    const nights = Math.max(1, diffDays(state.checkIn, state.checkOut));
    return {
      source: "enquiry",
      quoteId: "concierge-enquiry",
      status: "enquiry",
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      nights,
      guestsCount: state.guestsCount,
      currency: "USD",
      fareAccommodation: null,
      fareCleaning: null,
      totalTaxes: null,
      subTotal: null,
      total: null,
      perNightBreakdown: [],
    };
  };

  const buildDirectBookingFallbackUrl = (payload) => {
    const params = new URLSearchParams();
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim();
    const lines = [
      "I would like to enquire about these preferred booking dates.",
      "",
      `Arrival: ${payload.checkIn || ""}`,
      `Departure: ${payload.checkOut || ""}`,
      `Nights: ${payload.nights || ""}`,
      `Guests: ${payload.guestsCount || ""}`,
      payload.total ? `Quoted total: ${money(payload.total, payload.currency)}` : "Live pricing was unavailable on the site.",
      "",
      "Guest details:",
      `Name: ${fullName}`,
      `Email: ${payload.email || ""}`,
      `Phone: ${payload.phone || ""}`,
      "",
      "Message:",
      payload.message || "",
    ];

    params.set("eventType", "Private villa stay");
    if (fullName) params.set("name", fullName);
    if (payload.email) params.set("email", payload.email);
    if (payload.phone) params.set("phone", payload.phone);
    if (payload.checkIn) params.set("checkin", payload.checkIn);
    if (payload.checkOut) params.set("checkout", payload.checkOut);
    if (payload.guestsCount) params.set("guests", String(payload.guestsCount));
    params.set("message", lines.join("\n"));
    return `contact-concierge.html?${params.toString()}`;
  };

  const clearQuote = () => {
    state.quote = null;
    state.quoteError = "";
    state.bookingError = "";
    state.confirmation = null;
  };

  const setActiveDateField = (field) => {
    state.activeDateField = field === "checkOut" && !state.checkIn ? "checkIn" : field;
  };

  const renderGuests = () => {
    if (!guestsSelect) return;
    const maxGuests = Math.max(1, Number(state.maxGuests || 20));
    state.guestsCount = Math.min(Math.max(1, Number(state.guestsCount || 1)), maxGuests);
    guestsSelect.innerHTML = "";

    for (let count = 1; count <= maxGuests; count += 1) {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = `${count} ${count === 1 ? "guest" : "guests"}`;
      guestsSelect.appendChild(option);
    }

    guestsSelect.value = String(state.guestsCount);
  };

  const renderTrip = () => {
    if (checkInInput) checkInInput.value = state.checkIn || "Select date";
    if (checkOutInput) checkOutInput.value = state.checkOut || "Select date";
    checkInField?.classList.toggle("is-active", state.activeDateField === "checkIn");
    checkOutField?.classList.toggle("is-active", state.activeDateField === "checkOut" && Boolean(state.checkIn));
    if (quoteButton) {
      quoteButton.disabled = state.quoteLoading || !state.checkIn || !state.checkOut;
      quoteButton.textContent = state.quoteLoading ? "Calculating..." : "Get Quote";
    }
  };

  const renderStatus = () => {
    if (!statusNode) return;

    if (state.calendarLoading) {
      statusNode.hidden = false;
      statusNode.classList.remove("is-error");
      statusNode.textContent = "Loading live availability...";
      return;
    }

    if (state.calendarError) {
      statusNode.hidden = false;
      statusNode.classList.add("is-error");
      statusNode.textContent = state.calendarError;
      return;
    }

    statusNode.hidden = true;
    statusNode.textContent = "";
  };

  const renderCalendar = () => {
    if (!monthsNode) return;

    monthsNode.innerHTML = "";
    if (prevButton) prevButton.disabled = state.monthOffset === 0;

    const currentMonth = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), state.monthOffset);
    const months = [currentMonth, addMonths(currentMonth, 1)];

    months.forEach((month) => {
      const monthNode = document.createElement("div");
      monthNode.className = "direct-month";

      const title = document.createElement("h4");
      title.textContent = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
      monthNode.appendChild(title);

      const weekdays = document.createElement("div");
      weekdays.className = "direct-weekdays";
      dayNames.forEach((dayName) => {
        const dayNode = document.createElement("span");
        dayNode.textContent = dayName;
        weekdays.appendChild(dayNode);
      });
      monthNode.appendChild(weekdays);

      const grid = document.createElement("div");
      grid.className = "direct-calendar-grid";

      monthCells(month).forEach((date, index) => {
        if (!date) {
          const empty = document.createElement("span");
          empty.className = "direct-calendar-day direct-calendar-day-empty";
          empty.setAttribute("aria-hidden", "true");
          empty.dataset.emptyIndex = String(index);
          grid.appendChild(empty);
          return;
        }

        const iso = toISO(date);
        const day = getDay(iso);
        const isStart = iso === state.checkIn;
        const isEnd = iso === state.checkOut;
        const inRange = state.checkIn && state.checkOut && iso > state.checkIn && iso < state.checkOut;
        const selectingCheckOut = state.activeDateField === "checkOut" && Boolean(state.checkIn);
        const startAllowed = !state.calendarLoading && isCheckInAllowed(iso);
        const checkoutAllowed = state.checkIn && !state.calendarLoading && isCheckoutAllowed(state.checkIn, iso);
        const clickable = Boolean(selectingCheckOut ? checkoutAllowed : startAllowed);

        const button = document.createElement("button");
        button.type = "button";
        button.className = [
          "direct-calendar-day",
          `direct-calendar-day-${day.status || "unavailable"}`,
          day.cta ? "direct-calendar-day-cta" : "",
          day.ctd ? "direct-calendar-day-ctd" : "",
          isStart ? "direct-calendar-day-selected-start" : "",
          isEnd ? "direct-calendar-day-selected-end" : "",
          inRange ? "direct-calendar-day-range" : "",
        ]
          .filter(Boolean)
          .join(" ");
        button.disabled = !clickable;
        button.setAttribute("aria-label", `${iso}${day.status !== "available" ? `, ${day.status}` : ""}`);
        button.innerHTML = `<span>${date.getDate()}</span>${
          day.minNights > 1 && day.status === "available" ? `<small>${day.minNights}n</small>` : ""
        }`;
        button.addEventListener("click", () => {
          if (selectingCheckOut) {
            if (isCheckoutAllowed(state.checkIn, iso)) {
              state.checkOut = iso;
              clearQuote();
            }
          } else if (isCheckInAllowed(iso)) {
            state.checkIn = iso;
            state.checkOut = "";
            state.activeDateField = "checkOut";
            clearQuote();
          }

          renderAll();
        });
        grid.appendChild(button);
      });

      monthNode.appendChild(grid);
      monthsNode.appendChild(monthNode);
    });
  };

  const priceRow = (label, value, currency, strong = false) => `
    <div class="${strong ? "direct-price-row direct-price-row-strong" : "direct-price-row"}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(money(value, currency))}</strong>
    </div>
  `;

  const renderPrice = () => {
    if (!pricePanel) return;

    const heading = `
      <p class="section-kicker"><span>03</span> Quote</p>
      <h3>Price breakdown</h3>
    `;

    if (state.quoteLoading) {
      pricePanel.innerHTML = `${heading}<p class="direct-empty-state">Getting pricing...</p>`;
      return;
    }

    if (state.quoteError) {
      pricePanel.innerHTML = `${heading}<p class="direct-error-state">${escapeHtml(state.quoteError)}</p>`;
      return;
    }

    if (!state.quote) {
      pricePanel.innerHTML = `${heading}<p class="direct-empty-state">Choose dates and guests to calculate the direct booking total.</p>`;
      return;
    }

    const quote = state.quote;
    const currency = quote.currency || "USD";
    const nightlyRows = Array.isArray(quote.perNightBreakdown)
      ? quote.perNightBreakdown
          .slice(0, 12)
          .map((night, index) =>
            priceRow(night.date || `Night ${index + 1}`, night.price || night.basePrice || night.amount, currency),
          )
          .join("")
      : "";

    if (quote.source === "enquiry") {
      pricePanel.innerHTML = `
        ${heading}
        <div class="direct-stay-summary">
          <span>${escapeHtml(quote.checkIn)} to ${escapeHtml(quote.checkOut)}</span>
          <strong>${escapeHtml(quote.nights)} nights · ${escapeHtml(quote.guestsCount)} guests</strong>
        </div>
        <p class="direct-empty-state">
          Live pricing is temporarily unavailable. Send these preferred dates to the concierge team and they will
          confirm availability and the direct total.
        </p>
      `;
      return;
    }

    pricePanel.innerHTML = `
      ${heading}
      <div class="direct-stay-summary">
        <span>${escapeHtml(quote.checkIn)} to ${escapeHtml(quote.checkOut)}</span>
        <strong>${escapeHtml(quote.nights)} nights · ${escapeHtml(quote.guestsCount)} guests</strong>
      </div>
      <div class="direct-price-list">
        ${priceRow("Accommodation", quote.fareAccommodation, currency)}
        ${priceRow("Cleaning", quote.fareCleaning, currency)}
        ${priceRow("Taxes", quote.totalTaxes, currency)}
        ${priceRow("Subtotal", quote.subTotal, currency)}
        ${priceRow("Total", quote.total, currency, true)}
      </div>
      ${
        nightlyRows
          ? `<details class="direct-nightly-breakdown"><summary>Nightly details</summary>${nightlyRows}</details>`
          : ""
      }
    `;
  };

  const renderGuestForm = () => {
    if (guestForm) guestForm.hidden = !state.quote || Boolean(state.confirmation);
    if (bookingErrorNode) {
      bookingErrorNode.hidden = !state.bookingError;
      bookingErrorNode.textContent = state.bookingError;
    }
    const termsText = guestForm?.querySelector(".terms-check span");
    if (termsText) {
      termsText.textContent =
        state.quote?.source === "enquiry"
          ? "I understand this sends my preferred dates to the concierge team for confirmation."
          : "I understand this sends a booking request for confirmation.";
    }
    if (bookingButton) {
      bookingButton.disabled = state.bookingLoading;
      bookingButton.textContent = state.bookingLoading
        ? "Sending..."
        : state.quote?.source === "enquiry"
          ? "Continue to Concierge Enquiry"
          : "Send Booking Request";
    }
  };

  const renderConfirmation = () => {
    if (!confirmationPanel) return;
    confirmationPanel.hidden = !state.confirmation;
    if (!state.confirmation) {
      confirmationPanel.innerHTML = "";
      return;
    }

    const result = state.confirmation;
    const eyebrow = result.success ? "Confirmed" : result.pending ? "Request received" : "Follow-up needed";
    confirmationPanel.innerHTML = `
      <p class="section-kicker"><span>${escapeHtml(eyebrow)}</span></p>
      <h3>${escapeHtml(result.message || "Your request has been received.")}</h3>
      ${result.confirmationCode ? `<p>Confirmation code: <strong>${escapeHtml(result.confirmationCode)}</strong></p>` : ""}
      ${result.reservationId ? `<p>Reservation ID: <strong>${escapeHtml(result.reservationId)}</strong></p>` : ""}
      <button class="button button-secondary" type="button" data-start-over>Start Another Enquiry</button>
    `;

    confirmationPanel.querySelector("[data-start-over]")?.addEventListener("click", () => {
      state.confirmation = null;
      state.quote = null;
      state.checkIn = "";
      state.checkOut = "";
      state.activeDateField = "checkIn";
      guestForm?.reset();
      renderAll();
    });
  };

  const renderAll = () => {
    renderStatus();
    renderGuests();
    renderTrip();
    renderCalendar();
    renderPrice();
    renderGuestForm();
    renderConfirmation();
  };

  const loadListing = async () => {
    if (isMockMode) {
      state.maxGuests = 20;
      state.guestsCount = 10;
      return;
    }

    try {
      const listing = await apiFetch("/api/listing");
      if (listing?.accommodates) {
        state.maxGuests = Number(listing.accommodates);
        state.guestsCount = Math.min(10, state.maxGuests);
      }
    } catch (error) {
      state.maxGuests = 20;
    }
  };

  const loadCalendar = async () => {
    state.calendarLoading = true;
    renderAll();

    if (isMockMode) {
      state.calendar = createMockCalendar(today);
      state.calendarLoading = false;
      renderAll();
      return;
    }

    try {
      const calendar = await apiFetch(`/api/calendar?from=${state.from}&to=${state.to}`);
      if (!calendar || typeof calendar !== "object" || !Object.keys(calendar).length) {
        const emptyCalendarError = new Error("Live availability is temporarily unavailable.");
        emptyCalendarError.status = 502;
        throw emptyCalendarError;
      }
      state.calendar = calendar;
      state.calendarError = "";
    } catch (error) {
      state.fallbackMode = true;
      state.calendar = createEnquiryCalendar(today);
      state.calendarError =
        "Live availability is temporarily unavailable. Select preferred dates and the concierge team will confirm them.";
    } finally {
      state.calendarLoading = false;
      renderAll();
    }
  };

  const requestQuote = async () => {
    if (!state.checkIn || !state.checkOut) {
      state.quoteError = "Choose check-in and check-out dates first.";
      renderAll();
      return;
    }

    state.quoteLoading = true;
    state.quoteError = "";
    state.confirmation = null;
    renderAll();

    try {
      if (state.fallbackMode) {
        state.quote = createEnquiryQuote();
        return;
      }

      if (isMockMode) {
        const nights = Math.max(1, diffDays(state.checkIn, state.checkOut));
        state.quote = {
          quoteId: "mock-quote",
          status: "available",
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          nights,
          guestsCount: state.guestsCount,
          currency: "USD",
          fareAccommodation: nights * 990,
          fareCleaning: 200,
          totalFees: 0,
          totalTaxes: 0,
          subTotal: nights * 990 + 200,
          total: nights * 990 + 200,
          perNightBreakdown: Array.from({ length: nights }, (_, index) => ({
            date: toISO(addDays(parseISO(state.checkIn), index)),
            price: 990,
          })),
        };
        return;
      }

      const quote = await apiFetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          guestsCount: state.guestsCount,
          couponCode: state.couponCode.trim() || undefined,
        }),
      });
      if (!quote?.quoteId || !quote?.checkIn || !quote?.checkOut) {
        const invalidQuoteError = new Error("Live pricing is temporarily unavailable.");
        invalidQuoteError.status = 502;
        throw invalidQuoteError;
      }
      state.quote = quote;
    } catch (error) {
      if (isRecoverableApiError(error)) {
        state.fallbackMode = true;
        state.quote = createEnquiryQuote();
      } else {
        state.quoteError = error.message;
      }
    } finally {
      state.quoteLoading = false;
      renderAll();
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!state.quote) return;

    const data = new FormData(guestForm);
    if (!data.get("accepted")) {
      state.bookingError = "Please confirm the booking request terms first.";
      renderAll();
      return;
    }

    state.bookingLoading = true;
    state.bookingError = "";
    renderAll();

    const payload = {
      quoteId: state.quote.quoteId,
      ratePlanId: state.quote.ratePlanId,
      checkIn: state.quote.checkIn,
      checkOut: state.quote.checkOut,
      nights: state.quote.nights,
      guestsCount: state.quote.guestsCount,
      total: state.quote.total,
      currency: state.quote.currency,
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      phone: data.get("phone"),
      message: data.get("message"),
    };

    try {
      if (state.quote.source === "enquiry" || state.fallbackMode) {
        window.location.href = buildDirectBookingFallbackUrl(payload);
        return;
      }

      if (isMockMode) {
        state.confirmation = {
          success: false,
          pending: true,
          source: "mock",
          message: "Preview booking request received. Real Guesty calls are disabled in preview mode.",
        };
        return;
      }

      state.confirmation = await apiFetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      state.bookingError = error.message;
    } finally {
      state.bookingLoading = false;
      renderAll();
    }
  };

  state.todayIso = toISO(today);
  state.from = state.todayIso;
  state.to = toISO(addMonths(today, 12));

  prevButton?.addEventListener("click", () => {
    state.monthOffset = Math.max(0, state.monthOffset - 1);
    renderAll();
  });

  nextButton?.addEventListener("click", () => {
    state.monthOffset += 1;
    renderAll();
  });

  tripForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    requestQuote();
  });

  guestsSelect?.addEventListener("change", () => {
    state.guestsCount = Number(guestsSelect.value);
    clearQuote();
    renderAll();
  });

  couponInput?.addEventListener("input", () => {
    state.couponCode = couponInput.value;
    clearQuote();
    renderAll();
  });

  checkInInput?.addEventListener("click", () => {
    setActiveDateField("checkIn");
    renderAll();
  });

  checkInInput?.addEventListener("focus", () => {
    setActiveDateField("checkIn");
    renderAll();
  });

  checkOutInput?.addEventListener("click", () => {
    setActiveDateField("checkOut");
    renderAll();
  });

  checkOutInput?.addEventListener("focus", () => {
    setActiveDateField("checkOut");
    renderAll();
  });

  guestForm?.addEventListener("submit", submitBooking);

  renderAll();
  loadListing().then(() => {
    renderAll();
    return loadCalendar();
  });
};

initDirectBooking();
