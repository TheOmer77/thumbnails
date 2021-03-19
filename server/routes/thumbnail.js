const express = require('express');
const router = express.Router();

const { upload, getThumbnail } = require('../controllers/thumbnail.js');

router.get('/thumbnail/:filename', getThumbnail);
router.post('/upload', upload);

module.exports = router;
