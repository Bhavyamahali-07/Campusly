# 🎓 College Social & Collaboration Platform

A private digital ecosystem for college students to showcase skills, collaborate on projects, join clubs, attend events, and build their campus reputation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Zustand, React Router |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT (HTTP-only cookies), bcrypt |
| Validation | Zod |
| Media | Cloudinary (planned) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Development

```bash
# Run both client and server
npm run dev

# Or separately
npm run dev:client   # http://localhost:5173
npm run dev:server   # http://localhost:5000
```

### Environment Variables

Copy `.env.example` in the `server/` directory and fill in your values:

```bash
cp server/.env.example server/.env
```

## Project Structure

```
college-platform/
├── client/          # React + Vite frontend
├── server/          # Express + MongoDB backend
├── .gitignore
├── README.md
└── package.json     # Monorepo root
```
