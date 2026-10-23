const express = require("express");
const path = require("path");

const app = express();

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


