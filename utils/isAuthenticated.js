const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware xác thực JWT token cho các protected routes
 * Kiểm tra token trong Authorization header và xác minh tính hợp lệ
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
function isAuthenticated(req, res, next) {
  // Kiểm tra sự tồn tại của authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Tách token từ header (format: "Bearer <token>")
  const token = authHeader.split(' ')[1];

  try {
    // Xác minh token bằng JWT secret từ environment variables
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Thêm thông tin user đã decode vào request object
    req.user = decodedToken;
    // Cho phép request tiếp tục đến route handler
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = isAuthenticated;
