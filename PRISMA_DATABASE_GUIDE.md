# 🗄️ Prisma ORM & Database Guide: Architecture, Storage, and Multi-Device Setup

This guide explains how **Prisma ORM** manages data in this Spotify Clone application, which database engine is used and why, and provides step-by-step instructions on running the project on any new machine after cloning from GitHub.

---

## 📌 Table of Contents
1. [What is Prisma ORM?](#1-what-is-prisma-orm)
2. [Which Database is Used & Why?](#2-which-database-is-used--why)
3. [How Prisma Stores and Relates Data](#3-how-prisma-stores-and-relates-data)
4. [Step-by-Step: Running on a New Device After Cloning](#4-step-by-step-running-on-a-new-device-after-cloning)
5. [Prisma Studio (Visual Database GUI)](#5-prisma-studio-visual-database-gui)
6. [Switching to PostgreSQL for Production](#6-switching-to-postgresql-for-production)

---

## 1. What is Prisma ORM?

**Prisma** is an open-source Next-Generation Object-Relational Mapper (ORM) for Node.js and TypeScript/JavaScript. In this project, Prisma acts as the data access layer between the **Express.js API** and the underlying relational database.

### Core Components Used in this Project:
1. **Prisma Schema (`server/prisma/schema.prisma`)**:
   - The declarative single source of truth defining models, columns, data types, indexes, and relationships.
2. **Prisma Client (`@prisma/client`)**:
   - An auto-generated, type-safe database client imported into [`server/src/prisma.js`](file:///c:/Users/Lenovo/Desktop/music_2/server/src/prisma.js) used across all controllers (`prisma.track.findMany()`, `prisma.playlist.create()`, etc.).
3. **Prisma CLI (`npx prisma`)**:
   - Tooling used for database push (`prisma db push`), seeding (`prisma db seed`), and client generation (`prisma generate`).

---

## 2. Which Database is Used & Why?

### The Database Engine: **SQLite**
The database is configured as **SQLite** via the connection string in `server/.env`:
```env
DATABASE_URL="file:./dev.db"
```
The physical database file is stored directly at `server/prisma/dev.db`.

### Why SQLite Was Chosen for Local Runs:
1. **Zero Configuration & Zero External Services**:
   - Running traditional databases like PostgreSQL or MySQL requires installing database services, managing background daemons, creating users, and configuring local ports.
   - SQLite is **embedded directly in the Node process**—it requires no server, no installation, and no credentials.
2. **Self-Contained & Completely Portable**:
   - The database lives in a single local file (`dev.db`). This makes the repository self-contained and reproducible across any operating system (Windows, macOS, Linux).
3. **ACID Compliant**:
   - Despite being serverless, SQLite offers full ACID (Atomicity, Consistency, Isolation, Durability) guarantees, ensuring reliable transactions when users create playlists or like tracks.
4. **100% Swappable to PostgreSQL or MySQL**:
   - Because Prisma abstracts the underlying SQL dialect, you can change the provider in `schema.prisma` from `sqlite` to `postgresql` in **one line** without modifying any application code or controllers!

---

## 3. How Prisma Stores and Relates Data

Prisma manages 7 relational models defined in `server/prisma/schema.prisma`:

```
┌──────────────┐         ┌──────────────┐
│     User     │◄───────►│    Artist    │ (Optional 1-to-1 for Creators)
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ 1-to-Many              │ 1-to-Many
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│   Playlist   │         │    Album     │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ 1-to-Many              │ 1-to-Many
       ▼                        ▼
┌──────────────┐  Many   ┌──────────────┐
│PlaylistTrack │◄───────►│    Track     │
└──────────────┘         └──────┬───────┘
                                │
                         Many-to-Many
                                ▼
                         ┌──────────────┐
                         │  LikedTrack  │
                         └──────────────┘
```

### Data Models & Relationships Explained:

1. **`User`**:
   - Fields: `id` (UUID), `email` (unique), `passwordHash` (bcrypt), `name`, `role` (`USER`, `ARTIST`, `ADMIN`), `avatarUrl`.
   - Has many `Playlist` records and `LikedTrack` records.
2. **`Artist`**:
   - Fields: `id`, `name`, `bio`, `image`, `monthlyListeners`, `isVerified`.
   - Optionally relates 1-to-1 with a `User` account via `userId` so that users with the `ARTIST` role manage their own artist profile.
3. **`Album`**:
   - Fields: `id`, `title`, `coverArt`, `releaseYear`, `artistId`.
   - Belongs to an `Artist` (`onDelete: Cascade`), has many `Track` records.
4. **`Track`**:
   - Fields: `id`, `title`, `duration` (in seconds), `audioUrl` (streaming URL), `filePath` (local audio buffer path), `plays` (stream play counter), `albumId` (optional for singles), `artistId`.
   - Can belong to an `Album` or exist as a **Standalone Single** (`albumId = null`).
5. **`Playlist`**:
   - Fields: `id`, `name`, `description`, `coverArt`, `isPublic`, `userId`.
   - Belongs to a `User` and contains an ordered list of `PlaylistTrack` records.
6. **`PlaylistTrack`** (Join Table):
   - Fields: `id`, `playlistId`, `trackId`, `order` (index for custom track ordering), `addedAt`.
   - Unique composite constraint: `@@unique([playlistId, trackId])` ensures a track cannot be duplicated in the same playlist.
7. **`LikedTrack`** (Favorites Join Table):
   - Fields: `id`, `userId`, `trackId`, `addedAt`.
   - Unique constraint: `@@unique([userId, trackId])` ensures efficient lookup for user likes.
8. **`PasswordResetOtp`** (OTP Verification Store):
   - Fields: `id` (UUID), `email` (indexed), `otp` (6-digit string), `expiresAt` (timestamp set to `Date.now() + 5 * 60 * 1000`), `createdAt`.
   - Stores ephemeral one-time password codes for secure password resets. Stale or expired codes are automatically pruned when a new OTP is requested.

### 🛡️ Atomic Track Deletion & Foreign Key Cascades:
In SQLite and relational databases, deleting a `Track` record fails if foreign key records exist in `LikedTrack` or `PlaylistTrack`. To provide an enterprise-grade moderation workflow, the backend executes track deletion inside an atomic **`prisma.$transaction`**:
```javascript
await prisma.$transaction([
  prisma.likedTrack.deleteMany({ where: { trackId: id } }),
  prisma.playlistTrack.deleteMany({ where: { trackId: id } }),
  prisma.track.delete({ where: { id } }),
]);
```
This ensures consistent data integrity, prevents orphaned rows, and guarantees that track deletion is strictly restricted to `ADMIN` users.

---

## 4. Step-by-Step: Running on a New Device After Cloning

Follow these exact steps if you clone this repository onto another computer or device (Windows, Mac, or Linux):

### Step 1: Verify Prerequisites
Ensure your device has Node.js and Git installed:
```bash
node -v   # Must be v18.0.0 or higher (v20+ recommended)
npm -v    # Must be v9.0.0 or higher
git --version
```

### Step 2: Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd music_2
```

### Step 3: Install All Monorepo Dependencies
Run the unified installer from the root folder:
```bash
npm run install:all
```
*(This automatically runs `npm install` for the root, `/server`, and `/client`).*

### Step 4: Verify Environment Files
Check that `server/.env` exists. If not, create `server/.env` with:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="spotify_clone_jwt_secret_dev_2026"
CLIENT_URL="http://localhost:5173"

# Optional: Nodemailer SMTP Configuration (Defaults to Ethereal test account if omitted)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
# SMTP_SECURE="false"
```

### Step 5: Initialize the Database & Generate Prisma Client
Push the schema to create the SQLite tables and generate the local Prisma client:
```bash
npm run db:push
```
*Expected output: `✔ Generated Prisma Client` & `SQLite database dev.db created`.*

### Step 6: Seed the Database with Realistic Audio & Accounts
Run the seed script to prepare 10 local audio files in `server/media/audio`, seed 4 artists, 4 albums, 10 tracks, and the 3 RBAC accounts:
```bash
npm run db:seed
```
*Expected output: `Database populated successfully with realistic music catalogue, playlists, and RBAC accounts!`*

### Step 7: Launch the Application
Start both the Express.js backend and Vite React frontend concurrently:
```bash
npm run dev
```

Open your browser:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## 5. Prisma Studio (Visual Database GUI)

Prisma comes with a built-in visual database browser called **Prisma Studio**. You can use it to inspect, edit, or delete records in your browser without writing SQL queries.

To open Prisma Studio:
```bash
cd server
npx prisma studio
```
It will automatically launch a visual dashboard at [http://localhost:5555](http://localhost:5555) where you can view tables for `User`, `Artist`, `Album`, `Track`, and `Playlist`.

---

## 6. Switching to PostgreSQL for Production

If you want to deploy this application to production (e.g. on Supabase, Neon, Railway, Render, or AWS RDS):

### 1. Update `server/prisma/schema.prisma`
Change the `provider` in the `datasource` block from `"sqlite"` to `"postgresql"`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Update `server/.env`
Replace the SQLite file URL with your PostgreSQL connection URI:
```env
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres?schema=public"
```

### 3. Push the Schema to PostgreSQL
```bash
npm run db:push
npm run db:seed
```
Prisma will create all PostgreSQL tables, indexes, foreign keys, and populate your seed data immediately!
