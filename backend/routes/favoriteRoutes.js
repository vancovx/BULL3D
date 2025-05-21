// backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// Rutas protegidas (requieren autenticación)
router.post('/', protect, addFavorite);
router.delete('/:assetId', protect, removeFavorite);
router.get('/', protect, getFavorites);
router.get('/check/:assetId', protect, checkFavorite);

module.exports = router;