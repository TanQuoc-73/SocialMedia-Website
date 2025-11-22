const User = require('../models/User');

class UserService {
    // Lấy tất cả users với pagination
    static async getAllUsers(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const users = await User.find()
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await User.countDocuments();

            return {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Lấy user theo ID
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId)
                .select('-password')
                .populate('followers', 'username profile.avatar')
                .populate('following', 'username profile.avatar');

            if (!user) {
                throw new Error('User không tồn tại');
            }

            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Tạo user mới
    static async createUser(userData) {
        try {
            const { username, email, password, profile } = userData;

            // Kiểm tra user đã tồn tại
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                throw new Error('Username hoặc email đã tồn tại');
            }

            const user = new User({
                username,
                email,
                password,
                profile
            });

            await user.save();

            // Không trả về password
            const userResponse = user.toObject();
            delete userResponse.password;

            return userResponse;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Cập nhật thông tin user
    static async updateUser(userId, updateData) {
        try {
            const { profile } = updateData;

            const user = await User.findByIdAndUpdate(
                userId,
                { profile },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                throw new Error('User không tồn tại');
            }

            return user;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Follow user
    static async followUser(currentUserId, targetUserId) {
        try {
            if (currentUserId === targetUserId) {
                throw new Error('Không thể follow chính mình');
            }

            const currentUser = await User.findById(currentUserId);
            const targetUser = await User.findById(targetUserId);

            if (!currentUser || !targetUser) {
                throw new Error('User không tồn tại');
            }

            // Thêm vào following của user hiện tại
            if (!currentUser.following.includes(targetUserId)) {
                currentUser.following.push(targetUserId);
                await currentUser.updateFollowCounts();
            }

            // Thêm vào followers của target user
            if (!targetUser.followers.includes(currentUserId)) {
                targetUser.followers.push(currentUserId);
                await targetUser.updateFollowCounts();
            }

            return { message: 'Follow thành công' };
        } catch (error) {
            throw new Error(`Error following user: ${error.message}`);
        }
    }

    // Unfollow user
    static async unfollowUser(currentUserId, targetUserId) {
        try {
            const currentUser = await User.findById(currentUserId);
            const targetUser = await User.findById(targetUserId);

            if (!currentUser || !targetUser) {
                throw new Error('User không tồn tại');
            }

            // Xóa khỏi following
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== targetUserId
            );
            await currentUser.updateFollowCounts();

            // Xóa khỏi followers
            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== currentUserId
            );
            await targetUser.updateFollowCounts();

            return { message: 'Unfollow thành công' };
        } catch (error) {
            throw new Error(`Error unfollowing user: ${error.message}`);
        }
    }

    // Get user's followers
    static async getFollowers(userId) {
        try {
            const user = await User.findById(userId)
                .populate('followers', 'username email profile followersCount followingCount');

            if (!user) {
                throw new Error('User không tồn tại');
            }

            return user.followers;
        } catch (error) {
            throw new Error(`Error fetching followers: ${error.message}`);
        }
    }

    // Get users that this user is following
    static async getFollowing(userId) {
        try {
            const user = await User.findById(userId)
                .populate('following', 'username email profile followersCount followingCount');

            if (!user) {
                throw new Error('User không tồn tại');
            }

            return user.following;
        } catch (error) {
            throw new Error(`Error fetching following: ${error.message}`);
        }
    }

    // Tìm kiếm users
    static async searchUsers(query, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(query, 'i');

            const users = await User.find({
                $or: [
                    { username: searchRegex },
                    { email: searchRegex },
                    { 'profile.firstName': searchRegex },
                    { 'profile.lastName': searchRegex }
                ]
            })
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit));

            const total = await User.countDocuments({
                $or: [
                    { username: searchRegex },
                    { email: searchRegex },
                    { 'profile.firstName': searchRegex },
                    { 'profile.lastName': searchRegex }
                ]
            });

            return {
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error searching users: ${error.message}`);
        }
    }
}

module.exports = UserService;

