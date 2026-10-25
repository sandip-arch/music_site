const prisma = require('../prisma');

const getArtists = async (_req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        _count: { select: { tracks: true, albums: true } },
      },
      orderBy: { monthlyListeners: 'desc' },
    });
    res.json(artists);
  } catch (error) {
    console.error('getArtists error:', error);
    res.status(500).json({ error: 'Failed to retrieve artists' });
  }
};

const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          include: {
            _count: { select: { tracks: true } },
          },
        },
        tracks: {
          take: 10,
          orderBy: { plays: 'desc' },
          include: {
            album: { select: { id: true, title: true, coverArt: true } },
          },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    console.error('getArtistById error:', error);
    res.status(500).json({ error: 'Failed to retrieve artist' });
  }
};

module.exports = {
  getArtists,
  getArtistById,
};
