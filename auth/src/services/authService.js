const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");
const config = require("../config");
const User = require("../models/user");

/**
 * Lớp AuthService chứa business logic cho các chức năng xác thực
 * Đây là tầng Service trong kiến trúc Clean Architecture
 * Chịu trách nhiệm xử lý logic nghiệp vụ như mã hóa password, tạo JWT token
 */
class AuthService {
  constructor() {
    // Khởi tạo UserRepository để truy cập dữ liệu người dùng
    this.userRepository = new UserRepository();
  }

  /**
   * Tìm người dùng theo username
   * @param {string} username - Tên đăng nhập của người dùng
   * @returns {Object|null} - Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findUserByUsername(username) {
    const user = await User.findOne({ username });
    return user;
  }

  /**
   * Xử lý đăng nhập người dùng
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Object} - Kết quả đăng nhập (success, token hoặc message lỗi)
   */
  async login(username, password) {
    // Tìm người dùng trong database
    const user = await this.userRepository.getUserByUsername(username);

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    // So sánh mật khẩu với hash đã lưu
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid username or password" };
    }

    // Tạo JWT token nếu đăng nhập thành công
    const token = jwt.sign({ id: user._id }, config.jwtSecret);

    return { success: true, token };
  }

  /**
   * Đăng ký người dùng mới
   * @param {Object} user - Thông tin người dùng (username, password)
   * @returns {Object} - Thông tin người dùng đã được tạo
   */
  async register(user) {
    // Tạo salt để mã hóa password
    const salt = await bcrypt.genSalt(10);
    // Hash password với salt
    user.password = await bcrypt.hash(user.password, salt);

    // Lưu người dùng vào database thông qua UserRepository
    return await this.userRepository.createUser(user);
  }

  /**
   * Xóa các user test (được sử dụng trong testing)
   * Xóa tất cả user có username bắt đầu bằng "test"
   */
  async deleteTestUsers() {
    // Delete all users with a username that starts with "test"
    await User.deleteMany({ username: /^test/ });
  }
}

module.exports = AuthService;
