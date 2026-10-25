const prisma = require('../prisma');

const getTracks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const albumId = req.query.albumId;
    const artistId = req.query.artistId;

    const where = {};
    if (albumId) where.albumId = albumId;
    if (artistId) where.artistId = artistId;

    const [total, tracks] = await Promise.all([
      prisma.track.count({ where }),
      prisma.track.findMany({
        where,
        skip,
        take: limit,
        include: {
          artist: {
            select: { id: true, name: true, image: true, isVerified: true },
          },
          album: {
            select: { id: true, title: true, coverArt: true, releaseYear: true },
          },
        },
        orderBy: { plays: 'desc' },
      }),
    ]);

    res.json({
      data: tracks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getTracks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tracks' });
  }
};

const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
      },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    console.error('getTrackById error:', error);
    res.status(500).json({ error: 'Failed to retrieve track' });
  }
};

const createTrack = async (req, res) => {
  try {
    const { title, duration, audioUrl, albumId, artistId } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ error: 'Title and duration are required' });
    }

    let effectiveArtistId = artistId;
    if (req.user && req.user.role === 'ARTIST') {
      const artistProfile = await prisma.artist.findUnique({
        where: { userId: req.user.id },
      });
      if (artistProfile) {
        effectiveArtistId = artistProfile.id;
      }
    }

    if (!effectiveArtistId) {
      const firstArtist = await prisma.artist.findFirst();
      if (firstArtist) {
        effectiveArtistId = firstArtist.id;
      } else {
        return res.status(400).json({ error: 'Artist ID required' });
      }
    }

    const newTrack = await prisma.track.create({
      data: {
        title,
        duration: parseInt(duration, 10),
        audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        artistId: effectiveArtistId,
        albumId: albumId || null,
      },
      include: {
        artist: true,
        album: true,
      },
    });

    res.status(201).json(newTrack);
  } catch (error) {
    console.error('createTrack error:', error);
    res.status(500).json({ error: 'Failed to create track' });
  }
};

// Deleting song: STRICTLY ACCESSIBLE ONLY BY ADMIN
const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied. Deleting songs is accessible strictly only by Administrators.',
      });
    }

    const track = await prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Safely delete foreign key references in PlaylistTrack & LikedTrack first
    await prisma.$transaction([
      prisma.likedTrack.deleteMany({ where: { trackId: id } }),
      prisma.playlistTrack.deleteMany({ where: { trackId: id } }),
      prisma.track.delete({ where: { id } }),
    ]);

    res.json({ message: 'Track deleted successfully by Admin', trackId: id });
  } catch (error) {
    console.error('deleteTrack error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
};

const toggleLikeTrack = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: trackId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.likedTrack.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (existingLike) {
      await prisma.likedTrack.delete({
        where: { id: existingLike.id },
      });
      res.json({ liked: false, trackId });
    } else {
      await prisma.likedTrack.create({
        data: {
          userId,
          trackId,
        },
      });
      res.json({ liked: true, trackId });
    }
  } catch (error) {
    console.error('toggleLikeTrack error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

const getLikedTracks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const liked = await prisma.likedTrack.findMany({
      where: { userId: req.user.id },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    res.json(liked.map((item) => item.track));
  } catch (error) {
    console.error('getLikedTracks error:', error);
    res.status(500).json({ error: 'Failed to get liked tracks' });
  }
};

module.exports = {
  getTracks,
  getTrackById,
  createTrack,
  deleteTrack,
  toggleLikeTrack,
  getLikedTracks,
};
