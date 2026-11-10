const express = require('express');
const router = express.Router();
const https = require('https');
const jwt = require('jsonwebtoken');

// Backend proxy: fetches file from Cloudinary and streams it to admin with Content-Disposition
// Admin JWT is accepted only in the Authorization header.
router.get('/', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized - no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Administrator access required' });
      }
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }

    const { fileUrl, fileName } = req.query;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is required' });
    }

    // Security: only allow Cloudinary URLs
    let parsedUrl;
    try {
      parsedUrl = new URL(fileUrl);
    } catch (_) {
      return res.status(400).json({ success: false, message: 'Invalid file source' });
    }
    const isCloudinaryHost = parsedUrl.hostname === 'cloudinary.com' ||
      parsedUrl.hostname.endsWith('.cloudinary.com');
    if (parsedUrl.protocol !== 'https:' || !isCloudinaryHost) {
      return res.status(400).json({ success: false, message: 'Invalid file source' });
    }

    // Decode and sanitize filename
    const safeFileName = fileName
      ? String(fileName).replace(/[^\w.\-\s]/g, '_')
      : 'order-file.pdf';

    const protocol = https;

    const request = protocol.get(fileUrl, (cloudRes) => {
      // Handle HTTP redirects from Cloudinary
      if (cloudRes.statusCode === 301 || cloudRes.statusCode === 302) {
        cloudRes.resume();
        return res.status(502).json({ success: false, message: 'Cloud file redirects are not supported' });
      }
      if (cloudRes.statusCode < 200 || cloudRes.statusCode >= 300) {
        cloudRes.resume();
        return res.status(502).json({ success: false, message: 'Cloud file could not be downloaded' });
      }

      // Stream file to admin with download headers
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      res.setHeader('Content-Type', cloudRes.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (cloudRes.headers['content-length']) {
        res.setHeader('Content-Length', cloudRes.headers['content-length']);
      }

      cloudRes.pipe(res);
    });

    request.on('error', (err) => {
      console.error('Cloudinary fetch error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to fetch file from cloud' });
      }
    });

  } catch (err) {
    console.error('Download route error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

module.exports = router;
