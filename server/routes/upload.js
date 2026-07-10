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
    fileSize: 10 * 1024 * 1024
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const extension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const documentExtensions = [
      "pdf",
      "doc",
      "docx"
    ];

    const resourceType = documentExtensions.includes(extension)
      ? "raw"
      : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "educarepoint-products",
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {

        if (error) {
          console.log(error);

          return res.status(500).json({
            success: false,
            message: "Upload failed"
          });
        }

        res.json({
          success: true,
          fileUrl: result.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });

      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
});

module.exports = router;