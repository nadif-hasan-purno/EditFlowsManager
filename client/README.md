# Task Tracker Client

React frontend for the video editing agency task tracker. It includes board and list views, filters, task CRUD forms, reusable/one-off custom fields, and filtered CSV downloads.

## Requirements

- Node.js 20.19 or newer
- The Task Tracker Server running locally or at a reachable URL

## Setup

```bash
npm install
cp .env.example .env
npm start
```

The app opens at `http://localhost:5173` by default.

Set the API base URL in `.env` when the server is not running at `http://localhost:5000`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Production build

```bash
npm run build
npm run preview
```

The generated static files are placed in `dist/`.
