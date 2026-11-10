const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// POST /api/upload - Supports both customer document uploads & admin product images (no auth barrier)
router.post("/", upload.single("image"), catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('No file uploaded', 400));

    const extension = req.file.originalname.split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"];
    if (!allowedExtensions.includes(extension)) {
        return next(new AppError(`Unsupported file format .${extension}. Allowed: ${allowedExtensions.join(', ')}`, 400));
    }

    const isRaw = ["pdf", "doc", "docx"].includes(extension);
    const resourceType = isRaw ? "raw" : "image";
    const folder = isRaw ? "educarepoint-customer-files" : "educarepoint-products";

    let result;
    try {
        result = await uploadToCloudinary(req.file.buffer, {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            timeout: 60000
        });
    } catch (err) {
        if (err.message?.includes('timeout')) return next(new AppError('Upload timed out. File may be too large.', 504));
        if (err.message?.includes('authentication')) return next(new AppError('Cloudinary config error. Check env vars.', 500));
        return next(new AppError(err.message || 'Upload failed', 500));
    }

    res.json({
        success: true,
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size
    });
}));

router.get("/health", (req, res) => {
    res.json({ success: true, message: "Upload service ready", cloudinary: !!cloudinary.config().cloud_name });
});

router.get("/test-cloudinary", catchAsync(async (req, res, next) => {
    const result = await cloudinary.api.ping();
    res.json({ success: true, cloudinary: result });
}));

module.exports = router;
