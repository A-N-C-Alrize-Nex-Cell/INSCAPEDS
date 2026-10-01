const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

console.log("Starting high-quality video compression...");
console.log("This will apply 'faststart' web optimization and visually lossless compression.");

ffmpeg(path.join(__dirname, 'public', 'hero.mp4'))
  .videoCodec('libx264')
  .outputOptions([
    '-crf 20', // Visually lossless high quality
    '-preset fast',
    '-movflags +faststart', // THIS makes the video load instantly on the web
    '-pix_fmt yuv420p',
    '-an' // Remove audio track since the video is muted anyway (saves tons of space)
  ])
  .output(path.join(__dirname, 'public', 'hero_optimized.mp4'))
  .on('end', () => {
    console.log('Video compression finished successfully!');
  })
  .on('error', (err) => {
    console.error('Error compressing video:', err);
  })
  .on('progress', (progress) => {
    if (progress.percent) {
      console.log(`Processing: ${Math.round(progress.percent)}% done`);
    }
  })
  .run();
