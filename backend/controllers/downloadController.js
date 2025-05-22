const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // AGREGAR ESTA LÍNEA
const Download = require('../models/downloadModel');
const Asset = require('../models/assetModel');

// @desc    Registrar una descarga y obtener URL
// @route   POST /api/downloads/:assetId
// @access  Private
const registerDownload = asyncHandler(async (req, res) => {
  const { assetId } = req.params;
  
  console.log('=== REGISTRO DE DESCARGA ===');
  console.log('AssetId:', assetId);
  console.log('UserId:', req.user.id);
  
  // Verificar que el asset existe
  const asset = await Asset.findById(assetId);
  if (!asset) {
    console.log('Asset no encontrado');
    res.status(404);
    throw new Error('Asset not found');
  }

  console.log('Asset encontrado:', asset.title);

  // Obtener información adicional de la request
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  try {
    // Crear registro de descarga
    const downloadData = {
      user: req.user.id,
      asset: assetId,
      assetTitle: asset.title,
      assetCategory: asset.category,
      ipAddress,
      userAgent,
    };

    console.log('Datos de descarga a guardar:', downloadData);

    const download = await Download.create(downloadData);

    console.log('Descarga registrada con éxito:', download._id);

    // Retornar la URL de descarga
    res.status(201).json({
      downloadId: download._id,
      downloadUrl: asset.downloadUrl,
      assetTitle: asset.title,
      message: 'Download registered successfully'
    });
  } catch (error) {
    console.error('Error al registrar descarga:', error);
    res.status(500);
    throw new Error(`Error registering download: ${error.message}`);
  }
});

// @desc    Obtener historial de descargas del usuario
// @route   GET /api/downloads
// @access  Private
const getUserDownloads = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('=== OBTENER HISTORIAL ===');
  console.log('UserId:', req.user.id);
  console.log('Page:', page, 'Limit:', limit);

  // Obtener descargas del usuario con paginación
  const downloads = await Download.find({ user: req.user.id })
    .populate({
      path: 'asset',
      select: 'title category coverImageUrl _id',
      // Si el asset fue eliminado, seguiremos mostrando la descarga
      options: { strictPopulate: false }
    })
    .sort({ downloadDate: -1 })
    .skip(skip)
    .limit(limit);

  console.log('Descargas encontradas:', downloads.length);

  // Contar total de descargas
  const totalDownloads = await Download.countDocuments({ user: req.user.id });
  const totalPages = Math.ceil(totalDownloads / limit);

  console.log('Total descargas:', totalDownloads);

  res.status(200).json({
    downloads,
    pagination: {
      currentPage: page,
      totalPages,
      totalDownloads,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Obtener estadísticas de descargas del usuario
// @route   GET /api/downloads/stats
// @access  Private
const getDownloadStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Total de descargas
  const totalDownloads = await Download.countDocuments({ user: userId });

  // Descargas este mes
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const monthlyDownloads = await Download.countDocuments({
    user: userId,
    downloadDate: { $gte: thisMonth }
  });

  // Categorías más descargadas
  const topCategories = await Download.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } }, // CORREGIDO
    { $group: { _id: '$assetCategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Descargas por día (últimos 7 días)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyDownloads = await Download.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId), // CORREGIDO
        downloadDate: { $gte: sevenDaysAgo }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$downloadDate" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    totalDownloads,
    monthlyDownloads,
    topCategories,
    dailyDownloads
  });
});

// @desc    Eliminar entrada del historial
// @route   DELETE /api/downloads/:downloadId
// @access  Private
const deleteDownloadEntry = asyncHandler(async (req, res) => {
  const { downloadId } = req.params;
  
  const download = await Download.findById(downloadId);
  
  if (!download) {
    res.status(404);
    throw new Error('Download entry not found');
  }
  
  // Verificar que la descarga pertenece al usuario
  if (download.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this download entry');
  }
  
  await Download.deleteOne({ _id: downloadId });
  
  res.status(200).json({ 
    id: downloadId, 
    message: 'Download entry deleted successfully' 
  });
});

// @desc    Limpiar todo el historial de descargas
// @route   DELETE /api/downloads
// @access  Private
const clearDownloadHistory = asyncHandler(async (req, res) => {
  const result = await Download.deleteMany({ user: req.user.id });
  
  res.status(200).json({ 
    message: `${result.deletedCount} download entries cleared successfully` 
  });
});

module.exports = {
  registerDownload,
  getUserDownloads,
  getDownloadStats,
  deleteDownloadEntry,
  clearDownloadHistory
};