const mongoose = require('mongoose');

const chatMetadataSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
})

module.exports = mongoose.model('ChatMetadata', chatMetadataSchema);