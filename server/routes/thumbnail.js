const express = require('express');
const router = express.Router();

const {
  upload,
  getThumbnail,
  getInfo,
} = require('../controllers/thumbnail.js');

router.get('/thumbnail/:filename', getThumbnail);
router.get('/info/:filename', getInfo);
router.post('/upload', upload);

module.exports = router;
