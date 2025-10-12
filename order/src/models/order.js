const mongoose = require('mongoose');

/**
 * Schema định nghĩa cấu trúc dữ liệu cho đơn hàng trong MongoDB
 * Bao gồm danh sách sản phẩm, tổng giá trị và thời gian tạo
 */
const orderSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu đến collection products
    ref: 'products',                       // Tên collection được tham chiếu
    required: true,                        // Đơn hàng phải có ít nhất 1 sản phẩm
  }],
  totalPrice: {
    type: Number,
    required: true,                        // Tổng giá trị là bắt buộc
    min: 0,                               // Giá trị phải >= 0
  },
  createdAt: {
    type: Date,
    default: Date.now,                     // Tự động set thời gian hiện tại khi tạo
  },
}, { collection : 'orders' });             // Chỉ định tên collection trong MongoDB

// Xuất model Order dựa trên orderSchema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
