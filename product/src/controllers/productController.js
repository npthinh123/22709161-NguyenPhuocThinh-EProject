const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

/**
 * Lớp ProductController xử lý các API request liên quan đến sản phẩm
 * Đây là tầng Controller trong kiến trúc Clean Architecture
 * Chịu trách nhiệm xử lý HTTP requests, gọi business logic và trả về responses
 */
class ProductController {

  constructor() {
    // Bind các method để đảm bảo 'this' context đúng
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    // Map để lưu trữ trạng thái đơn hàng trong memory
    this.ordersMap = new Map();
  }

  /**
   * Tạo sản phẩm mới
   * @param {Object} req - Request object chứa thông tin sản phẩm
   * @param {Object} res - Response object để trả về kết quả
   * @param {Function} next - Middleware tiếp theo
   */
  async createProduct(req, res, next) {
    try {
      // Kiểm tra token xác thực
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Tạo instance Product từ dữ liệu request
      const product = new Product(req.body);

      // Validate dữ liệu sản phẩm
      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      // Lưu sản phẩm vào database với timeout 30s
      await product.save({ timeout: 30000 });

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  /**
   * Tạo đơn hàng từ danh sách sản phẩm
   * Gửi thông tin đơn hàng qua RabbitMQ đến Order Service
   * @param {Object} req - Request object chứa danh sách ID sản phẩm
   * @param {Object} res - Response object để trả về kết quả
   * @param {Function} next - Middleware tiếp theo
   */
  async createOrder(req, res, next) {
    try {
      // Kiểm tra token xác thực
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const { ids } = req.body;
      // Tìm các sản phẩm theo danh sách ID
      const products = await Product.find({ _id: { $in: ids } });
  
      // Tạo ID unique cho đơn hàng
      const orderId = uuid.v4(); 
      // Lưu trạng thái đơn hàng vào memory
      this.ordersMap.set(orderId, { 
        status: "pending", 
        products, 
        username: req.user.username
      });
  
      // Gửi thông tin đơn hàng qua RabbitMQ đến Order Service
      await messageBroker.publishMessage("orders", {
        products,
        username: req.user.username,
        orderId, // bao gồm orderId để tracking
      });

      // Lắng nghe phản hồi từ Order Service qua queue "products"
      messageBroker.consumeMessage("products", (data) => {
        const orderData = JSON.parse(JSON.stringify(data));
        const { orderId } = orderData;
        const order = this.ordersMap.get(orderId);
        if (order) {
          // Cập nhật trạng thái đơn hàng khi nhận được response
          this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
          console.log("Updated order:", order);
        }
      });
  
      // Long polling: chờ đến khi đơn hàng được xử lý xong
      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // đợi 1 giây trước khi check lại
        order = this.ordersMap.get(orderId);
      }
  
      // Trả về thông tin đơn hàng hoàn chỉnh
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  

  /**
   * Lấy trạng thái đơn hàng theo ID
   * @param {Object} req - Request object chứa orderId trong params
   * @param {Object} res - Response object để trả về trạng thái đơn hàng
   * @param {Function} next - Middleware tiếp theo
   */
  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    // Tìm đơn hàng trong memory map
    const order = this.ordersMap.get(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  }

  /**
   * Lấy danh sách tất cả sản phẩm
   * @param {Object} req - Request object
   * @param {Object} res - Response object để trả về danh sách sản phẩm
   * @param {Function} next - Middleware tiếp theo
   */
  async getProducts(req, res, next) {
    try {
      // Kiểm tra token xác thực
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Lấy tất cả sản phẩm từ database
      const products = await Product.find({});

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
