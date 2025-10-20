const mongoose = require("mongoose");

/**
 * Schema định nghĩa cấu trúc dữ liệu cho người dùng trong MongoDB
 * Bao gồm username và password (đã được hash)
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);