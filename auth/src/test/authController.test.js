const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
require("dotenv").config();


chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication", () => {
  let app;
  let server;

  before(async () => {
    // Sử dụng port 0 để hệ thống tự động chọn port ngẫu nhiên
    process.env.PORT = 0;
    
    app = new App();
    await app.connectDB();
    server = app.start();
    
    // Lấy port thực tế được assigned
    const address = server.address();
    const actualPort = address.port;
    console.log(`Test server running on port ${actualPort}`);
  });

  after(async () => {
    try {
      await app.authController.authService.deleteTestUsers();
    } catch (err) {
      console.log("Error deleting test users:", err.message);
    }
    
    await app.stop();
    await app.disconnectDB();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await chai
        .request(app.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username", "testuser");
    });

    it("should return an error if the username is already taken", async () => {
      const res = await chai
        .request(app.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username already taken");
    });
  });

  describe("POST /login", () => {
    it("should return a JWT token for a valid user", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("should return an error for an invalid user", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "invaliduser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });

    it("should return an error for an incorrect password", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });
  });
});
