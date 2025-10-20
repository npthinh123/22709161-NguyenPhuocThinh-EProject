require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    // rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://localhost',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://rabbitmq:5672',
    rabbitMQQueue: 'orders',
    port: process.env.PORT || 3002
};

  