const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] },
    thumbnail: String
  }],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'only_me'],
    default: 'public'
  },
  tags: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

postSchema.pre('save', function (next) {
  this.likesCount = this.likes.length;
  next();
});

postSchema.statics.getPaginatedPosts = function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find()
    .populate('author', 'username profile.avatar profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Post', postSchema);