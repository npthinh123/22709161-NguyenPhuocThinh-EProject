const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header x-auth-token và xác minh tính hợp lệ
 * Nếu token hợp lệ, thêm thông tin user vào request object
 */
module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Token is not valid" });
  }
};
