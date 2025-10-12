const ProductsRepository = require("../repositories/productsRepository");

/**
 * Lớp ProductsService chứa business logic cho các chức năng sản phẩm
 * Đây là tầng Service trong kiến trúc Clean Architecture
 * Kết nối giữa tầng Controller và tầng Repository, xử lý logic nghiệp vụ
 */
class ProductsService {
  constructor() {
    // Khởi tạo ProductsRepository để truy cập dữ liệu
    this.productsRepository = new ProductsRepository();
  }

  /**
   * Tạo sản phẩm mới
   * @param {Object} product - Thông tin sản phẩm cần tạo
   * @returns {Object} - Sản phẩm đã được tạo
   */
  async createProduct(product) {
    const createdProduct = await this.productsRepository.create(product);
    return createdProduct;
  }

  /**
   * Lấy sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm cần tìm
   * @returns {Object|null} - Thông tin sản phẩm hoặc null nếu không tìm thấy
   */
  async getProductById(productId) {
    const product = await this.productsRepository.findById(productId);
    return product;
  }

  /**
   * Lấy tất cả sản phẩm
   * @returns {Array} - Danh sách tất cả sản phẩm
   */
  async getProducts() {
    const products = await this.productsRepository.findAll();
    return products;
  }
}

module.exports = ProductsService;
