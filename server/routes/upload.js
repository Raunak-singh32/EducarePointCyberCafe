const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Store file in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB max (Render free tier safe)
  }
});

// ── Helper: Upload buffer to Cloudinary with Promise ──
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('Uploading file:', req.file.originalname, 'Size:', req.file.size);

    const extension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const documentExtensions = ["pdf", "doc", "docx"];
    const resourceType = documentExtensions.includes(extension) ? "raw" : "image";

    // ── Use Promise-based upload for better error handling ──
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "educarepoint-products",
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      // Timeout for Render free tier
      timeout: 60000
    });

    console.log('Upload successful:', result.secure_url);

    res.json({
      success: true,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

  } catch (err) {
    console.error('Upload route error:', err);
    
    // Specific error messages
    if (err.message && err.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: "Upload timed out. File may be too large."
      });
    }
    
    if (err.message && err.message.includes('authentication')) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary config error. Check env vars."
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || "Upload failed"
    });
  }
});

// ── NEW: Health check for upload route ──
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Upload service ready",
    cloudinary: !!cloudinary.config().cloud_name 
  });
});
// TEMPORARY: Test Cloudinary connection
router.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, cloudinary: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;