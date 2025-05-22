const mongoose = require('mongoose');

const downloadSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Asset',
    },
    downloadDate: {
      type: Date,
      default: Date.now,
    },
    // Información adicional para el historial
    assetTitle: {
      type: String,
      required: true, // Guardamos el título por si el asset se elimina
    },
    assetCategory: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // Tamaño en bytes (opcional)
    },
    ipAddress: {
      type: String, // IP desde donde se descargó (opcional para analytics)
    },
    userAgent: {
      type: String, // Navegador/dispositivo (opcional)
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para optimizar consultas
downloadSchema.index({ user: 1, downloadDate: -1 });
downloadSchema.index({ asset: 1, downloadDate: -1 });

module.exports = mongoose.model('Download', downloadSchema);