const mongoose = require("mongoose");

/**
 * Lớp ProductsRepository xử lý việc truy cập dữ liệu sản phẩm
 * Đây là tầng Repository trong kiến trúc Clean Architecture
 * Chịu trách nhiệm thực hiện các thao tác CRUD với database
 */

// Định nghĩa schema cho sản phẩm
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Tên sản phẩm (bắt buộc)
  description: { type: String, required: true }, // Mô tả sản phẩm (bắt buộc)
  price: { type: Number, required: true },       // Giá sản phẩm (bắt buộc)
});

// Tạo model Product từ schema
const Product = mongoose.model("Product", productSchema);

class ProductsRepository {
  /**
   * Tạo sản phẩm mới trong database
   * @param {Object} product - Thông tin sản phẩm cần tạo
   * @returns {Object} - Sản phẩm đã được tạo (dạng plain object)
   */
  async create(product) {
    const createdProduct = await Product.create(product);
    return createdProduct.toObject();
  }

  /**
   * Tìm sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm
   * @returns {Object|null} - Thông tin sản phẩm hoặc null nếu không tìm thấy
   */
  async findById(productId) {
    const product = await Product.findById(productId).lean();
    return product;
  }

  /**
   * Lấy tất cả sản phẩm
   * @returns {Array} - Danh sách tất cả sản phẩm
   */
  async findAll() {
    const products = await Product.find().lean();
    return products;
  }
}

module.exports = ProductsRepository;
