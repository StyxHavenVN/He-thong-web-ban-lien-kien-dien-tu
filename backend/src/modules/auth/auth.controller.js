const authService = require('./auth.service');

const register = async (req, res) => {
    try {
        // Chuyển dữ liệu từ body xuống tầng Service xử lý
        const result = await authService.register(req.body);
        
        // Trả về mã 201 Created khi tạo tài khoản thành công
        res.status(201).json({
            success: true,
            message: result.message,
            data: result.user
        });
    } catch (error) {
        // Xử lý lỗi trả về từ tầng Service
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        
        res.status(200).json({
            success: true,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login
};