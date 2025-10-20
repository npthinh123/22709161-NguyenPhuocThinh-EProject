const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("../services/orderService");

/**
 * Lớp MessageBroker để quản lý kết nối và xử lý messages từ RabbitMQ
 * Chịu trách nhiệm kết nối đến RabbitMQ và consume messages từ order queue
 */
class MessageBroker {
  /**
   * Kết nối đến RabbitMQ và thiết lập consumer cho order queue
   * Lắng nghe messages từ Product Service và xử lý tạo đơn hàng
   */
  static async connect() {
    try {
      // Kết nối đến RabbitMQ server
      const connection = await amqp.connect(config.rabbitMQURI);
      const channel = await connection.createChannel();

      // Tạo queue nếu chưa tồn tại, durable=true để queue tồn tại sau khi restart
      await channel.assertQueue(config.rabbitMQQueue, { durable: true });

      // Lắng nghe và xử lý messages từ order queue
      channel.consume(config.rabbitMQQueue, async (message) => {
        try {
          // Parse thông tin đơn hàng từ message
          const order = JSON.parse(message.content.toString());
          const orderService = new OrderService();
          
          // Tạo đơn hàng thông qua OrderService
          await orderService.createOrder(order);
          
          // Acknowledge message để xác nhận đã xử lý
          channel.ack(message);
        } catch (error) {
          console.error(error);
          // Reject message nếu có lỗi, requeue=false để không đưa lại vào queue
          channel.reject(message, false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MessageBroker;
