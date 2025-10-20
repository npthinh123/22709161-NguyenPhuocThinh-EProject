const express = require("express");
const httpProxy = require("http-proxy");

/**
 * API Gateway - Điểm truy cập duy nhất cho tất cả client requests
 * Chịu trách nhiệm định tuyến requests đến các microservices phù hợp
 * Cung cấp một interface thống nhất cho client truy cập các services
 */

const proxy = httpProxy.createProxyServer();
const app = express();

app.use("/auth", (req, res) => {
  proxy.web(req, res, { target: "http://auth:3000" });
});

app.use("/products", (req, res) => {
  proxy.web(req, res, { target: "http://product:3001" });
});

app.use("/orders", (req, res) => {
  proxy.web(req, res, { target: "http://order:3002" });
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
