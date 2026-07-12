const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user.model'); // Import SQL Model thay vì jsonRepository

const register = async (userData) => {
    const { fullname, email, phone, password, address } = userData;

    // 1. Kiểm tra đầu vào
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

    // 2. Tìm User trong Database SQL
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error("Email này đã được sử dụng!");
        error.statusCode = 409;
        throw error;
    }

    // 3. Băm mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Lưu User mới vào SQL (Thay thế hàm push JSON)
    const newUser = await User.create({
        fullname,
        email,
        phone,
        password: hashedPassword,
        address: address || "",
        role: "CUSTOMER",
        status: "ACTIVE"
    });

    // 5. Trả kết quả (loại bỏ password)
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    return {
        message: "Đăng ký thành công!",
        user: userWithoutPassword
    };
};

const login = async (credentials) => {
    const { email, password } = credentials;

    if (!email || !password) {
        const error = new Error("Vui lòng nhập đầy đủ email và mật khẩu!");
        error.statusCode = 400;
        throw error;
    }

    // 1. Tìm User bằng SQL
    const user = await User.findOne({ where: { email } });
    if (!user) {
        const error = new Error("Email hoặc mật khẩu không chính xác!");
        error.statusCode = 401;
        throw error;
    }

    // 2. Kiểm tra trạng thái khóa
    if (user.status === 'LOCKED') {
        if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            const error = new Error("Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau!");
            error.statusCode = 403;
            throw error;
        } else if (user.lockUntil && new Date(user.lockUntil) <= new Date()) {
            await user.update({ status: 'ACTIVE', failedLoginAttempts: 0, lockUntil: null });
        } else {
            const error = new Error("Tài khoản của bạn đã bị khóa!");
            error.statusCode = 403;
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
            updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        
        // Lưu số lần sai vào SQL
        await user.update(updateData);

        const error = new Error("Email hoặc mật khẩu không chính xác!");
        error.statusCode = 401;
        throw error;
    }

    // 4. Đăng nhập thành công -> Reset trạng thái SQL
    await user.update({ failedLoginAttempts: 0, lockUntil: null });

    // 5. Cấp Token
    const payload = { id: user.id, email: user.email, role: user.role };
    const secretKey = process.env.JWT_SECRET || 'do-an-c4-secret-key';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return { message: "Đăng nhập thành công!", token, user: userWithoutPassword };
};

module.exports = { register, login };