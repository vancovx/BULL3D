const asyncHandler = require('express-async-handler');
const Asset = require('../models/assetModel');
const Favorite = require('../models/favoriteModel');
const Comment = require('../models/commentModel');
const Download = require('../models/downloadModel');
const { driveService } = require('../middleware/googleDriveMiddleware');

// @desc    Get all assets (public access)
// @route   GET /api/assets
// @access  Public
const getAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find({});
  res.status(200).json(assets);
});

// @desc    Get all assets for a specific user
// @route   GET /api/assets/user/:userId
// @access  Public
const getUserAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ user: req.params.userId });
  res.status(200).json(assets);
});

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Public
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  res.status(200).json(asset);
});

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private
const createAsset = asyncHandler(async (req, res) => {
  const { title, description, date, category, tags } = req.body;

  if (!title || !description || !category) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (tags && tags.length > 5) {
    res.status(400);
    throw new Error('Tags cannot exceed 5 items');
  }

  if (!req.files || !req.files.coverImage || !req.files.images || !req.files.content) {
    res.status(400);
    throw new Error('Please upload all required files');
  }

  try {
    // Crear una carpeta para el asset
    const folderResult = await driveService.createFolder(`Asset-${title}-${Date.now()}`);
    const folderId = folderResult.id;

    // Subir imagen de portada (usando proxy)
    const coverImage = req.files.coverImage[0];
    const coverImageResult = await driveService.uploadFile(
      coverImage.buffer,
      coverImage.mimetype,
      `cover-${Date.now()}-${coverImage.originalname}`,
      folderId,
      false // No es archivo de contenido
    );

    // Subir las imágenes adicionales (usando proxy)
    const imagesUploadPromises = req.files.images.map(image => 
      driveService.uploadFile(
        image.buffer,
        image.mimetype,
        `image-${Date.now()}-${image.originalname}`,
        folderId,
        false // No es archivo de contenido
      )
    );
    const imagesResults = await Promise.all(imagesUploadPromises);
    
    // Subir el contenido principal (URL directa de descarga)
    const content = req.files.content[0];
    const contentResult = await driveService.uploadFile(
      content.buffer,
      content.mimetype,
      `content-${Date.now()}-${content.originalname}`,
      folderId,
      true // ES archivo de contenido
    );

    // Crear un array de URLs de imágenes (para proxy)
    const imagesUrls = imagesResults.map(result => result.directUrl);

    // Procesar las etiquetas si existen
    const processedTags = tags ? Array.isArray(tags) ? tags : [tags] : [];

    // Crear el asset en la base de datos
    const asset = await Asset.create({
      user: req.user.id,
      title,
      description,
      category,
      tags: processedTags,
      coverImageUrl: coverImageResult.directUrl, // URL del proxy para imagen
      imagesUrl: JSON.stringify(imagesUrls), // URLs del proxy para imágenes
      contentUrl: contentResult.directUrl, // URL del proxy
      downloadUrl: contentResult.downloadUrl, // URL DIRECTA de Google Drive para descarga
      date: date ? new Date(date) : new Date(),
      _googleDriveIds: {
        folderId,
        coverImageId: coverImageResult.id,
        imagesIds: imagesResults.map(result => result.id),
        contentId: contentResult.id
      }
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to create asset: ${error.message}`);
  }
});

// @desc    Update an asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this asset');
  }

  const { title, description, date, category, tags } = req.body;
  const updateData = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (date) updateData.date = new Date(date);
  if (category) updateData.category = category;
  
  if (tags) {
    const processedTags = Array.isArray(tags) ? tags : [tags];
    if (processedTags.length > 5) {
      res.status(400);
      throw new Error('Tags cannot exceed 5 items');
    }
    updateData.tags = processedTags;
  }

  try {
    const googleDriveIds = { ...asset._googleDriveIds };

    // Actualizar imagen de portada si se proporciona
    if (req.files && req.files.coverImage) {
      const coverImage = req.files.coverImage[0];
      let coverImageResult;
      
      if (googleDriveIds.coverImageId) {
        coverImageResult = await driveService.updateFile(
          googleDriveIds.coverImageId,
          coverImage.buffer,
          coverImage.mimetype,
          false // No es contenido
        );
      } else {
        coverImageResult = await driveService.uploadFile(
          coverImage.buffer,
          coverImage.mimetype,
          `cover-${Date.now()}-${coverImage.originalname}`,
          googleDriveIds.folderId,
          false
        );
        googleDriveIds.coverImageId = coverImageResult.id;
      }
      
      updateData.coverImageUrl = coverImageResult.directUrl;
    }

    // Actualizar imágenes adicionales si se proporcionan
    if (req.files && req.files.images && req.files.images.length > 0) {
      if (googleDriveIds.imagesIds && googleDriveIds.imagesIds.length > 0) {
        const deletePromises = googleDriveIds.imagesIds.map(id => 
          driveService.deleteFile(id)
        );
        await Promise.all(deletePromises);
      }

      const imagesUploadPromises = req.files.images.map(image => 
        driveService.uploadFile(
          image.buffer,
          image.mimetype,
          `image-${Date.now()}-${image.originalname}`,
          googleDriveIds.folderId,
          false // No es contenido
        )
      );
      
      const imagesResults = await Promise.all(imagesUploadPromises);
      const imagesUrls = imagesResults.map(result => result.directUrl);
      
      updateData.imagesUrl = JSON.stringify(imagesUrls);
      googleDriveIds.imagesIds = imagesResults.map(result => result.id);
    }

    // Actualizar contenido si se proporciona
    if (req.files && req.files.content) {
      const content = req.files.content[0];
      let contentResult;
      
      if (googleDriveIds.contentId) {
        contentResult = await driveService.updateFile(
          googleDriveIds.contentId,
          content.buffer,
          content.mimetype,
          true // ES contenido
        );
      } else {
        contentResult = await driveService.uploadFile(
          content.buffer,
          content.mimetype,
          `content-${Date.now()}-${content.originalname}`,
          googleDriveIds.folderId,
          true // ES contenido
        );
        googleDriveIds.contentId = contentResult.id;
      }
      
      updateData.contentUrl = contentResult.directUrl;
      updateData.downloadUrl = contentResult.downloadUrl; // URL directa de descarga
    }

    updateData._googleDriveIds = googleDriveIds;

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to update asset: ${error.message}`);
  }
});

// @desc    Delete an asset and all associated data
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this asset');
  }

  try {
    console.log(`Iniciando eliminación completa del asset: ${asset._id}`);

    // 1. Eliminar archivos de Google Drive
    if (asset._googleDriveIds) {
      if (asset._googleDriveIds.folderId) {
        console.log('Intentando eliminar carpeta con ID:', asset._googleDriveIds.folderId);
        try {
          await driveService.deleteFile(asset._googleDriveIds.folderId);
          console.log('Carpeta eliminada con éxito');
        } catch (driveError) {
          console.error('Error al eliminar carpeta de Google Drive:', driveError);
        }
      } else {
        const fileIds = [
          asset._googleDriveIds.coverImageId,
          asset._googleDriveIds.contentId,
          ...(asset._googleDriveIds.imagesIds || [])
        ].filter(Boolean);
        
        console.log('Intentando eliminar archivos individuales:', fileIds);
        
        if (fileIds.length > 0) {
          const deletePromises = fileIds.map(id => {
            return new Promise((resolve) => {
              driveService.deleteFile(id)
                .then(() => {
                  console.log(`Archivo ${id} eliminado con éxito`);
                  resolve();
                })
                .catch((err) => {
                  console.error(`Error al eliminar archivo ${id}:`, err);
                  resolve(); 
                });
            });
          });
          
          await Promise.all(deletePromises);
        }
      }
    } else {
      console.log('No hay IDs de Google Drive para este asset');
    }

    // 2. Eliminar todos los favoritos asociados a este asset
    console.log('Eliminando favoritos asociados...');
    const deletedFavorites = await Favorite.deleteMany({ asset: req.params.id });
    console.log(`${deletedFavorites.deletedCount} favoritos eliminados`);

    // 3. Eliminar todos los comentarios asociados a este asset
    console.log('Eliminando comentarios asociados...');
    const deletedComments = await Comment.deleteMany({ asset: req.params.id });
    console.log(`${deletedComments.deletedCount} comentarios eliminados`);

    // 4. Eliminar todas las descargas asociadas a este asset
    // Nota: Puedes comentar esta sección si prefieres mantener el historial de descargas
    console.log('Eliminando registros de descarga asociados...');
    const deletedDownloads = await Download.deleteMany({ asset: req.params.id });
    console.log(`${deletedDownloads.deletedCount} registros de descarga eliminados`);

    // 5. Finalmente, eliminar el asset
    console.log('Eliminando el asset de la base de datos...');
    await Asset.deleteOne({ _id: req.params.id });
    console.log('Asset eliminado con éxito');

    res.status(200).json({ 
      id: req.params.id, 
      message: 'Asset y todos sus datos asociados eliminados con éxito',
      deletedItems: {
        favorites: deletedFavorites.deletedCount,
        comments: deletedComments.deletedCount,
        downloads: deletedDownloads.deletedCount
      }
    });

  } catch (error) {
    console.error('Error completo al eliminar asset:', error);
    res.status(500);
    throw new Error(`Failed to delete asset: ${error.message}`);
  }
});

// @desc    Search assets
// @route   GET /api/assets/search
// @access  Public
const searchAssets = asyncHandler(async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query');
  }
  
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  const assets = await Asset.find(searchQuery);
  res.status(200).json(assets);
});

module.exports = {
  getAssets,
  getUserAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  searchAssets
};