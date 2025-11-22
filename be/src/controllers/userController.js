const UserService = require('../services/userService');

const userController = {
    // GET /users/:id
    getUserById: async (req, res, next) => {
        try {
            const user = await UserService.getUserById(req.params.id);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/:id/friends - Get user's following list (friends)
    getUserFriends: async (req, res, next) => {
        try {
            const friends = await UserService.getFollowing(req.params.id);

            res.json({
                success: true,
                data: friends
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/:id/followers - Get user's followers
    getUserFollowers: async (req, res, next) => {
        try {
            const followers = await UserService.getFollowers(req.params.id);

            res.json({
                success: true,
                data: followers
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/:id/following - Get users that this user is following
    getUserFollowing: async (req, res, next) => {
        try {
            const following = await UserService.getFollowing(req.params.id);

            res.json({
                success: true,
                data: following
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /users/:id
    updateUser: async (req, res, next) => {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Cập nhật thành công',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /users/:id
    deleteUser: async (req, res, next) => {
        try {
            await UserService.deleteUser(req.params.id);

            res.json({
                success: true,
                message: 'Xóa user thành công'
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/:id/follow
    followUser: async (req, res, next) => {
        try {
            // req.userId from auth middleware, req.params.id is user to follow
            const result = await UserService.followUser(req.userId, req.params.id);

            res.json({
                success: true,
                message: 'Đã theo dõi',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/:id/unfollow
    unfollowUser: async (req, res, next) => {
        try {
            // req.userId from auth middleware, req.params.id is user to unfollow
            const result = await UserService.unfollowUser(req.userId, req.params.id);

            res.json({
                success: true,
                message: 'Đã bỏ theo dõi',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/search?q=query
    searchUsers: async (req, res, next) => {
        try {
            const { q, page, limit } = req.query;
            const result = await UserService.searchUsers(q, page, limit);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
