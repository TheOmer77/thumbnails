const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

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
  const filepath = `uploads/${filename}`;
  /**
   * For the file path, you can use a file from the uploads folder on this server.
   * const filepath = `uploads/${filename}`;
   * Or how about this - YOU CAN USE A URL!
   * const filepath = 'https://res.cloudinary.com/dah7e44av/video/upload/v1616073895/youtube/pfft9yzwtfkdvqjp1spo.mp4'
   * Or even access another route on this server...
   * const filepath = `${req.protocol}://${req.get('host')}/some/other/route`
   */

  try {
    // Get the duration of the video
    const { streams } = await ffprobe(filepath, { path: ffprobeStatic.path });
    const { duration } = streams[0];

    ffmpeg(filepath)
      // Take a screenshot from the middle of the video (duration / 2)
      .setStartTime(parseFloat(duration) / 2)
      .outputOptions('-vframes 1')
      .outputOptions('-f image2pipe')
      .outputOptions('-vcodec png')
      .writeToStream(res);
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

exports.getInfo = async (req, res) => {
  const { filename } = req.params;
  try {
    const info = await ffprobe(`uploads/${filename}`, {
      path: ffprobeStatic.path,
    });
    res.send({ success: true, info });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};
