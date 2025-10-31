const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

/**
 * Lớp App chính để quản lý service xác thực
 * Chịu trách nhiệm khởi tạo server, kết nối database, thiết lập middleware và routes
 */
class App {
  constructor() {
    // Khởi tạo ứng dụng Express
    this.app = express();
    // Tạo instance của AuthController để xử lý các request xác thực
    this.authController = new AuthController();
    // Kết nối đến MongoDB
    this.connectDB();
    // Thiết lập các middleware
    this.setMiddlewares();
    // Thiết lập các routes
    this.setRoutes();
  }

  /**
   * Kết nối đến MongoDB
   * Sử dụng MongoDB để lưu trữ thông tin người dùng (username, password)
   */
  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  /**
   * Ngắt kết nối MongoDB
   * Được sử dụng khi dừng ứng dụng hoặc trong testing
   */
  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  /**
   * Thiết lập các middleware cho Express
   * - express.json(): Để parse JSON từ request body
   * - express.urlencoded(): Để parse dữ liệu từ form
   */
  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  /**
   * Thiết lập các routes cho service xác thực
   * - POST /login: Đăng nhập người dùng
   * - POST /register: Đăng ký người dùng mới  
   * - GET /dashboard: Route được bảo vệ bởi authMiddleware
   */
  setRoutes() {
    this.app.post("/login", (req, res) => this.authController.login(req, res));
    this.app.post("/register", (req, res) => this.authController.register(req, res));
    this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
  }

  /**
   * Khởi động server Auth trên port 3000 (hoặc port từ env)
   * Server sẽ lắng nghe các request xác thực từ client
   */
  start() {
    const PORT = process.env.PORT || 3000;
    this.server = this.app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    return this.server;
  }

  /**
   * Dừng server và ngắt kết nối database
   * Được sử dụng khi shutdown ứng dụng hoặc trong testing
   */
  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          console.log("Server stopped");
          resolve();
        });
      });
    }
  }
}

module.exports = App;
