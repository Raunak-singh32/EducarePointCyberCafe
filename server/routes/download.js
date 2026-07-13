const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');

// Backend proxy: fetches file from Cloudinary and streams it to admin
// This fixes the multi-page PDF download issue because:
// 1. Backend fetches directly from Cloudinary (no CORS issues)
// 2. We set Content-Disposition: attachment header ourselves
// 3. Admin downloads from our own backend, not Cloudinary
router.get('/', (req, res) => {
  try {
    const { fileUrl, fileName } = req.query;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is required' });
    }

    // Security: only allow Cloudinary URLs
    if (!fileUrl.includes('cloudinary.com')) {
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