const mongoose = require("mongoose");

/**
 * Schema định nghĩa cấu trúc dữ liệu cho sản phẩm trong MongoDB
 * Bao gồm tên, giá và mô tả sản phẩm
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },    // Tên sản phẩm (bắt buộc)
  price: { type: Number, required: true },   // Giá sản phẩm (bắt buộc)
  description: { type: String },             // Mô tả sản phẩm (tùy chọn)
}, { collection : 'products' });             // Chỉ định tên collection trong MongoDB

// Xuất model Product dựa trên productSchema
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
