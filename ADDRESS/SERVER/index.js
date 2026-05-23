require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const listingRouter = require('./routes/listing');
const calendarRouter = require('./routes/calendar');
const quotesRouter = require('./routes/quotes');
const reservationsRouter = require('./routes/reservations');
const contactRouter = require('./routes/contact');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// API routes
app.use('/api/listing', listingRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/contact', contactRouter);
app.get('/health', (_, res) => res.json({ ok: true }));

// Serve static website
const sitePath = path.join(__dirname, '../WEBSITE');
app.use(express.static(sitePath));
app.get('*', (_, res) => res.sendFile(path.join(sitePath, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
