const express = require("express");
const path = require("path");

const app = express();

// Enable Prometheus metrics if prom-client is available (for DOSSL monitoring)
try {
    const client = require("prom-client");
    if (client && client.collectDefaultMetrics) {
        client.collectDefaultMetrics();

        const httpRequestCounter = new client.Counter({
            name: "task_manager_http_requests_total",
            help: "Total HTTP requests received"
        });

        app.use((req, res, next) => {
            httpRequestCounter.inc();
            next();
        });

        app.get("/metrics", async (req, res) => {
            res.set("Content-Type", client.register.contentType);
            res.end(await client.register.metrics());
        });
    }
} catch (err) {
    // prom-client not installed in local environment, continue without metrics
}

// Serve static assets from public/ (frontend-only, no backend API)
app.use(express.static(path.join(__dirname, "public")));

// Ensure SPA client-side routes fallback to index.html (Compatible with Express 4 and Express 5)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Luxury Student Task Manager running at http://localhost:${PORT}`);
});
