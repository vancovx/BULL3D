const asyncHandler = require('express-async-handler');
const Favorite = require('../models/favoriteModel');
const Asset = require('../models/assetModel');

// @desc    Add asset to favorites
// @route   POST /api/favorites
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { assetId } = req.body;

  // Verificar que el asset existe
  const asset = await Asset.findById(assetId);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  // Verificar si ya está en favoritos
  const existingFavorite = await Favorite.findOne({
    user: req.user.id,
    asset: assetId,
  });

  if (existingFavorite) {
    res.status(400);
    throw new Error('Asset already in favorites');
  }

  // Crear favorito
  const favorite = await Favorite.create({
    user: req.user.id,
    asset: assetId,
  });

  res.status(201).json(favorite);
});

// @desc    Remove asset from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  // Buscar el favorito
  const favorite = await Favorite.findOne({
    user: req.user.id,
    asset: assetId,
  });

  if (!favorite) {
    res.status(404);
    throw new Error('Favorite not found');
  }

  // Eliminar el favorito
  await favorite.remove();

  res.status(200).json({ assetId, message: 'Asset removed from favorites' });
});

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  // Obtener todos los favoritos del usuario
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'asset',
      select: 'title description category coverImageUrl tags',
    })
    .sort({ createdAt: -1 });

  res.status(200).json(favorites);
});

// @desc    Check if asset is in favorites
// @route   GET /api/favorites/check/:assetId
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  // Verificar si el asset está en favoritos
  const favorite = await Favorite.findOne({
    user: req.user.id,
    asset: assetId,
  });

  res.status(200).json({ isFavorite: favorite ? true : false });
});

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
};