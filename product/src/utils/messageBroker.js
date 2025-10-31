const amqp = require("amqplib");

/**
 * Lớp MessageBroker để quản lý kết nối RabbitMQ cho Product Service
 * Chịu trách nhiệm kết nối, gửi và nhận messages qua RabbitMQ
 * Sử dụng pattern Singleton để đảm bảo chỉ có 1 instance
 */
class MessageBroker {
  constructor() {
    // Channel để giao tiếp với RabbitMQ
    this.channel = null;
  }

  /**
   * Kết nối đến RabbitMQ server
   * Delay 20s để đợi RabbitMQ khởi động hoàn toàn trong Docker environment
   */
  async connect() {
    console.log("Connecting to RabbitMQ...");

    // Trong môi trường test, không delay
    const delay = process.env.NODE_ENV === 'test' ? 0 : 20000;

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Kết nối đến RabbitMQ server (sử dụng service name trong Docker)
          const rabbitURI = process.env.RABBITMQ_URI || "amqp://rabbitmq:5672";
          const connection = await amqp.connect(rabbitURI);
          // const connection = await amqp.connect("amqp://localhost:5672");
          this.channel = await connection.createChannel();
          
          // Tạo queue "products" nếu chưa tồn tại
          await this.channel.assertQueue("products");
          console.log("RabbitMQ connected");
          resolve();
        } catch (err) {
          console.error("Failed to connect to RabbitMQ:", err.message);
          reject(err);
        }
      }, delay);
    });
  }

  /**
   * Gửi message đến một queue cụ thể
   * @param {string} queue - Tên queue cần gửi message
   * @param {Object} message - Dữ liệu cần gửi (sẽ được stringify thành JSON)
   */
  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      // Gửi message dưới dạng Buffer JSON đến queue
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Lắng nghe và xử lý messages từ một queue cụ thể
   * @param {string} queue - Tên queue cần lắng nghe
   * @param {Function} callback - Function xử lý message nhận được
   */
  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      // Consume messages từ queue và xử lý bằng callback
      await this.channel.consume(queue, (message) => {
        // Convert message content từ Buffer sang string
        const content = message.content.toString();
        // Parse JSON content
        const parsedContent = JSON.parse(content);
        // Gọi callback để xử lý message
        callback(parsedContent);
        // Acknowledge message để xác nhận đã xử lý
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

// Xuất instance duy nhất của MessageBroker (Singleton pattern)
module.exports = new MessageBroker();
