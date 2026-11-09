
const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// =====================================
// 1. Load environment variables
// =====================================

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

// =====================================
// 2. Initialize Express
// =====================================

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, "..");

// =====================================
// 3. Middleware
// =====================================

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// Serve frontend files
app.use(express.static(ROOT_DIR));

// Handlers shared with Vercel serverless functions
const contactHandler = require("../api/contact");
const healthHandler = require("../api/health");
const emailCheckHandler = require("../api/email-check");

// =====================================
// 4. API Endpoints
// =====================================

app.all("/api/health", healthHandler);
app.all("/api/email-check", emailCheckHandler);
app.all("/api/contact", contactHandler);

// =====================================
// 7. Unknown API routes
// =====================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// =====================================
// 8. Error handling
// =====================================

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error) {

        return res.status(400).json({
            success: false,
            message: "Invalid JSON request."
        });
    }

    console.error("Server error:", error.message);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred."
    });
});

// =====================================
// 9. Start server
// =====================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio server running on port ${PORT}`);

    console.log(
        "GMAIL_USER:",
        process.env.GMAIL_USER ? "Loaded" : "Missing"
    );

    console.log(
        "GMAIL_APP_PASSWORD:",
        process.env.GMAIL_APP_PASSWORD ? "Loaded" : "Missing"
    );
});
