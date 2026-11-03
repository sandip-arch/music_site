# 🎵 Spotify Clone (High-Performance Full-Stack Web Application)

A modern, production-grade Spotify Clone web application featuring an **Express.js (Node.js)** audio streaming backend and a decoupled **Vite + React (Tailwind CSS, Zustand)** frontend, architected with **Role-Based Access Control (RBAC)**, **Personalized Playlists**, and **Cross-Device Mobile Local Network Exposure**.

---

## 🌟 Key Highlights & Features

### 🎧 1. HTTP 206 Partial Content Audio Streaming Engine
- **Byte-Range Streaming**: Implements standard RFC byte-range requests (`Range: bytes=start-end`) on `GET /api/v1/tracks/stream/:id`.
- **Zero Buffering Delay**: Automatically streams audio chunks via Node.js `fs.createReadStream`, setting `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`, and `Content-Type: audio/mpeg`.
- **Continuous Non-Blocking Playback**: A singleton `<AudioEngine />` mounted at the root [`App.jsx`](file:///c:/music/music_site/client/src/App.jsx) guarantees music continues playing uninterrupted as you browse between Home, Search, Library, Playlists, Albums, and Profile pages.

### 📱 2. Local Network & Mobile Phone Ready (`npm run dev`)
- **Zero-Config Network Exposure**: Running `npm run dev` automatically binds Vite (`0.0.0.0:5173`) and Express (`0.0.0.0:5014`) to all network interfaces.
- **Dynamic Proxy Architecture**: Vite's development server automatically detects the active backend port and proxies `/api` and `/media` requests seamlessly, avoiding CORS issues on mobile devices.
- **Touch-Friendly UI**: Buttons (Like, Add to Playlist, Delete) are optimized with dedicated touch targets for smartphone browsers.

### 📜 3. Personalized User Playlists & Privacy
- **User Ownership & Isolation**: Playlists are strictly tied to the authenticated user (`userId`).
  - **Your Sidebar & Library**: Only display playlists created by the logged-in user (`GET /api/v1/playlists?mine=true`). Other users' personal playlists will **never** leak into your sidebar or library.
  - **Featured Curated Playlists**: System and editorial playlists (e.g., *Today's Top Hits*, *Chill Lofi Beats*, *Synthwave Sunset*) appear on the Home page for all users to explore.
  - **Playlist Management**: Users can create, modify, and delete (`DELETE /api/v1/playlists/:id`) their own playlists.

### ➕ 4. Interactive Track Addition & Removal
- **In-Playlist Search & Add**: Open any playlist you created and access the **"Add songs to this playlist"** section:
  - Live search input to quickly find tracks by title, artist, or album.
  - Instant **`+ Add`** buttons to add songs to the playlist in real time with visual feedback (`Added`).
  - **`Remove from playlist`** trash buttons for playlist owners to remove tracks without requiring admin privileges.
- **Add from Anywhere**: Every track row across Home, Search, Albums, Artists, and Liked Songs features a **`+`** (Add to Playlist) button:
  - Opens the `AddToPlaylistModal` displaying your personal playlists.
  - Features an inline **`+ Create New Playlist`** option to create a playlist and add the track in a single click.

### 🔐 5. Role-Based Access Control (RBAC) & Studios
- **`USER` (Listener)**: Browse catalogue, stream music, search songs, create personal playlists, like songs, and customize profile.
- **`ARTIST` (Creator)**: Full listener access + access to **Artist Creator Studio** (`/studio`) to publish albums, release standalone singles, and review play statistics.
- **`ADMIN` (Moderator)**: Full platform authority + **Admin Studio** (`/studio`) featuring real-time catalogue search, filters by artist and release type, and **exclusive platform-wide track deletion authority** (`DELETE /api/v1/tracks/:id`).

### 👤 6. Profile Management & Security (`/profile`)
- Change profile avatar using quick presets or custom image URLs.
- Update display name with real-time UI synchronization across sidebar and topbar.
- Update password with current password verification and bcrypt hashing.

### 🔑 7. Forgot Password via Email OTP Architecture
- Production-grade password recovery powered by **Nodemailer**:
  - Securely dispatches a randomized 6-digit OTP code to the user's email address.
  - Enforces a strict **5-minute expiration window** via the `PasswordResetOtp` database model.
  - Live verification countdown timer and stale OTP invalidation.

---

## 📂 Project Structure & Monorepo Layout

```
music_site/
├── package.json             # Root monorepo script runner (concurrently)
├── README.md                # Complete documentation
├── PRISMA_DATABASE_GUIDE.md # Prisma ORM and SQLite database guide
├── server/                  # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma    # SQLite schema (User, Artist, Album, Track, Playlist)
│   │   ├── seed.js          # Realistic seed script
│   │   ├── prepare_audio.js # Local audio generator & audio validator
│   │   └── dev.db           # Zero-config SQLite database file
│   ├── media/audio/         # Local MP3 audio repository for HTTP 206 streaming
│   ├── src/
│   │   ├── controllers/     # Stream, Track, Search, Playlist, Album, Artist, Auth
│   │   ├── middleware/      # JWT authentication & RBAC authorization
│   │   ├── routes/          # REST endpoints under /api/v1 (api.js)
│   │   ├── prisma.js        # Prisma client singleton
│   │   └── index.js         # Express server configuration (0.0.0.0 LAN binding)
│   ├── package.json
│   └── .env                 # Server configuration (PORT, JWT_SECRET, etc.)
└── client/                  # Vite + React 18 SPA
    ├── src/
    │   ├── api/             # Axios client with JWT interceptors
    │   ├── store/           # Zustand state (usePlayerStore, useAuthStore)
    │   ├── components/      # AudioEngine, Sidebar, TopNav, PlayerBar, TrackTable, Modals
    │   ├── pages/           # Home, Search, Library, Playlist, Album, Artist, Liked, Studio, Profile
    │   ├── utils/           # Time and number formatters
    │   ├── App.jsx          # Root Layout & persistent AudioEngine
    │   └── main.jsx
    ├── tailwind.config.js   # Official Spotify dark theme palette
    └── vite.config.js       # Vite server (host: '0.0.0.0', dynamic backend proxy)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher

### 1. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 2. Initialize Database & Seed Content
```bash
# Push Prisma schema to SQLite
npm run db:push

# Populate database with realistic tracks, artists, albums, playlists, and test accounts
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

The terminal will display both Local and Network URLs:
```text
  VITE v5.4.11  ready in 260 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.68.185.123:5173/
```

- **Web App (Local)**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5173/api/health](http://localhost:5173/api/health)

---

## 📱 How to Run and Open on Your Phone

1. **Connect to the Same Wi-Fi Network**:
   Ensure both your computer and your phone are connected to the same Wi-Fi network (or connect your phone to your PC's Mobile Hotspot).

2. **Start the App**:
   ```bash
   npm run dev
   ```

3. **Open the Network URL on Your Phone**:
   Look for the `➜ Network: http://<YOUR_PC_IP>:5173/` line in your terminal output and type it into your mobile browser (e.g. Chrome, Safari).

4. **Troubleshooting (If phone fails to connect)**:
   - **Windows Firewall**: In an Administrator PowerShell terminal, run:
     ```powershell
     New-NetFirewallRule -DisplayName "Spotify Clone" -Direction Inbound -LocalPort 5173,5014 -Protocol TCP -Action Allow
     ```
   - **Network Profile**: Ensure your PC's Wi-Fi connection in Windows Settings is set to **Private Network** (Windows blocks incoming local traffic on "Public" networks).

---

## 🎼 How Music Playback Works (Architecture Deep Dive)

```
[User Clicks Play in UI]
         │
         ▼
[usePlayerStore.playTrack(track, queue)] ──(Zustand State)
         │
         ▼
[AudioEngine.jsx (<audio> ref)]
   • Computes: /api/v1/tracks/stream/:id
   • audio.src = streamUrl
   • audio.load() & audio.play()
         │
         ▼
[HTTP 206 Byte-Range Request]
         │
         ▼
[streamController.js (Express Backend)]
   • Reads Range header (e.g., bytes=0-1048576)
   • Creates fs.createReadStream(filePath, { start, end })
   • Sets Content-Range & Content-Type: audio/mpeg
   • Pipes stream chunk directly to response
         │
         ▼
[Native Audio Element Events]
   • onTimeUpdate ───────► usePlayerStore.updateProgress() ─► PlayerBar (Scrubber & Timers)
   • onLoadedMetadata ───► Updates total song duration
   • onEnded ────────────► usePlayerStore.nextTrack() (or loops if repeat is 'one')
```

- **Singleton decoupled audio**: Mounted in [`App.jsx`](file:///c:/music/music_site/client/src/App.jsx), `<AudioEngine />` never unmounts during route navigation.
- **Hardware-accelerated browser playback**: Native `<audio>` tag handles decoding and buffering with minimal CPU usage.
- **HTTP 206 Partial Content**: Songs start playing within milliseconds without having to download the entire audio file.

---

## 🔑 Pre-Seeded RBAC Test Accounts

You can switch between accounts using the **1-Click Role Switcher** on the login modal or sign in with:

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **`USER`** (Listener) | `listener@spotify.local` | `password123` | Stream music, create personal playlists, like songs, edit profile |
| **`ARTIST`** (Creator) | `artist@spotify.local` | `password123` | Listener features + Artist Creator Studio, release albums & singles |
| **`ADMIN`** (Moderator) | `admin@spotify.local` | `password123` | Full platform authority + Admin Studio, delete any track from platform |

---

## 📡 REST API Reference

### Audio Streaming & Tracks
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/tracks/stream/:id` | Public | **HTTP 206 Partial Content** byte-range audio stream |
| **GET** | `/api/v1/tracks` | Public | Paginated track list with artist & album metadata |
| **GET** | `/api/v1/tracks/:id` | Public | Retrieve single track details |
| **POST** | `/api/v1/tracks` | `ARTIST`, `ADMIN` | Publish new single or album track |
| **DELETE** | `/api/v1/tracks/:id` | **`ADMIN` Only** | Permanently delete track (cascades playlists & likes) |
| **POST** | `/api/v1/tracks/:id/like` | Authenticated | Toggle track in user's Liked Songs |
| **GET** | `/api/v1/tracks/liked` | Authenticated | Retrieve authenticated user's liked tracks |

### Personalized Playlists
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/playlists?mine=true` | Authenticated | Retrieve logged-in user's personal playlists |
| **GET** | `/api/v1/playlists?featured=true` | Public | Retrieve curated system/editorial playlists |
| **GET** | `/api/v1/playlists/:id` | Public / Private | Retrieve playlist details with ordered tracklist |
| **POST** | `/api/v1/playlists` | Authenticated | Create a new playlist |
| **DELETE** | `/api/v1/playlists/:id` | Owner / `ADMIN` | Delete an entire playlist |
| **POST** | `/api/v1/playlists/:id/tracks` | Owner / `ADMIN` | Add track to playlist |
| **DELETE** | `/api/v1/playlists/:id/tracks/:trackId`| Owner / `ADMIN` | Remove track from playlist |

### Albums & Artists
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/albums` | Public | Retrieve all albums |
| **GET** | `/api/v1/albums/:id` | Public | Get album details with full tracklist |
| **POST** | `/api/v1/albums` | `ARTIST`, `ADMIN` | Create a new album |
| **GET** | `/api/v1/artists` | Public | Retrieve all verified artists |
| **GET** | `/api/v1/artists/:id` | Public | Get artist profile, discography, and top tracks |

### Authentication & Profile
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | Public | Login with email/password to retrieve JWT |
| **POST** | `/api/v1/auth/register` | Public | Register new user account |
| **GET** | `/api/v1/auth/me` | Authenticated | Get current authenticated user profile |
| **PUT** | `/api/v1/auth/profile` | Authenticated | Update display name and avatar URL |
| **PUT** | `/api/v1/auth/password` | Authenticated | Update account password |
| **POST** | `/api/v1/auth/forgot-password`| Public | Generate 6-digit OTP code sent via email |
| **POST** | `/api/v1/auth/reset-password` | Public | Verify OTP code and reset password |
| **GET** | `/api/v1/auth/demo-accounts` | Public | Get pre-seeded accounts for 1-click login |

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, cors, helmet, morgan.
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, React Router DOM, Lucide Icons, Axios.
- **Streaming Engine**: HTML5 Audio API consuming HTTP 206 partial content range streams.
