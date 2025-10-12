const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header x-auth-token và xác minh tính hợp lệ
 * Nếu token hợp lệ, thêm thông tin user vào request object
 */
module.exports = function(req, res, next) {
  // Lấy token từ header x-auth-token
  const token = req.header("x-auth-token");

  // Kiểm tra xem có token không
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Xác minh token bằng JWT secret
    const decoded = jwt.verify(token, config.jwtSecret);
    // Thêm thông tin user đã được decode vào request
    req.user = decoded;
    // Cho phép request tiếp tục
    next();
  } catch (e) {
    // Token không hợp lệ
    res.status(400).json({ message: "Token is not valid" });
  }
};
