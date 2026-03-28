# Notes App Backend

Backend-only implementation of a Notes App with users and owner-restricted notes.

## Features

- User registration and login with JWT
- User + notes collections with reference (`note.owner -> user._id`)
- Owner-only access for notes CRUD
- Mongoose `populate` support to fetch user with notes
- Endpoints for all user notes and a single note
- Soft-delete/archiving support for notes

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication

## Setup

1. Install dependencies:
   npm install
2. Create `.env` file from `.env.example`.
3. Start server in dev mode:
   npm run dev

## Environment Variables

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## API Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
  - body: `{ "name": "Kapil", "email": "kapil@example.com", "password": "123456" }`
- `POST /api/auth/login`
  - body: `{ "email": "kapil@example.com", "password": "123456" }`

### User (with populate)

- `GET /api/users/me`
- `GET /api/users/me?includeArchived=true`

Both require `Authorization: Bearer <token>`.

### Notes (owner only)

- `POST /api/notes`
- `GET /api/notes`
- `GET /api/notes?includeArchived=true`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `PATCH /api/notes/:id/archive`
- `PATCH /api/notes/:id/restore`
- `DELETE /api/notes/:id` (soft-delete: archives the note)

All notes routes require `Authorization: Bearer <token>`.

## Notes Schema

- `title` (required)
- `content`
- `owner` (ObjectId ref to User)
- `isArchived` (default `false`)
- `archivedAt`
- timestamps
