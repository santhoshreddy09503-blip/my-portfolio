const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// =====================================
// 1. Load Environment Variables
// =====================================

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// 2. Validate Email Configuration
// =====================================

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error(
    "ERROR: GMAIL_USER or GMAIL_APP_PASSWORD is missing in server/.env"
  );
  process.exit(1);
}

// =====================================
// 3. Middleware
// =====================================

app.use(express.json({ limit: "10kb" }));

// Serve portfolio files from the parent folder
app.use(express.static(path.join(__dirname, "..")));

// =====================================
// 4. Configure Gmail with Nodemailer
// =====================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// =====================================
// 5. Contact Form API
// =====================================

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    // Trim input values
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // Validate input lengths and email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanSubject.length > 200 ||
      cleanMessage.length > 5000 ||
      !emailPattern.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your details and try again.",
      });
    }

    // Send email to your configured Gmail inbox
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: cleanEmail,
      subject: `Portfolio Contact: ${cleanSubject}`,
      text: [
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Subject: ${cleanSubject}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    // Log the actual error in the PowerShell terminal
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your message. Please check the server terminal.",
    });
  }
});

// =====================================
// 6. Handle Unknown API Routes
// =====================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// =====================================
// 7. Handle Invalid JSON
// =====================================

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request.",
    });
  }

  console.error("Server error:", error);

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

// =====================================
// 8. Start Server
// =====================================

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});