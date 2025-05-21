const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ user: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);