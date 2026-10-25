const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const prisma = require('../prisma');

const streamTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
      include: { artist: true, album: true },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Increment play count asynchronously
    prisma.track.update({
      where: { id },
      data: { plays: { increment: 1 } },
    }).catch(err => console.error('Failed to increment play count:', err));

    // Determine audio source: local file or remote URL
    let localFilePath = null;
    if (track.filePath) {
      const candidatePath = path.isAbsolute(track.filePath)
        ? track.filePath
        : path.join(__dirname, '../../', track.filePath);
      if (fs.existsSync(candidatePath)) {
        localFilePath = candidatePath;
      }
    }

    // If local file exists, serve with standard HTTP 206 Partial Content
    if (localFilePath) {
      const stat = fs.statSync(localFilePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Parse Range Header e.g., "bytes=0-1048576" or "bytes=0-"
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          return res.status(416).set({
            'Content-Range': `bytes */${fileSize}`,
          }).send('Requested range not satisfiable');
        }

        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(localFilePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache',
        });

        fileStream.pipe(res);
        return;
      } else {
        // No Range header provided: return full content
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
        });

        fs.createReadStream(localFilePath).pipe(res);
        return;
      }
    }

    // If no local file but has audioUrl, proxy the remote stream preserving Range headers
    if (track.audioUrl) {
      const isHttps = track.audioUrl.startsWith('https:');
      const client = isHttps ? https : http;

      const requestHeaders = {};
      if (req.headers.range) {
        requestHeaders['Range'] = req.headers.range;
      }
      requestHeaders['User-Agent'] = 'SpotifyCloneServer/1.0';

      const proxyReq = client.get(track.audioUrl, { headers: requestHeaders }, (proxyRes) => {
        const statusCode = proxyRes.statusCode || 200;
        const responseHeaders = {
          'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        };

        if (proxyRes.headers['content-range']) {
          responseHeaders['Content-Range'] = proxyRes.headers['content-range'];
        }
        if (proxyRes.headers['content-length']) {
          responseHeaders['Content-Length'] = proxyRes.headers['content-length'];
        }

        res.writeHead(statusCode, responseHeaders);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('Remote audio stream error:', err);
        res.status(502).json({ error: 'Failed to fetch remote audio stream' });
      });

      return;
    }

    res.status(404).json({ error: 'Audio source not available for this track' });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error during audio streaming' });
  }
};

module.exports = {
  streamTrack,
};
