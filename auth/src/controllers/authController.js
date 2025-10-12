const AuthService = require("../services/authService");

/**
 * Lớp AuthController xử lý các request liên quan đến xác thực
 * Đây là tầng Controller trong kiến trúc Clean Architecture
 * Chịu trách nhiệm nhận request, gọi business logic và trả về response
 */
class AuthController {
  constructor() {
    // Khởi tạo AuthService để xử lý business logic
    this.authService = new AuthService();
  }

  /**
   * Xử lý đăng nhập người dùng
   * @param {Object} req - Request object chứa username và password
   * @param {Object} res - Response object để trả về kết quả
   */
  async login(req, res) {
    const { username, password } = req.body;

    // Gọi AuthService để xử lý logic đăng nhập
    const result = await this.authService.login(username, password);

    if (result.success) {
      // Trả về JWT token nếu đăng nhập thành công
      res.json({ token: result.token });
    } else {
      // Trả về lỗi nếu đăng nhập thất bại
      res.status(400).json({ message: result.message });
    }
  }

  /**
   * Xử lý đăng ký người dùng mới
   * @param {Object} req - Request object chứa thông tin người dùng (username, password)
   * @param {Object} res - Response object để trả về kết quả
   */
  async register(req, res) {
    const user = req.body;
  
    try {
      // Kiểm tra xem username đã tồn tại chưa
      const existingUser = await this.authService.findUserByUsername(user.username);
  
      if (existingUser) {
        console.log("Username already taken")
        throw new Error("Username already taken");
      }
  
      // Tạo người dùng mới nếu username chưa tồn tại
      const result = await this.authService.register(user);
      res.json(result);
    } catch (err) {
      // Trả về lỗi nếu có vấn đề trong quá trình đăng ký
      res.status(400).json({ message: err.message });
    }
  }

  /**
   * Lấy thông tin profile người dùng (route được bảo vệ)
   * @param {Object} req - Request object chứa thông tin user từ JWT token
   * @param {Object} res - Response object để trả về thông tin user
   */
  async getProfile(req, res) {
    const userId = req.user.id;

    try {
      // Lấy thông tin người dùng từ database
      const user = await this.authService.getUserById(userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = AuthController;
