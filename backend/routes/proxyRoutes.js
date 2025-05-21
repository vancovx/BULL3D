// backend/routes/proxyRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { driveService } = require('../middleware/googleDriveMiddleware');

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

// Proxy route for downloading Google Drive files
router.get('/download/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileName = req.query.name || 'download';
    
    // Usar el servicio de Google Drive para obtener una URL de descarga directa
    // (Asumiendo que tienes un método getFileMetadata en driveService)
    const fileMetadata = await driveService.drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType'
    });
    
    // Obtener el archivo usando axios
    const response = await axios({
      url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'Authorization': `Bearer ${await driveService.getAccessToken()}`
      }
    });
    
    // Configurar headers para descarga
    const contentDisposition = `attachment; filename="${fileMetadata.data.name || fileName}"`;
    res.set('Content-Disposition', contentDisposition);
    res.set('Content-Type', fileMetadata.data.mimeType || 'application/octet-stream');
    
    // Enviar el archivo al cliente
    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading Google Drive file:', error);
    res.status(500).send('Error downloading file');
  }
});

module.exports = router;