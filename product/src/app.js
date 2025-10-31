const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
const productsRouter = require("./routes/productRoutes");
require("dotenv").config();

/**
 * Lớp App chính để quản lý Product Service
 * Chịu trách nhiệm khởi tạo server, kết nối database, thiết lập routes và message broker
 */
class App {
  constructor() {
    // Khởi tạo ứng dụng Express
    this.app = express();
    // Kết nối đến MongoDB
    this.connectDB();
    // Thiết lập middleware
    this.setMiddlewares();
    // Thiết lập routes
    this.setRoutes();
    // Thiết lập kết nối RabbitMQ
    this.setupMessageBroker();
  }

  /**
   * Kết nối đến MongoDB
   * Sử dụng để lưu trữ thông tin sản phẩm
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
   * Được sử dụng khi shutdown application hoặc trong testing
   */
  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  /**
   * Thiết lập middleware cho Express
   * - express.json(): Parse JSON từ request body
   * - express.urlencoded(): Parse dữ liệu từ form
   */
  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  /**
   * Thiết lập routes cho Product Service
   * Tất cả routes sản phẩm được định nghĩa trong /api/products
   */
  setRoutes() {
    this.app.use("/api/products", productsRouter);
  }

  /**
   * Thiết lập kết nối RabbitMQ
   * Để giao tiếp với Order Service thông qua message queues
   */
  async setupMessageBroker() {
    try {
      await MessageBroker.connect();
    } catch (error) {
      console.log("RabbitMQ connection failed:", error.message);
      console.log("Continuing without RabbitMQ...");
    }
  }

  /**
   * Khởi động Product Service trên port 3001 (hoặc port từ env)
   * Server sẽ lắng nghe các request liên quan đến sản phẩm
   */
  start() {
    const PORT = process.env.PORT || 3001;
    this.server = this.app.listen(PORT, () =>
      console.log(`Server started on port ${PORT}`)
    );
    return this.server;
  }

  /**
   * Dừng server và ngắt kết nối database
   * Được sử dụng khi shutdown application hoặc trong testing
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
