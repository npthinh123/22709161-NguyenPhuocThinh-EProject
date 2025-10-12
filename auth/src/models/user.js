const mongoose = require("mongoose");

/**
 * Schema định nghĩa cấu trúc dữ liệu cho người dùng trong MongoDB
 * Bao gồm username và password (đã được hash)
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true // Username là bắt buộc
  },
  password: {
    type: String,
    required: true // Password là bắt buộc (sẽ được hash trước khi lưu)
  }
});

// Xuất model User dựa trên UserSchema
module.exports = mongoose.model("User", UserSchema);