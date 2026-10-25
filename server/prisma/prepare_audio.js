const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const audioDir = path.join(__dirname, '../media/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Generates a valid RIFF WAV audio buffer (stereo, 44.1kHz, 16-bit) with pleasant harmonic chords
function generateMelodicWavBuffer(durationSec = 20, baseFreq = 440) {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const totalSamples = sampleRate * durationSec;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant harmonic chord progression (I - V - vi - IV)
  const chordRoots = [baseFreq, baseFreq * (3/2), baseFreq * (5/3), baseFreq * (4/3)];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / (durationSec / 4))) % 4;
    const root = chordRoots[chordIndex];

    const note1 = Math.sin(2 * Math.PI * root * t);
    const note2 = Math.sin(2 * Math.PI * root * 1.25 * t) * 0.7;
    const note3 = Math.sin(2 * Math.PI * root * 1.5 * t) * 0.6;
    const note4 = Math.sin(2 * Math.PI * (root * 2) * t) * 0.3;

    const envelope = Math.min(1, Math.min(t * 2, (durationSec - t) * 2));
    const sampleVal = (note1 + note2 + note3 + note4) * 0.25 * envelope;

    const sample16 = Math.max(-32767, Math.min(32767, Math.floor(sampleVal * 32767)));
    const offset = 44 + i * blockAlign;
    buffer.writeInt16LE(sample16, offset);     // Left channel
    buffer.writeInt16LE(sample16, offset + 2); // Right channel
  }

  return buffer;
}

const sampleTracks = [
  { file: 'track-1.mp3', url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3', freq: 440, duration: 30 },
  { file: 'track-2.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', freq: 392, duration: 35 },
  { file: 'track-3.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', freq: 349, duration: 28 },
  { file: 'track-4.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', freq: 523, duration: 40 },
  { file: 'track-5.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', freq: 493, duration: 32 },
  { file: 'track-6.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', freq: 440, duration: 36 },
  { file: 'track-7.mp3', url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3', freq: 330, duration: 25 },
  { file: 'track-8.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', freq: 587, duration: 33 },
  { file: 'track-9.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', freq: 261, duration: 45 },
  { file: 'track-10.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', freq: 440, duration: 30 },
];

async function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;

    const fileStream = fs.createWriteStream(destPath);
    const req = client.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, destPath).then(resolve);
        return;
      }

      if (res.statusCode !== 200) {
        fileStream.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
        return;
      }

      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
    });

    req.on('error', () => {
      fileStream.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      fileStream.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

async function prepareAllAudio() {
  console.log('[Audio Prep] Ensuring all 10 audio files are present in server/media/audio...');

  for (let i = 0; i < sampleTracks.length; i++) {
    const track = sampleTracks[i];
    const filePath = path.join(audioDir, track.file);

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
      continue;
    }

    console.log(`[Audio Prep] Preparing ${track.file}...`);
    let downloaded = false;
    try {
      downloaded = await downloadFile(track.url, filePath);
    } catch {
      downloaded = false;
    }

    if (!downloaded || !fs.existsSync(filePath) || fs.statSync(filePath).size < 10000) {
      const wavBuffer = generateMelodicWavBuffer(track.duration, track.freq);
      fs.writeFileSync(filePath, wavBuffer);
    }
  }

  console.log('[Audio Prep] All 10 audio tracks are verified and ready on disk.');
}

module.exports = {
  prepareAllAudio,
};

if (require.main === module) {
  prepareAllAudio().then(() => process.exit(0));
}
