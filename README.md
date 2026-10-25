# 🎵 Spotify Clone (High-Performance Full-Stack Web Application)

A modern, production-grade Spotify Clone web application featuring an **Express.js (Node.js)** audio streaming backend and a decoupled **Vite + React (Tailwind CSS, Zustand)** frontend, architected with **Role-Based Access Control (RBAC)**.

---

## 🌟 Highlights & Features

### 🎧 1. HTTP 206 Partial Content Audio Streaming Engine
- Implements standard RFC byte-range requests (`Range: bytes=start-end`) on `GET /api/v1/tracks/stream/:id`.
- Automatically calculates chunk size, sets `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`, and `Content-Type: audio/mpeg`.
- Direct file streaming via Node's `fs.createReadStream` with seeking support.
- **Continuous Non-Blocking Playback**: A singleton `<AudioEngine />` mounted at the root layout ensures music continues playing uninterrupted as users navigate through Home, Search, Library, Playlists, and Studio pages.

### 🎨 2. Official Spotify Dark Theme
- Tailored palette: `#121212` base background, `#181818` card surfaces, `#282828` hover states, `#1DB954` Spotify green accent, and `#B3B3B3` muted typography.
- Micro-animations, responsive grid cards, custom Spotify range sliders for scrubbing and volume, and smooth glassmorphism headers.

### 🔐 3. Role-Based Access Control (RBAC) & Moderation
- Three built-in user roles with pre-seeded demo accounts and a **1-Click Role Switcher**:
  - **`USER` (Listener)**: Browse catalogue, stream music, search songs, create personal playlists, like songs, and customize user profile.
  - **`ARTIST` (Creator)**: Full listener access + access to **Artist Creator Studio** (`/studio`) to release albums, publish standalone singles, review listener play metrics, and manage categorized discographies.
  - **`ADMIN` (Moderator)**: Full platform authority + access to **Admin Console** (`/studio`) featuring real-time catalogue search, filters by artist and release type, and **exclusive track deletion authority**.
- **Admin-Only Track Deletion**: Track deletion is strictly locked down to administrators (`req.user.role === 'ADMIN'`). Deletions are executed in an atomic Prisma transaction (`prisma.$transaction`) that cleanly cascades foreign key relationships from user playlists and liked songs.

### 👤 4. Profile Management & Security (`/profile`)
- Dedicated **Profile Section** for users to:
  - Update profile picture via instant avatar presets or custom image URLs.
  - Update display name with real-time UI synchronization.
  - Change password with old password verification and bcrypt hashing.

### 🔑 5. Forgot Password via Email OTP Architecture
- Production-grade password recovery powered by **Nodemailer**:
  - Securely sends a randomized 6-digit OTP code to the user's registered email address.
  - Strict **5-minute expiration window** enforced via database timestamps (`PasswordResetOtp` model).
  - Clean verification workflow with live countdown timer, invalid code rejection, and automatic stale OTP invalidation.

### 🎛️ 6. Artist Discography & Admin Moderation
- **Artist Studio**: Categorized views into **Albums** (with expandable tracklists) and **Standalone Singles & EPs** for intuitive release management.
- **Admin Studio**: Advanced search bar (search by track title, artist name, or album), artist dropdown filter, release type selector (All vs. Albums vs. Singles), sort controls (Most Plays, Fewest Plays, Title A-Z, Duration), and **Admin Delete Buttons**.

### 🎼 7. Rich Client Experience
- Dynamic time-based greetings ("Good morning", "Good afternoon", "Good evening").
- Interactive search with live debouncing and top-result spotlight.
- Real-time playlists creation and track addition/removal.
- Persistent Liked Songs collection synced to database.
- Sticky bottom player bar with Play/Pause, Next/Prev, Shuffle, Repeat modes, scrubber, volume slider, and playback queue viewer.

---

## 📂 Project Architecture & Monorepo Layout

```
music_2/
├── package.json             # Root monorepo script orchestrator (concurrently)
├── README.md                # Project documentation & guide
├── PRISMA_DATABASE_GUIDE.md # Deep-dive into Prisma, SQLite, and multi-device migration
├── server/                  # Backend Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma    # SQLite schema (cleanly swappable to PostgreSQL)
│   │   ├── seed.js          # Realistic seed script (Users, Artists, Albums, Tracks, Playlists)
│   │   ├── prepare_audio.js # Audio file synthesizer & sample validator
│   │   └── dev.db           # Zero-config SQLite database file
│   ├── media/audio/         # Local audio repository for HTTP 206 streaming
│   ├── src/
│   │   ├── controllers/     # Stream, Track, Search, Playlist, Album, Artist, Auth
│   │   ├── middleware/      # JWT authentication & RBAC authorization
│   │   ├── routes/          # REST endpoints under /api/v1 (api.js)
│   │   ├── prisma.js        # Prisma client singleton
│   │   └── index.js         # Express server configuration (cors, helmet, morgan)
│   ├── package.json         # Express.js backend configuration (node --watch)
│   └── .env                 # Environment variables
└── client/                  # Frontend Vite + React SPA
    ├── src/
    │   ├── api/             # Axios client with interceptors
    │   ├── store/           # Zustand state (usePlayerStore, useAuthStore)
    │   ├── components/      # AudioEngine, Sidebar, TopNav, PlayerBar, TrackTable, Modals
    │   ├── pages/           # Home, Search, Library, Playlist, Album, Artist, Liked, Studio
    │   ├── utils/           # Time formatters and helpers
    │   ├── App.jsx          # Root Layout & persistent AudioEngine
    │   └── main.jsx
    ├── tailwind.config.js   # Official Spotify dark theme palette
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher (v20+ recommended)
- `npm` v9.0.0 or higher

### 1. Installation
Clone the repository and install all dependencies for root, server, and client:

```bash
# Install root, server, and client packages in one command
npm run install:all
```

### 2. Database Setup & Seeding
Initialize the SQLite database and seed working audio tracks, artists, albums, playlists, and RBAC test accounts:

```bash
# Push schema to SQLite
npm run db:push

# Populate database with realistic tracks and audio files
npm run db:seed
```

### 3. Run the Development Servers
Start both the Express.js API and the Vite React frontend concurrently:

```bash
npm run dev
```

- **Frontend Web Player**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded RBAC Test Accounts

You can switch between these accounts with **1 click** using the Role Badge in the web app, or sign in manually with these credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **`USER`** (Listener) | `listener@spotify.local` | `password123` | Stream songs, create playlists, like songs |
| **`ARTIST`** (Creator) | `artist@spotify.local` | `password123` | All Listener access + Artist Studio, release albums & singles, delete own tracks |
| **`ADMIN`** (Moderator) | `admin@spotify.local` | `password123` | Full access + Admin Console, search/filter catalogue, delete any track |

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | Server health status |
| **GET** | `/api/v1/tracks/stream/:id` | Public | **HTTP 206 Partial Content** audio byte stream |
| **GET** | `/api/v1/tracks` | Public | List tracks with pagination and artist details |
| **GET** | `/api/v1/tracks/:id` | Public | Get track by ID |
| **POST** | `/api/v1/tracks` | `ARTIST`, `ADMIN` | Publish a new track |
| **DELETE** | `/api/v1/tracks/:id` | **`ADMIN` Only** | Delete track from platform (cascades playlists & likes) |
| **POST** | `/api/v1/tracks/:id/like` | `USER`, `ARTIST`, `ADMIN` | Toggle track in Liked Songs |
| **GET** | `/api/v1/tracks/liked` | `USER`, `ARTIST`, `ADMIN` | Get authenticated user's liked tracks |
| **GET** | `/api/v1/search?q=:query` | Public | Search tracks, artists, and albums |
| **GET** | `/api/v1/playlists` | Public / Auth | List public and user playlists |
| **POST** | `/api/v1/playlists` | `USER`, `ARTIST`, `ADMIN` | Create a new playlist |
| **GET** | `/api/v1/playlists/:id` | Public / Auth | Get playlist with ordered tracks |
| **POST** | `/api/v1/playlists/:id/tracks` | Playlist Owner / `ADMIN` | Add track to playlist |
| **DELETE**| `/api/v1/playlists/:id/tracks/:trackId` | Playlist Owner / `ADMIN` | Remove track from playlist |
| **GET** | `/api/v1/albums` | Public | List albums |
| **GET** | `/api/v1/albums/:id` | Public | Get album details with tracklist |
| **POST** | `/api/v1/albums` | `ARTIST`, `ADMIN` | Release a new album |
| **GET** | `/api/v1/artists` | Public | List artists |
| **GET** | `/api/v1/artists/:id` | Public | Get artist profile, top tracks, and discography |
| **POST** | `/api/v1/auth/login` | Public | Authenticate user & retrieve JWT |
| **POST** | `/api/v1/auth/register` | Public | Register new user with specific role |
| **GET** | `/api/v1/auth/me` | Authenticated | Retrieve authenticated user profile |
| **PUT** | `/api/v1/auth/profile` | Authenticated | Update user display name and profile avatar |
| **PUT** | `/api/v1/auth/password` | Authenticated | Update account password with old password verification |
| **POST** | `/api/v1/auth/forgot-password`| Public | Request 6-digit OTP code sent via Nodemailer (5 min expiry) |
| **POST** | `/api/v1/auth/reset-password` | Public | Verify OTP code and reset password |
| **GET** | `/api/v1/auth/demo-accounts`| Public | Fetch pre-seeded accounts for 1-click role switcher |

---

## 🛠️ Technology Stack

- **Backend**: Express.js, Node.js, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, cors, helmet, morgan.
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, React Router DOM, Lucide Icons, Axios.
- **Audio Engine**: HTML5 Audio API consuming HTTP 206 partial content range streams.

---

## 📖 Additional Documentation
For details on database internals, Prisma schema design, and step-by-step instructions for running on other machines or deploying to PostgreSQL, see **[PRISMA_DATABASE_GUIDE.md](./PRISMA_DATABASE_GUIDE.md)**.
