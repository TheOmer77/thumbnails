const ffmpeg = require('fluent-ffmpeg');
const { Readable, PassThrough } = require('stream');
const { readFile, unlink } = require('fs/promises');

exports.upload = (req, res) => {
  const { file } = req;
  if (!file)
    return res.status(400).send({
      success: false,
      error:
        "File not provided, or it's not the right file type (only mp4 files are supported).",
    });
  return res.send({
    success: true,
    url: res.req.file.path,
    fileName: res.req.file.filename,
  });
};

/** NOTE: Sometimes this will take a while, so maybe it's best to just generate and save the thumbnail
 * on video upload, and then allow access to the pre generated thumbnail.
 * ALSO, THIS REQUIRES FFMPEG TO BE INSTALLED */
exports.getThumbnail = async (req, res) => {
  const { filename } = req.params;
  const filepath = `tmp/${filename}`;
  /**
   * For the file path, you can use a file from the uploads folder on this server.
   * const filepath = `uploads/${filename}`;
   * Or how about this - YOU CAN USE A URL!
   * const filepath = 'https://res.cloudinary.com/dah7e44av/video/upload/v1616073895/youtube/pfft9yzwtfkdvqjp1spo.mp4'
   * Or even access another route on this server...
   * const filepath = `${req.protocol}://${req.get('host')}/some/other/route`
   */

  try {
    ffmpeg.ffprobe(filepath, (err, data) => {
      if (!err) {
        // Get the duration of the video
        const { streams } = data;
        const { duration } = streams[0];
        ffmpeg(filepath)
          // Take a screenshot from the middle of the video (duration / 2)
          .setStartTime(parseFloat(duration) / 2)
          .outputOptions('-vframes 1')
          .outputOptions('-f image2pipe')
          .outputOptions('-vcodec png')
          .writeToStream(res);
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

exports.instantThumbnail = (req, res, next) => {
  const { file } = req;
  if (!file)
    return res.status(400).send({
      success: false,
      error:
        "File not provided, or it's not the right file type (only mp4 files are supported).",
    });
  try {
    const passthrough = new PassThrough();
    const probeStream = Readable.from(file.buffer);
    const fileStream = Readable.from(file.buffer);
    ffmpeg()
      .input(probeStream)
      .ffprobe((err, data) => {
        if (!err) {
          const { duration } = data.streams[0];
          ffmpeg()
            .input(fileStream)
            // Take a screenshot from the middle of the video (duration / 2)
            .setStartTime(parseFloat(duration) / 2)
            .outputOptions('-vframes 1')
            .outputOptions('-f image2pipe')
            .outputOptions('-vcodec png')
            .writeToStream(passthrough);
          console.log(passthrough.read());
        }
      });
  } catch (err) {}
};

exports.getInfo = async (req, res) => {
  const { filename } = req.params;
  try {
    ffmpeg.ffprobe(`uploads/${filename}`, (err, data) =>
      res.send({ success: true, info: data })
    );
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

exports.convertToMkv = async (req, res) => {
  const { file } = req;
  if (!file)
    return res.status(400).send({
      success: false,
      error:
        "File not provided, or it's not the right file type (only mp4 files are supported).",
    });
  const outputPath = `${file.path.substring(
    0,
    file.path.lastIndexOf('.')
  )}.mkv`;
  await converter(file, outputPath);
  await unlink(file.path);

  const outputFile = await readFile(outputPath);
  res.write(outputFile, 'binary');
  await unlink(outputPath);
  res.end();
};

const converter = (file, outputPath) =>
  new Promise((resolve, reject) => {
    let currentProgress = 0;
    ffmpeg(`${file.path}`)
      .withOutputFormat('matroska')
      .on('progress', (progress) => {
        if (currentProgress !== parseInt(progress.percent)) {
          console.log(
            `Converting ${file.originalname}, ${parseInt(progress.percent)}%`
          );
          currentProgress = parseInt(progress.percent);
        }
      })
      .on('end', () => {
        console.log(`Done converting ${file.originalname}.`);
        resolve();
      })
      .output(outputPath)
      .on('error', reject)
      .run();
  });
