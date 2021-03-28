const express = require('express');
const router = express.Router();

const {
  upload,
  getThumbnail,
  getInfo,
  instantThumbnail,
  convertToMkv,
} = require('../controllers/thumbnail.js');

router.get('/thumbnail/:filename', getThumbnail);
router.get('/info/:filename', getInfo);
router.post('/upload', upload);
router.post('/instantThumbnail', instantThumbnail);
router.post('/convertToMkv', convertToMkv);

module.exports = router;
