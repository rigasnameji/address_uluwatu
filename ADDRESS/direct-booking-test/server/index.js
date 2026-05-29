require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const listingRouter      = require('./routes/listing');
const calendarRouter     = require('./routes/calendar');
const quotesRouter       = require('./routes/quotes');
const reservationsRouter = require('./routes/reservations');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/listing',      listingRouter);
app.use('/api/calendar',     calendarRouter);
app.use('/api/quotes',       quotesRouter);
app.use('/api/reservations', reservationsRouter);
app.get('/health', (_, res) => res.json({ ok: true }));

// Expose the local 360 tour bundle so file:// previews can load it over HTTP.
const tourDist = path.join(__dirname, '../../tour');
app.use('/tour-360', express.static(tourDist));

// Serve built React app
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
