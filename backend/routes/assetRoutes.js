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
router.post(
  '/', 
  protect,
  uploadMiddleware.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'content', maxCount: 1 }
  ]), 
  createAsset
);

router.put(
  '/:id',
  protect, 
  uploadMiddleware.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'content', maxCount: 1 }
  ]), 
  updateAsset
);

router.delete('/:id', protect, deleteAsset);

module.exports = router;