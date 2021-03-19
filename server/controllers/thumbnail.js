const ffmpeg = require('fluent-ffmpeg');

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

/** NOTE: Sometimes this will take a while, so maybe it's best to just generate and save the thumnail
 * on video upload, and then allow access to the pre generated thumbnail.
 * ALSO, THIS REQUIRES FFMPEG TO BE INSTALLED */
exports.getThumbnail = async (req, res) => {
  const { filename } = req.params;
  ffmpeg(
    `uploads/${filename}`
    // OR, HOW ABOUT THIS - YOU CAN USE A URL HERE!!!!
    // 'https://res.cloudinary.com/dah7e44av/video/upload/v1616073895/youtube/pfft9yzwtfkdvqjp1spo.mp4'
    // Or access another route in this server
    // `${req.protocol}://${req.get('host')}${req.originalUrl}`
  )
    .setStartTime('0:15') // TODO: Find the length of a video, then take a screenshot from the middle
    .outputOptions('-vframes 1')
    .outputOptions('-f image2pipe')
    .outputOptions('-vcodec png')
    .writeToStream(res);
};
