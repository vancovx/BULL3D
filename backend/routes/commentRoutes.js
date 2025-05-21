const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante para acceder a params de rutas padre
const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel');
const Asset = require('../models/assetModel');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get comments for a specific asset
// @route   GET /api/assets/:assetId/comments
// @access  Public
const getAssetComments = asyncHandler(async (req, res) => {
  const assetId = req.params.assetId;
  
  // Verificar que el asset existe
  const assetExists = await Asset.findById(assetId);
  if (!assetExists) {
    res.status(404);
    throw new Error('Asset not found');
  }
  
  // Obtener comentarios para este asset, ordenados por fecha de creación (más recientes primero)
  const comments = await Comment.find({ asset: assetId })
    .sort({ createdAt: -1 })
    .populate('user', 'name username'); // Incluir nombre y username del usuario
  
  res.status(200).json(comments);
});

// @desc    Create a new comment for an asset
// @route   POST /api/assets/:assetId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const assetId = req.params.assetId;
  const userId = req.user.id;
  
  // Validar datos
  if (!text) {
    res.status(400);
    throw new Error('Please provide comment text');
  }
  
  // Verificar que el asset existe
  const assetExists = await Asset.findById(assetId);
  if (!assetExists) {
    res.status(404);
    throw new Error('Asset not found');
  }
  
  // Crear el comentario
  const comment = await Comment.create({
    asset: assetId,
    user: userId,
    text,
    parentComment: req.body.parentComment || null // Para respuestas a otros comentarios
  });
  
  // Poblar los datos del usuario para devolverlos en la respuesta
  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'name username');
  
  res.status(201).json(populatedComment);
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  // Validar datos
  if (!text) {
    res.status(400);
    throw new Error('Please provide comment text');
  }
  
  // Buscar el comentario
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  
  // Verificar que el usuario es el autor del comentario
  if (comment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this comment');
  }
  
  // Actualizar el comentario
  comment.text = text;
  await comment.save();
  
  // Poblar los datos del usuario para la respuesta
  const updatedComment = await Comment.findById(comment._id)
    .populate('user', 'name username');
  
  res.status(200).json(updatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  // Buscar el comentario
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  
  // Verificar que el usuario es el autor del comentario
  if (comment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }
  
  // Eliminar el comentario
  await Comment.deleteOne({ _id: req.params.id });
  
  res.status(200).json({ id: req.params.id, message: 'Comment deleted successfully' });
});

// Rutas para /api/assets/:assetId/comments
if (router.name === 'router') { // Esta condición se cumple cuando se monta en /api/assets/:assetId/comments
  router.get('/', getAssetComments);
  router.post('/', protect, createComment);
}

// Rutas para /api/comments
else { // Esta condición se cumple cuando se monta en /api/comments
  router.put('/:id', protect, updateComment);
  router.delete('/:id', protect, deleteComment);
}

module.exports = router;