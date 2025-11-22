// Export tất cả models
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Message = require('./Message');
const Conversation = require('./Conversation');
const Notification = require('./Notification');

module.exports = {
    User,
    Post,
    Comment,
    Message,
    Conversation,
    Notification
};
