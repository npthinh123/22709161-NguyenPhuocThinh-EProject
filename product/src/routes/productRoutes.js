const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");

// Khởi tạo Express Router
const router = express.Router();
// Tạo instance của ProductController
const productController = new ProductController();

/**
 * Định nghĩa các routes cho Product Service:
 * - POST /: Tạo sản phẩm mới (yêu cầu xác thực)
 * - POST /buy: Tạo đơn hàng từ danh sách sản phẩm (yêu cầu xác thực)  
 * - GET /: Lấy danh sách tất cả sản phẩm (yêu cầu xác thực)
 */
router.post("/", isAuthenticated, productController.createProduct);
router.post("/buy", isAuthenticated, productController.createOrder);
router.get("/", isAuthenticated, productController.getProducts);


module.exports = router;
