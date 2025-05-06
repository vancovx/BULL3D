const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy route for Google Drive images
router.get('/image/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const googleDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Use axios to fetch the file
    const response = await axios.get(googleDriveUrl, {
      responseType: 'stream',
      headers: {
        'Referer': 'https://drive.google.com/uc?export=view',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Set appropriate headers
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Pipe the response to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying Google Drive file:', error);
    res.status(500).send('Error fetching image');
  }
});

module.exports = router;