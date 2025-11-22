const { body, validationResult } = require('express-validator');

// Middleware để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

// Validation cho đăng ký
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username phải từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username chỉ chứa chữ cái, số và dấu gạch dưới'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),

    body('profile.firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Tên phải từ 1-50 ký tự'),

    body('profile.lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Họ phải từ 1-50 ký tự'),

    handleValidationErrors
];

// Validation cho đăng nhập
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc'),

    handleValidationErrors
];

// Validation cho đổi mật khẩu
const validateChangePassword = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Mật khẩu cũ là bắt buộc'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Mật khẩu xác nhận không khớp'),

    handleValidationErrors
];

// Validation cho tạo post
const validateCreatePost = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Nội dung bài viết là bắt buộc')
        .isLength({ max: 5000 })
        .withMessage('Nội dung không được quá 5000 ký tự'),

    body('privacy')
        .optional()
        .isIn(['public', 'friends', 'only_me'])
        .withMessage('Privacy phải là public, friends hoặc only_me'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags phải là mảng'),

    handleValidationErrors
];

// Validation cho tạo comment
const validateCreateComment = [
    body('post')
        .notEmpty()
        .withMessage('Post ID là bắt buộc')
        .isMongoId()
        .withMessage('Post ID không hợp lệ'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Nội dung comment là bắt buộc')
        .isLength({ max: 2000 })
        .withMessage('Nội dung không được quá 2000 ký tự'),

    body('parentComment')
        .optional()
        .isMongoId()
        .withMessage('Parent comment ID không hợp lệ'),

    handleValidationErrors
];

// Validation cho update profile
const validateUpdateProfile = [
    body('profile.firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Tên phải từ 1-50 ký tự'),

    body('profile.lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Họ phải từ 1-50 ký tự'),

    body('profile.bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio không được quá 500 ký tự'),

    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateCreatePost,
    validateCreateComment,
    validateUpdateProfile
};
