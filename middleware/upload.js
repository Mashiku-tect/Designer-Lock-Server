// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/mkv",
    "video/quicktime",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
    files: 10, // max 10 files
  },
});

// ✅ Wrapper middleware to catch and respond to errors
const uploadMiddleware = (req, res, next) => {
  const uploadHandler = upload.array("files", 10);

  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle known Multer errors
      let message = "Upload error";

      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File too large. Maximum size is 200MB.";
      } else if (err.code === "LIMIT_FILE_COUNT") {
        message = "You can only upload up to 10 files.";
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Invalid file type. Only images and videos are allowed.";
      }

      return res.status(400).json({ success: false, message });
    } else if (err) {
      // Handle unknown errors
      return res
        .status(400)
        .json({ success: false, message: err.message || "Upload failed." });
    }

    // ✅ If no errors, continue
    next();
  });
};

module.exports = uploadMiddleware;
