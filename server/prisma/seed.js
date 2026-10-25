const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { prepareAllAudio } = require('./prepare_audio');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seeding (JavaScript)...');

  // Ensure audio files are prepared first
  await prepareAllAudio();

  // Clear existing data cleanly in reverse order of foreign keys
  await prisma.likedTrack.deleteMany({});
  await prisma.playlistTrack.deleteMany({});
  await prisma.playlist.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('[Seed] Cleaned old database records.');

  // Create Users with Roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const listenerUser = await prisma.user.create({
    data: {
      email: 'listener@spotify.local',
      passwordHash: hashedPassword,
      name: 'Alex Listener',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const artistUser = await prisma.user.create({
    data: {
      email: 'artist@spotify.local',
      passwordHash: hashedPassword,
      name: 'Luna Mirage',
      role: 'ARTIST',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@spotify.local',
      passwordHash: hashedPassword,
      name: 'Admin Controller',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('[Seed] Created default RBAC users: USER, ARTIST, ADMIN.');

  // Create Artists
  const artistNeon = await prisma.artist.create({
    data: {
      name: 'Neon Horizon',
      bio: 'Electronic & Synthwave duo crafting immersive nocturnal soundscapes and retro-futuristic basslines.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      monthlyListeners: 3420800,
      isVerified: true,
    },
  });

  const artistLuna = await prisma.artist.create({
    data: {
      name: 'Luna Mirage',
      bio: 'Bedroom producer blending Lo-Fi hip hop, dream pop textures, and tape-saturated electric piano chords.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      monthlyListeners: 2150400,
      isVerified: true,
      userId: artistUser.id,
    },
  });

  const artistAura = await prisma.artist.create({
    data: {
      name: 'Aura Flow',
      bio: 'Cinematic ambient composer exploring deep space harmonics, modular synthesis, and calming frequencies.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      monthlyListeners: 1890200,
      isVerified: true,
    },
  });

  const artistVelvet = await prisma.artist.create({
    data: {
      name: 'Velvet Echo',
      bio: 'Modern alternative R&B and Neo-soul collective with sultry vocals and smooth organic percussion.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      monthlyListeners: 4610900,
      isVerified: true,
    },
  });

  console.log('[Seed] Created 4 Artists.');

  // Create Albums
  const albumAfterHours = await prisma.album.create({
    data: {
      title: 'After Hours Odyssey',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
      releaseYear: 2024,
      artistId: artistNeon.id,
    },
  });

  const albumLateNight = await prisma.album.create({
    data: {
      title: 'Late Night Musings',
      coverArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      releaseYear: 2023,
      artistId: artistLuna.id,
    },
  });

  const albumZenith = await prisma.album.create({
    data: {
      title: 'Zenith Waves',
      coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      releaseYear: 2024,
      artistId: artistAura.id,
    },
  });

  const albumSilk = await prisma.album.create({
    data: {
      title: 'Silk & Chrome',
      coverArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop&q=80',
      releaseYear: 2024,
      artistId: artistVelvet.id,
    },
  });

  console.log('[Seed] Created 4 Albums.');

  // Create Tracks with local audio file paths and URLs
  const tracksData = [
    {
      title: 'Midnight Drive',
      duration: 215,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/1',
      filePath: 'media/audio/track-1.mp3',
      plays: 1420800,
      albumId: albumAfterHours.id,
      artistId: artistNeon.id,
    },
    {
      title: 'Neon Skyline',
      duration: 198,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/2',
      filePath: 'media/audio/track-2.mp3',
      plays: 980400,
      albumId: albumAfterHours.id,
      artistId: artistNeon.id,
    },
    {
      title: 'Cyber Dreams',
      duration: 242,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/3',
      filePath: 'media/audio/track-3.mp3',
      plays: 670120,
      albumId: albumAfterHours.id,
      artistId: artistNeon.id,
    },
    {
      title: 'Coffee in Tokyo',
      duration: 174,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/4',
      filePath: 'media/audio/track-4.mp3',
      plays: 2310500,
      albumId: albumLateNight.id,
      artistId: artistLuna.id,
    },
    {
      title: 'Rainy Window Pane',
      duration: 186,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/5',
      filePath: 'media/audio/track-5.mp3',
      plays: 1845000,
      albumId: albumLateNight.id,
      artistId: artistLuna.id,
    },
    {
      title: 'Starlight Lofi',
      duration: 165,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/6',
      filePath: 'media/audio/track-6.mp3',
      plays: 1204000,
      albumId: albumLateNight.id,
      artistId: artistLuna.id,
    },
    {
      title: 'Deep Horizon',
      duration: 260,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/7',
      filePath: 'media/audio/track-7.mp3',
      plays: 745300,
      albumId: albumZenith.id,
      artistId: artistAura.id,
    },
    {
      title: 'Floating Nebula',
      duration: 230,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/8',
      filePath: 'media/audio/track-8.mp3',
      plays: 532100,
      albumId: albumZenith.id,
      artistId: artistAura.id,
    },
    {
      title: 'Velvet Touch',
      duration: 205,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/9',
      filePath: 'media/audio/track-9.mp3',
      plays: 3120000,
      albumId: albumSilk.id,
      artistId: artistVelvet.id,
    },
    {
      title: 'Golden Sunset',
      duration: 190,
      audioUrl: 'http://localhost:5000/api/v1/tracks/stream/10',
      filePath: 'media/audio/track-10.mp3',
      plays: 2190000,
      albumId: albumSilk.id,
      artistId: artistVelvet.id,
    },
  ];

  const createdTracks = [];
  for (const trackInfo of tracksData) {
    const track = await prisma.track.create({
      data: trackInfo,
    });
    // Update audioUrl to point to streaming endpoint with its actual UUID
    const updated = await prisma.track.update({
      where: { id: track.id },
      data: {
        audioUrl: `http://localhost:5000/api/v1/tracks/stream/${track.id}`,
      },
    });
    createdTracks.push(updated);
  }

  console.log(`[Seed] Created ${createdTracks.length} realistic tracks with streaming audio.`);

  // Create Playlists
  const playlistTopHits = await prisma.playlist.create({
    data: {
      name: "Today's Top Hits",
      description: 'The hottest tracks right now across pop, electronic, and R&B.',
      coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      isPublic: true,
      userId: adminUser.id,
    },
  });

  const playlistChill = await prisma.playlist.create({
    data: {
      name: 'Chill Lofi Beats',
      description: 'Relaxing beats to study, chill, or code to. Keep your focus high.',
      coverArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      isPublic: true,
      userId: artistUser.id,
    },
  });

  const playlistSynth = await prisma.playlist.create({
    data: {
      name: 'Synthwave Sunset',
      description: 'Retrofuturistic 80s outrun sounds for high-speed night drives.',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
      isPublic: true,
      userId: adminUser.id,
    },
  });

  const playlistAlexFavorites = await prisma.playlist.create({
    data: {
      name: "Alex's Road Trip",
      description: 'Personal playlist created by Alex for weekend getaways.',
      coverArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop&q=80',
      isPublic: true,
      userId: listenerUser.id,
    },
  });

  // Add tracks to playlists
  const topHitsTrackIndices = [0, 3, 8, 1, 9];
  for (let i = 0; i < topHitsTrackIndices.length; i++) {
    await prisma.playlistTrack.create({
      data: {
        playlistId: playlistTopHits.id,
        trackId: createdTracks[topHitsTrackIndices[i]].id,
        order: i,
      },
    });
  }

  const chillTrackIndices = [3, 4, 5, 6];
  for (let i = 0; i < chillTrackIndices.length; i++) {
    await prisma.playlistTrack.create({
      data: {
        playlistId: playlistChill.id,
        trackId: createdTracks[chillTrackIndices[i]].id,
        order: i,
      },
    });
  }

  const synthTrackIndices = [0, 1, 2, 7];
  for (let i = 0; i < synthTrackIndices.length; i++) {
    await prisma.playlistTrack.create({
      data: {
        playlistId: playlistSynth.id,
        trackId: createdTracks[synthTrackIndices[i]].id,
        order: i,
      },
    });
  }

  const alexIndices = [0, 3, 4, 8];
  for (let i = 0; i < alexIndices.length; i++) {
    await prisma.playlistTrack.create({
      data: {
        playlistId: playlistAlexFavorites.id,
        trackId: createdTracks[alexIndices[i]].id,
        order: i,
      },
    });
  }

  // Like tracks for listenerUser
  const likedIndices = [0, 1, 3, 4, 8];
  for (const idx of likedIndices) {
    await prisma.likedTrack.create({
      data: {
        userId: listenerUser.id,
        trackId: createdTracks[idx].id,
      },
    });
  }

  console.log('[Seed] Database populated successfully with realistic music catalogue, playlists, and RBAC accounts!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
