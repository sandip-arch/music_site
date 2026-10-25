const prisma = require('../prisma');

const search = async (req, res) => {
  try {
    const query = ((req.query.q) || '').trim();

    if (!query) {
      return res.json({
        tracks: [],
        artists: [],
        albums: [],
      });
    }

    const [tracks, artists, albums] = await Promise.all([
      prisma.track.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { artist: { name: { contains: query } } },
          ],
        },
        take: 10,
        include: {
          artist: { select: { id: true, name: true, image: true, isVerified: true } },
          album: { select: { id: true, title: true, coverArt: true, releaseYear: true } },
        },
      }),
      prisma.artist.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { bio: { contains: query } },
          ],
        },
        take: 8,
        include: {
          albums: { take: 3 },
          _count: { select: { tracks: true } },
        },
      }),
      prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { artist: { name: { contains: query } } },
          ],
        },
        take: 8,
        include: {
          artist: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Compute top result (closest match)
    let topResult = null;
    if (artists.length > 0 && artists[0].name.toLowerCase().startsWith(query.toLowerCase())) {
      topResult = { type: 'artist', data: artists[0] };
    } else if (tracks.length > 0) {
      topResult = { type: 'track', data: tracks[0] };
    } else if (albums.length > 0) {
      topResult = { type: 'album', data: albums[0] };
    }

    res.json({
      query,
      topResult,
      tracks,
      artists,
      albums,
    });
  } catch (error) {
    console.error('search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = {
  search,
};
