const express = require('express');
const router = express.Router();
const {
  registerDownload,
  getUserDownloads,
  getDownloadStats,
  deleteDownloadEntry,
  clearDownloadHistory
} = require('../controllers/downloadController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// @route   POST /api/downloads/:assetId
// @desc    Registrar descarga y obtener URL
router.post('/:assetId', registerDownload);

// @route   GET /api/downloads
// @desc    Obtener historial de descargas del usuario
router.get('/', getUserDownloads);

// @route   GET /api/downloads/stats
// @desc    Obtener estadísticas de descargas
router.get('/stats', getDownloadStats);

// @route   DELETE /api/downloads/:downloadId
// @desc    Eliminar entrada específica del historial
router.delete('/:downloadId', deleteDownloadEntry);

// @route   DELETE /api/downloads
// @desc    Limpiar todo el historial de descargas
router.delete('/', clearDownloadHistory);

module.exports = router;