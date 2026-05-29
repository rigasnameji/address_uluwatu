# AddressBali Direct Booking Test

Standalone test booking app for AddressBali.

The backend uses Guesty's Booking Engine API and persists OAuth tokens on disk. Do not delete `server/.token-cache.json` unless the token is expired or invalid, because Guesty allows only 5 new tokens per day per client ID.

## Run Locally

```bash
cd server
npm install
npm start
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Test

```bash
cd client
npm install
npm run build
cd ../server
npm install
npm start
```

Open `http://localhost:3001`.

