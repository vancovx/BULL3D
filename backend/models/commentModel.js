const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Asset',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: [true, 'Please add a comment text'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);