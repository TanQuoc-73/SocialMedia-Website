const NotificationService = require('../services/notificationService');

const notificationController = {
    // GET /notifications?userId=xxx
    getUserNotifications: async (req, res, next) => {
        try {
            const { userId, page, limit } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId là bắt buộc'
                });
            }

            const result = await NotificationService.getUserNotifications(userId, page, limit);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /notifications
    createNotification: async (req, res, next) => {
        try {
            const notification = await NotificationService.createNotification(req.body);

            res.status(201).json({
                success: true,
                message: 'Tạo notification thành công',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /notifications/:id/read
    markAsRead: async (req, res, next) => {
        try {
            const notification = await NotificationService.markAsRead(req.params.id);

            res.json({
                success: true,
                message: 'Đã đánh dấu đã đọc',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /notifications/read-all
    markAllAsRead: async (req, res, next) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId là bắt buộc'
                });
            }

            const result = await NotificationService.markAllAsRead(userId);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /notifications/:id
    deleteNotification: async (req, res, next) => {
        try {
            const result = await NotificationService.deleteNotification(req.params.id);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /notifications/unread-count?userId=xxx
    getUnreadCount: async (req, res, next) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId là bắt buộc'
                });
            }

            const result = await NotificationService.getUnreadCount(userId);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = notificationController;
