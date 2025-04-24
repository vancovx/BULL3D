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

    typeContent: {
      type: String,
      required: [true, 'Please add the type of the content'],
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
      type: String, // JSON string de URLs
      required: [true, 'Images URLs are required'],
    },

    contentUrl: {
      type: String,
      required: [true, 'Content URL is required'],
    },
    
    // Campo adicional para almacenar IDs de Google Drive (no expuestos al cliente)
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
    // Eliminar el campo _googleDriveIds de la respuesta
    delete ret._googleDriveIds;
    return ret;
  }
});

module.exports = mongoose.model('Asset', assetSchema);