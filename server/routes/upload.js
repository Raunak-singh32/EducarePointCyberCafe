const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST upload file to Cloudinary
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  // req.file.path is the Cloudinary URL
  res.json({
    success: true,
    fileUrl: req.file.path,
    fileName: req.file.originalname,
    fileSize: req.file.size
  });
});

module.exports = router;