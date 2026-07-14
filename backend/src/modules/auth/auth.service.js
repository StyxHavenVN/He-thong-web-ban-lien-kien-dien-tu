const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('./user.model');

const register = async (userData) => {
    const { fullname, email, phone, password, address } = userData;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!fullname || !email || !phone || !password) {
        const error = new Error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        error.statusCode = 400;
        throw error;
    }

    if (password.length < 6) {
        const error = new Error("Mật khẩu phải có ít nhất 6 ký tự!");
        error.statusCode = 400;
        throw error;
    }

    // 2. Kiểm tra trùng lặp email trong SQL
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
        const error = new Error("Email này đã được sử dụng!");
        error.statusCode = 409;
        throw error;
    }

    // 3. Kiểm tra trùng lặp số điện thoại trong SQL
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
        const error = new Error("Số điện thoại này đã được sử dụng!");
        error.statusCode = 409;
        throw error;
    }

    // 4. Băm mật khẩu (cost 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Lưu User mới (vai trò mặc định là CUSTOMER, trạng thái ACTIVE)
    const newUser = await User.create({
        fullname,
        email,
        phone,
        password: hashedPassword,
        address: address || "",
        role: "CUSTOMER",
        status: "ACTIVE",
        failedLoginAttempts: 0
    });

    // 6. Trả kết quả (loại bỏ password)
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    return {
        message: "Đăng ký thành công!",
        user: userWithoutPassword
    };
};

const login = async (credentials) => {
    const { email, password } = credentials; // 'email' ở đây có thể là email hoặc số điện thoại

    if (!email || !password) {
        const error = new Error("Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu!");
        error.statusCode = 400;
        throw error;
    }

    // 1. Tìm User bằng email hoặc số điện thoại
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { phone: email }
            ]
        }
    });

    if (!user) {
        const error = new Error("Email hoặc mật khẩu không chính xác!");
        error.statusCode = 401;
        throw error;
    }

    // 2. Kiểm tra trạng thái khóa và mở khóa tự động sau 15 phút
    if (user.status === 'LOCKED') {
        if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            const error = new Error("Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau!");
            error.statusCode = 423; // Trả về mã 423 Locked khi tài khoản bị khóa
            throw error;
        } else if (user.lockUntil && new Date(user.lockUntil) <= new Date()) {
            // Tự động mở khóa nếu đã hết 15 phút
            await user.update({ status: 'ACTIVE', failedLoginAttempts: 0, lockUntil: null });
        } else {
            const error = new Error("Tài khoản của bạn đã bị khóa!");
            error.statusCode = 423;
            throw error;
        }
    }

    // 3. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const attempts = user.failedLoginAttempts + 1;
        let updateData = { failedLoginAttempts: attempts };
        
        if (attempts >= 5) {
            updateData.status = 'LOCKED';
            updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Khóa 15 phút
        }
        
        await user.update(updateData);

        const error = new Error("Email hoặc mật khẩu không chính xác!");
        error.statusCode = 401;
        throw error;
    }

    // 4. Đăng nhập thành công -> Reset trạng thái failed login
    await user.update({ failedLoginAttempts: 0, lockUntil: null, status: 'ACTIVE' });

    // 5. Cấp Token JWT chứa id, email và role
    const payload = { id: user.id, email: user.email, role: user.role };
    const secretKey = process.env.JWT_SECRET || 'do-an-c4-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign(payload, secretKey, { expiresIn });

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return { message: "Đăng nhập thành công!", token, user: userWithoutPassword };
};

module.exports = { register, login };