const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

let authToken;

describe("Products", () => {
  let app;
  let server;

  before(async function() {
    // Tăng timeout cho before hook
    this.timeout(30000);
    
    // Set environment for testing
    process.env.NODE_ENV = 'test';
    process.env.PORT = 0; // Random port
    
    app = new App();
    
    // Kết nối DB và setup MessageBroker (không fail nếu RabbitMQ lỗi)
    await app.connectDB();
    
    try {
      await app.setupMessageBroker();
      console.log("RabbitMQ connected successfully");
    } catch (error) {
      console.log("Warning: RabbitMQ not available, continuing without it");
    }

    // Start server
    server = app.start();
    const actualPort = server.address().port;
    console.log(`Product test server running on port ${actualPort}`);

    // Authenticate with the auth microservice to get a token
    try {
      const authURL = process.env.AUTH_URL || "http://localhost:3000";
      console.log(`Attempting to connect to auth service at: ${authURL}`);
      
      const authRes = await chai
        .request(authURL)
        .post("/login")
        .send({ 
          username: process.env.LOGIN_TEST_USER || "testuser", 
          password: process.env.LOGIN_TEST_PASSWORD || "password"
        });

      authToken = authRes.body.token;
      console.log("Auth token received:", authToken ? "✓" : "✗");
      if (authToken) {
        console.log("Token preview:", authToken.substring(0, 20) + "...");
      }
    } catch (error) {
      console.log("Warning: Could not get auth token");
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Tests requiring authentication will be skipped");
    }
  });

  after(async () => {
    try {
      await app.stop();
      await app.disconnectDB();
    } catch (error) {
      console.log("Error during cleanup:", error.message);
    }
  });

  describe("POST /products", () => {
    it("should create a new product", async function() {
      if (!authToken) {
        this.skip();
        return;
      }

      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };
      
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            name: "Product 1",
            price: 10,
            description: "Description of Product 1"
          });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async function() {
      if (!authToken) {
        this.skip();
        return;
      }

      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(400);
    });
  });
});

