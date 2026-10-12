
const express = require("express");
const client = require("prom-client");

const app = express();

// Enable default Node.js metrics
client.collectDefaultMetrics();

// Create HTTP request counter
const httpRequestCounter = new client.Counter({
    name: "task_manager_http_requests_total",
    help: "Total HTTP requests received"
});

// Count incoming requests
app.use((req, res, next) => {
    httpRequestCounter.inc();
    next();
});

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

// Serve the Student Task Manager website
app.use(express.static("public"));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});