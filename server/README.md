# Task Tracker Server

Small Express/MongoDB API for the video editing agency task tracker.

## Requirements

- Node.js 20.19 or newer
- A local or hosted MongoDB database

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Edit `.env` before starting:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/task_tracker
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

`CLIENT_ORIGIN` may contain comma-separated origins.

## Main endpoints

- `GET /api/health`
- `GET|POST /api/tasks`
- `GET|PATCH|PUT|DELETE /api/tasks/:id`
- `GET /api/tasks/export.csv?status=Todo&client=Acme&editor=Sam`
- `GET|POST /api/custom-field-definitions`
- `GET|PATCH|PUT|DELETE /api/custom-field-definitions/:id`

Task-list and CSV routes accept optional `status`, `client`, and `editor` query parameters.

## Development

```bash
npm run dev
```

This project deliberately contains no authentication because it is scoped as a single-user internal tool.
