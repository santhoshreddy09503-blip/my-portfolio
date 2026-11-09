const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the project root folder.
dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, "..");

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// Serve frontend files.
app.use(express.static(ROOT_DIR));

// Check backend.
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Portfolio server is running."
  });
});

// Check Gmail configuration.
app.get("/api/email-check", (_req, res) => {
  res.json({
    gmailUserLoaded: Boolean(process.env.GMAIL_USER),
    gmailPasswordLoaded: Boolean(process.env.GMAIL_APP_PASSWORD)
  });
});

// Contact form.
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (![name, email, subject, message].every(
      (value) => typeof value === "string" && value.trim().length > 0
    )) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    const clean = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    };

    // Correct email validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      clean.name.length > 100 ||
      clean.email.length > 254 ||
      clean.subject.length > 200 ||
      clean.message.length > 5000 ||
      !emailPattern.test(clean.email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your details and try again."
      });
    }

    // Check Gmail credentials.
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing Gmail environment variables.");

      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Please contact the site owner directly."
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "")
      }
    });

    // Send email.
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: clean.email,
      subject: `Portfolio Contact: ${clean.subject}`,
      text: `Name: ${clean.name}
Email: ${clean.email}
Subject: ${clean.subject}

Message:
${clean.message}`
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!"
    });

  } catch (error) {
    console.error("Email sending error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again later."
    });
  }
});

// Unknown API routes.
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

// Error handling.
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
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

// Start server.
app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log("GMAIL_USER:", process.env.GMAIL_USER ? "Loaded" : "Missing");
  console.log(
    "GMAIL_APP_PASSWORD:",
    process.env.GMAIL_APP_PASSWORD ? "Loaded" : "Missing"
  );
});