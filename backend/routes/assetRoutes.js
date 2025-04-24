const express = require('express');
const router = express.Router();
const { 
  getAssets, 
  getAssetById, 
  createAsset, 
  updateAsset, 
  deleteAsset 
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../middleware/googleDriveMiddleware');

// Rutas para los assets
router.route('/')
  .get(protect, getAssets)
  .post(
    protect, 
    uploadMiddleware.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
      { name: 'content', maxCount: 1 }
    ]), 
    createAsset
  );

router.route('/:id')
  .get(protect, getAssetById)
  .put(
    protect, 
    uploadMiddleware.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
      { name: 'content', maxCount: 1 }
    ]), 
    updateAsset
  )
  .delete(protect, deleteAsset);

module.exports = router;