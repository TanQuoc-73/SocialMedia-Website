const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    // Đăng ký user mới
    static async register(userData) {
        try {
            const { username, email, password, profile } = userData;

            // Kiểm tra user đã tồn tại
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    throw new Error('Email đã được sử dụng');
                }
                if (existingUser.username === username) {
                    throw new Error('Username đã được sử dụng');
                }
            }

            // Tạo user mới (password sẽ được hash tự động bởi pre-save hook)
            const user = new User({
                username,
                email,
                password,
                profile
            });

            await user.save();

            // Generate tokens
            const tokens = this.generateTokens(user._id);

            // Lưu refresh token vào database
            user.refreshToken = tokens.refreshToken;
            user.lastLogin = new Date();
            await user.save();

            // Không trả về password
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshToken;

            return {
                user: userResponse,
                ...tokens
            };
        } catch (error) {
            throw new Error(`Lỗi đăng ký: ${error.message}`);
        }
    }

    // Đăng nhập
    static async login(email, password) {
        try {
            // Tìm user theo email
            const user = await User.findOne({ email });

            if (!user) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }

            // Kiểm tra account active
            if (!user.isActive) {
                throw new Error('Tài khoản đã bị vô hiệu hóa');
            }

            // Kiểm tra password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }

            // Generate tokens
            const tokens = this.generateTokens(user._id);

            // Lưu refresh token và update lastLogin
            user.refreshToken = tokens.refreshToken;
            user.lastLogin = new Date();
            await user.save();

            // Không trả về password
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshToken;

            return {
                user: userResponse,
                ...tokens
            };
        } catch (error) {
            throw new Error(`Lỗi đăng nhập: ${error.message}`);
        }
    }

    // Logout
    static async logout(userId) {
        try {
            // Xóa refresh token
            await User.findByIdAndUpdate(userId, {
                refreshToken: null
            });

            return { message: 'Đăng xuất thành công' };
        } catch (error) {
            throw new Error(`Lỗi đăng xuất: ${error.message}`);
        }
    }

    // Refresh access token
    static async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Tìm user và kiểm tra refresh token
            const user = await User.findById(decoded.userId);

            if (!user || user.refreshToken !== refreshToken) {
                throw new Error('Refresh token không hợp lệ');
            }

            if (!user.isActive) {
                throw new Error('Tài khoản đã bị vô hiệu hóa');
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return { accessToken };
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
            }
            throw new Error(`Lỗi refresh token: ${error.message}`);
        }
    }

    // Verify token
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password -refreshToken');

            if (!user || !user.isActive) {
                throw new Error('Token không hợp lệ');
            }

            return user;
        } catch (error) {
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    // Change password
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User không tồn tại');
            }

            // Kiểm tra old password
            const isPasswordValid = await user.comparePassword(oldPassword);

            if (!isPasswordValid) {
                throw new Error('Mật khẩu cũ không đúng');
            }

            // Update password (sẽ được hash tự động bởi pre-save hook)
            user.password = newPassword;
            await user.save();

            // Xóa tất cả refresh tokens (force logout all devices)
            user.refreshToken = null;
            await user.save();

            return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
        } catch (error) {
            throw new Error(`Lỗi đổi mật khẩu: ${error.message}`);
        }
    }

    // Generate access and refresh tokens
    static generateTokens(userId) {
        const accessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const refreshToken = jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
        );

        return { accessToken, refreshToken };
    }

    // Get current user
    static async getCurrentUser(userId) {
        try {
            const user = await User.findById(userId)
                .select('-password -refreshToken')
                .populate('followers', 'username profile.avatar')
                .populate('following', 'username profile.avatar');

            if (!user) {
                throw new Error('User không tồn tại');
            }

            return user;
        } catch (error) {
            throw new Error(`Lỗi lấy thông tin user: ${error.message}`);
        }
    }
}

module.exports = AuthService;
