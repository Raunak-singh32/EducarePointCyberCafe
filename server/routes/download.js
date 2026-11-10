const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const jwt = require('jsonwebtoken');

// Backend proxy: fetches file from Cloudinary and streams it to admin with Content-Disposition
// Supports token in Authorization header OR in ?token= query parameter (for window.open downloads)
router.get('/', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) || req.query.token;

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
      ? decodeURIComponent(fileName).replace(/[^\w.\-\s]/g, '_')
      : 'order-file.pdf';

    const protocol = fileUrl.startsWith('https') ? https : http;

    const request = protocol.get(fileUrl, (cloudRes) => {
      // Handle HTTP redirects from Cloudinary
      if (cloudRes.statusCode === 301 || cloudRes.statusCode === 302) {
        const redirectUrl = cloudRes.headers.location;
        const redirectProtocol = redirectUrl.startsWith('https') ? https : http;

        redirectProtocol.get(redirectUrl, (redirectRes) => {
          res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
          res.setHeader('Content-Type', redirectRes.headers['content-type'] || 'application/octet-stream');
          res.setHeader('Access-Control-Allow-Origin', '*');
          redirectRes.pipe(res);
        }).on('error', (err) => {
          console.error('Redirect download error:', err);
          if (!res.headersSent) res.status(500).json({ success: false, message: 'Redirect failed' });
        });
        return;
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
