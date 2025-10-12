const express = require("express");
const httpProxy = require("http-proxy");

/**
 * API Gateway - Điểm truy cập duy nhất cho tất cả client requests
 * Chịu trách nhiệm định tuyến requests đến các microservices phù hợp
 * Cung cấp một interface thống nhất cho client truy cập các services
 */

// Tạo proxy server để forward requests
const proxy = httpProxy.createProxyServer();
const app = express();

/**
 * Định tuyến requests đến Auth Service (port 3000)
 * Xử lý các chức năng: đăng nhập, đăng ký, xác thực
 */
app.use("/auth", (req, res) => {
  proxy.web(req, res, { target: "http://auth:3000" });
});

/**
 * Định tuyến requests đến Product Service (port 3001) 
 * Xử lý các chức năng: quản lý sản phẩm, tạo đơn hàng
 */
app.use("/products", (req, res) => {
  proxy.web(req, res, { target: "http://product:3001" });
});

/**
 * Định tuyến requests đến Order Service (port 3002)
 * Xử lý các chức năng: quản lý đơn hàng, theo dõi trạng thái đơn hàng
 */
app.use("/orders", (req, res) => {
  proxy.web(req, res, { target: "http://order:3002" });
});

/**
 * Khởi động API Gateway trên port 3003
 * Tất cả client requests sẽ đi qua gateway này
 */
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
