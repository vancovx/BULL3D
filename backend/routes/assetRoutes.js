const express = require('express');
const router = express.Router();
const { 
  getAssets, 
  getUserAssets,
  getAssetById, 
  createAsset, 
  updateAsset, 
  deleteAsset 
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../middleware/googleDriveMiddleware');

// Public routes (no authentication required)
router.get('/', getAssets);
router.get('/user/:userId', getUserAssets);
router.get('/:id', getAssetById);

// Protected routes (authentication required)
// En assetRoutes.js, modifica la ruta POST para procesar los tags
router.post(
  '/', 
  protect,
  uploadMiddleware.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'content', maxCount: 1 }
  ]),
  // Middleware para procesar tags desde un string separado por comas
  (req, res, next) => {
    if (req.body.tags && typeof req.body.tags === 'string') {
      // Dividir el string de tags por comas, eliminar espacios en blanco y filtrar valores vacíos
      req.body.tags = req.body.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      // Verificar que no haya más de 5 tags
      if (req.body.tags.length > 5) {
        return res.status(400).json({ message: 'Tags cannot exceed 5 items' });
      }
    }
    next();
  },
  createAsset
);

// Similar para la ruta PUT
router.put(
  '/:id',
  protect, 
  uploadMiddleware.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'content', maxCount: 1 }
  ]),
  // Middleware para procesar tags
  (req, res, next) => {
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      if (req.body.tags.length > 5) {
        return res.status(400).json({ message: 'Tags cannot exceed 5 items' });
      }
    }
    next();
  },
  updateAsset
);

router.delete('/:id', protect, deleteAsset);

module.exports = router;