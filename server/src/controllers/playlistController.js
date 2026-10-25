const prisma = require('../prisma');

const getPlaylists = async (req, res) => {
  try {
    const userId = req.user?.id;

    const playlists = await prisma.playlist.findMany({
      where: {
        OR: [
          { isPublic: true },
          ...(userId ? [{ userId }] : []),
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(playlists);
  } catch (error) {
    console.error('getPlaylists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        tracks: {
          orderBy: { order: 'asc' },
          include: {
            track: {
              include: {
                artist: { select: { id: true, name: true } },
                album: { select: { id: true, title: true, coverArt: true } },
              },
            },
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.isPublic && (!req.user || req.user.id !== playlist.userId)) {
      return res.status(403).json({ error: 'This playlist is private' });
    }

    const totalDuration = playlist.tracks.reduce((acc, pt) => acc + (pt.track?.duration || 0), 0);

    res.json({
      ...playlist,
      totalDuration,
      trackCount: playlist.tracks.length,
    });
  } catch (error) {
    console.error('getPlaylistById error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
};

const createPlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to create a playlist' });
    }

    const { name, description, isPublic = true, coverArt } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const defaultCover = coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description || '',
        isPublic: isPublic !== false,
        coverArt: defaultCover,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { tracks: true } },
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error('createPlaylist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: playlistId } = req.params;
    const { trackId } = req.body;

    if (!trackId) {
      return res.status(400).json({ error: 'trackId is required' });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Track is already in this playlist' });
    }

    const count = await prisma.playlistTrack.count({
      where: { playlistId },
    });

    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        order: count,
      },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    res.status(201).json(playlistTrack);
  } catch (error) {
    console.error('addTrackToPlaylist error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
};

const removeTrackFromPlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: playlistId, trackId } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    await prisma.playlistTrack.deleteMany({
      where: {
        playlistId,
        trackId,
      },
    });

    res.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error('removeTrackFromPlaylist error:', error);
    res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
};

module.exports = {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
};
