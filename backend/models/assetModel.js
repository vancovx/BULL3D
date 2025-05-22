// backend/models/assetModel.js
const mongoose = require('mongoose');

const assetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    title: {
      type: String,
      required: [true, 'Please add a title for the asset'],
    },

    category: {
      type: String,
      required: [true, 'Please add a category'],
    },

    tags: {
      type: [String],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: props => `Tags cannot exceed 5 items!`
      },
      default: []
    },

    description: {
      type: String,
      required: [true, 'Please add a description'],
    },

    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Date is required'],
    },
    
    coverImageUrl: {
      type: String,
      required: [true, 'Cover image URL is required'],
    },

    imagesUrl: {
      type: String, // JSON string de URLs (estas usan el proxy)
      required: [true, 'Images URLs are required'],
    },

    contentUrl: {
      type: String, // URL del proxy para vista previa (si es necesario)
      required: [true, 'Content URL is required'],
    },

    // NUEVA: URL directa de Google Drive para descarga
    downloadUrl: {
      type: String,
      required: [true, 'Download URL is required'],
    },
    
    // Campo adicional para almacenar IDs de Google Drive
    _googleDriveIds: {
      folderId: String,
      coverImageId: String,
      imagesIds: [String],
      contentId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Método para convertir el JSON string de URLs a un array
assetSchema.methods.getImagesUrls = function() {
  try {
    return JSON.parse(this.imagesUrl);
  } catch (e) {
    return [];
  }
};

// Hook para limpiar datos antes de enviar al cliente
assetSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    // Eliminar el objeto completo _googleDriveIds por seguridad
    delete ret._googleDriveIds;
    return ret;
  }
});

module.exports = mongoose.model('Asset', assetSchema);