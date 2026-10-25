const prisma = require('../prisma');

const getAlbums = async (_req, res) => {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: { select: { id: true, name: true, image: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { releaseYear: 'desc' },
    });
    res.json(albums);
  } catch (error) {
    console.error('getAlbums error:', error);
    res.status(500).json({ error: 'Failed to retrieve albums' });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: {
          include: {
            artist: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const totalDuration = album.tracks.reduce((sum, t) => sum + t.duration, 0);

    res.json({
      ...album,
      totalDuration,
      trackCount: album.tracks.length,
    });
  } catch (error) {
    console.error('getAlbumById error:', error);
    res.status(500).json({ error: 'Failed to retrieve album' });
  }
};

const createAlbum = async (req, res) => {
  try {
    const { title, coverArt, releaseYear, artistId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Album title is required' });
    }

    let effectiveArtistId = artistId;
    if (req.user && req.user.role === 'ARTIST') {
      const artist = await prisma.artist.findUnique({ where: { userId: req.user.id } });
      if (artist) effectiveArtistId = artist.id;
    }

    if (!effectiveArtistId) {
      const firstArtist = await prisma.artist.findFirst();
      if (firstArtist) effectiveArtistId = firstArtist.id;
      else {
        return res.status(400).json({ error: 'Artist is required' });
      }
    }

    const album = await prisma.album.create({
      data: {
        title,
        coverArt: coverArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60',
        releaseYear: releaseYear || new Date().getFullYear(),
        artistId: effectiveArtistId,
      },
      include: {
        artist: true,
      },
    });

    res.status(201).json(album);
  } catch (error) {
    console.error('createAlbum error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
};

module.exports = {
  getAlbums,
  getAlbumById,
  createAlbum,
};
