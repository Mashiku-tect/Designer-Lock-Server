// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Set up storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profileimages'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// Filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  cb(null, isValid);
};

// Final multer upload handler
const upload = multer({ storage, fileFilter });

module.exports = upload;
