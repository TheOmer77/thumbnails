const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { mkdir } = require('fs');

const thumbnailRouter = require('./routes/thumbnail');

const PORT = process.env.PORT || 5000;

const app = express();

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) =>
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
// Only mp4 files are accepted
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4') cb(null, true);
  else cb(null, false);
};

// Middleware
app.use(express.json());
app.use(cors());
app.use(multer({ storage, fileFilter }).single('file'));

// Routes
app.use('/api', thumbnailRouter);

mkdir('tmp/', () =>
  app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[42m\x1b[30mServer is listening on port ${PORT}.\x1b[0m`);
  })
);
