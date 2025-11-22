const AuthService = require('../services/authService');

const authController = {
    // POST /auth/register - Đăng ký user mới
    register: async (req, res, next) => {
        try {
            const result = await AuthService.register(req.body);

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /auth/login - Đăng nhập
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /auth/logout - Đăng xuất
    logout: async (req, res, next) => {
        try {
            const result = await AuthService.logout(req.userId);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /auth/refresh - Refresh access token
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token là bắt buộc'
                });
            }

            const result = await AuthService.refreshAccessToken(refreshToken);

            res.json({
                success: true,
                message: 'Refresh token thành công',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /auth/me - Lấy thông tin user hiện tại
    getCurrentUser: async (req, res, next) => {
        try {
            const user = await AuthService.getCurrentUser(req.userId);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /auth/change-password - Đổi mật khẩu
    changePassword: async (req, res, next) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const result = await AuthService.changePassword(
                req.userId,
                oldPassword,
                newPassword
            );

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /auth/verify - Verify token (for frontend)
    verifyToken: async (req, res, next) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token là bắt buộc'
                });
            }

            const user = await AuthService.verifyToken(token);

            res.json({
                success: true,
                message: 'Token hợp lệ',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
