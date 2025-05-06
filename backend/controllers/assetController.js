const asyncHandler = require('express-async-handler');
const Asset = require('../models/assetModel');
const { driveService } = require('../middleware/googleDriveMiddleware');


// @desc    Get all assets (public access)
// @route   GET /api/assets
// @access  Public
const getAssets = asyncHandler(async (req, res) => {
  // Retrieve all assets regardless of user
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
  const { title, typeContent, description, date } = req.body;

  // Validar que los campos requeridos estén presentes
  if (!title || !typeContent || !description) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validar que se han subido todos los archivos necesarios
  if (!req.files || !req.files.coverImage || !req.files.images || !req.files.content) {
    res.status(400);
    throw new Error('Please upload all required files');
  }

  try {
    // Crear una carpeta para el asset
    const folderResult = await driveService.createFolder(`Asset-${title}-${Date.now()}`);
    const folderId = folderResult.id;

    // Subir imagen de portada
    const coverImage = req.files.coverImage[0];
    const coverImageResult = await driveService.uploadFile(
      coverImage.buffer,
      coverImage.mimetype,
      `cover-${Date.now()}-${coverImage.originalname}`,
      folderId
    );

    // Subir las imágenes adicionales
    const imagesUploadPromises = req.files.images.map(image => 
      driveService.uploadFile(
        image.buffer,
        image.mimetype,
        `image-${Date.now()}-${image.originalname}`,
        folderId
      )
    );
    const imagesResults = await Promise.all(imagesUploadPromises);
    
    // Subir el contenido principal
    const content = req.files.content[0];
    const contentResult = await driveService.uploadFile(
      content.buffer,
      content.mimetype,
      `content-${Date.now()}-${content.originalname}`,
      folderId
    );

    // Crear un array de URLs de imágenes
    const imagesUrls = imagesResults.map(result => result.directUrl);

    // Crear el asset en la base de datos
    const asset = await Asset.create({
      user: req.user.id,
      title,
      typeContent,
      description,
      coverImageUrl: coverImageResult.directUrl,
      imagesUrl: JSON.stringify(imagesUrls),
      contentUrl: contentResult.directUrl,
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

  // Check if the asset belongs to the user
  if (asset.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this asset');
  }

  const { title, typeContent, description, date } = req.body;
  const updateData = {};

  // Actualizar campos de texto si están presentes
  if (title) updateData.title = title;
  if (typeContent) updateData.typeContent = typeContent;
  if (description) updateData.description = description;
  if (date) updateData.date = new Date(date);

  try {
    // Actualizar archivos si se proporcionan nuevos
    const googleDriveIds = { ...asset._googleDriveIds };

    // Actualizar imagen de portada si se proporciona
    if (req.files && req.files.coverImage) {
      const coverImage = req.files.coverImage[0];
      let coverImageResult;
      
      if (googleDriveIds.coverImageId) {
        // Actualizar el archivo existente
        coverImageResult = await driveService.updateFile(
          googleDriveIds.coverImageId,
          coverImage.buffer,
          coverImage.mimetype
        );
      } else {
        // Subir como nuevo archivo
        coverImageResult = await driveService.uploadFile(
          coverImage.buffer,
          coverImage.mimetype,
          `cover-${Date.now()}-${coverImage.originalname}`,
          googleDriveIds.folderId
        );
        googleDriveIds.coverImageId = coverImageResult.id;
      }
      
      updateData.coverImageUrl = coverImageResult.directUrl;
    }

    // Actualizar imágenes adicionales si se proporcionan
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Eliminar imágenes antiguas si existen
      if (googleDriveIds.imagesIds && googleDriveIds.imagesIds.length > 0) {
        const deletePromises = googleDriveIds.imagesIds.map(id => 
          driveService.deleteFile(id)
        );
        await Promise.all(deletePromises);
      }

      // Subir las nuevas imágenes
      const imagesUploadPromises = req.files.images.map(image => 
        driveService.uploadFile(
          image.buffer,
          image.mimetype,
          `image-${Date.now()}-${image.originalname}`,
          googleDriveIds.folderId
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
        // Actualizar el archivo existente
        contentResult = await driveService.updateFile(
          googleDriveIds.contentId,
          content.buffer,
          content.mimetype
        );
      } else {
        // Subir como nuevo archivo
        contentResult = await driveService.uploadFile(
          content.buffer,
          content.mimetype,
          `content-${Date.now()}-${content.originalname}`,
          googleDriveIds.folderId
        );
        googleDriveIds.contentId = contentResult.id;
      }
      
      updateData.contentUrl = contentResult.directUrl;
    }

    // Actualizar los IDs de Google Drive
    updateData._googleDriveIds = googleDriveIds;

    // Actualizar el asset en la base de datos
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

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  // Check if the asset belongs to the user
  if (asset.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this asset');
  }

  try {
    // Eliminar todos los archivos de Google Drive
    if (asset._googleDriveIds) {
      // Si hay una carpeta principal, eliminarla (eliminará todo su contenido)
      if (asset._googleDriveIds.folderId) {
        await driveService.deleteFile(asset._googleDriveIds.folderId);
      } else {
        // Si no hay carpeta pero hay archivos individuales, eliminarlos uno por uno
        const fileIds = [
          asset._googleDriveIds.coverImageId,
          asset._googleDriveIds.contentId,
          ...(asset._googleDriveIds.imagesIds || [])
        ].filter(Boolean);

        const deletePromises = fileIds.map(id => driveService.deleteFile(id));
        await Promise.all(deletePromises);
      }
    }

    // Eliminar el asset de la base de datos
    await asset.deleteOne();  // Cambiado de asset.remove() a asset.deleteOne()

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to delete asset: ${error.message}`);
  }
});



module.exports = {
  getAssets,
  getUserAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};