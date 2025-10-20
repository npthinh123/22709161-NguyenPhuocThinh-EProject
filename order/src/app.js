const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

/**
 * Lớp App chính để quản lý Order Service
 * Chịu trách nhiệm khởi tạo server, kết nối database và thiết lập RabbitMQ consumer
 * Service này lắng nghe messages từ Product Service và xử lý đơn hàng
 */
class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setupOrderConsumer();
  }

  /**
   * Kết nối đến MongoDB
   * Sử dụng để lưu trữ thông tin đơn hàng
   */
  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  /**
   * Ngắt kết nối MongoDB
   * Được sử dụng khi shutdown application
   */
  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  /**
   * Thiết lập RabbitMQ consumer để xử lý đơn hàng
   * Lắng nghe queue "orders" từ Product Service và xử lý tạo đơn hàng
   */
  async setupOrderConsumer() {
    console.log("Connecting to RabbitMQ...");
  
    setTimeout(async () => {
      try {
        const amqpServer = "amqp://rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("Connected to RabbitMQ");
        const channel = await connection.createChannel();
        
        await channel.assertQueue("orders");
  
        channel.consume("orders", async (data) => {
          console.log("Consuming ORDER service");
          const { products, username, orderId } = JSON.parse(data.content);
  
          const newOrder = new Order({
            products,
            user: username,
            totalPrice: products.reduce((acc, product) => acc + product.price, 0),
          });
  
          await newOrder.save();
  
          channel.ack(data);
          console.log("Order saved to DB and ACK sent to ORDER queue");
  
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
          );
        });
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000);
  }



  /**
   * Khởi động Order Service trên port được cấu hình
   * Service sẽ chạy ngầm để xử lý đơn hàng từ RabbitMQ
   */
  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  /**
   * Dừng server và ngắt kết nối database
   * Được sử dụng khi shutdown application
   */
  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
