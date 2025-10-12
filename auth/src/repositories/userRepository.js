const User = require("../models/user");

/**
 * Lớp UserRepository xử lý việc truy cập dữ liệu người dùng
 * Đây là tầng Repository trong kiến trúc Clean Architecture
 * Chịu trách nhiệm thực hiện các thao tác CRUD với database
 */
class UserRepository {
  /**
   * Tạo người dùng mới trong database
   * @param {Object} user - Thông tin người dùng cần tạo
   * @returns {Object} - Người dùng đã được tạo
   */
  async createUser(user) {
    return await User.create(user);
  }

  /**
   * Tìm người dùng theo username
   * @param {string} username - Tên đăng nhập cần tìm
   * @returns {Object|null} - Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async getUserByUsername(username) {
    return await User.findOne({ username });
  }
}

module.exports = UserRepository;
