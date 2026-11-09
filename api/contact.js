try {
    require("dotenv").config();
} catch {}

const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
    // Enable CORS for external requests
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                body = {};
            }
        }

        const { name, email, subject, message } = body || {};

        // Validate empty fields
        if (![name, email, subject, message].every(
            value => typeof value === "string" && value.trim().length > 0
        )) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        // Clean submitted data
        const clean = {
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim()
        };

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

        // Check Gmail credentials in environment variables
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.error("Missing Gmail environment variables.");
            return res.status(503).json({
                success: false,
                message: "Email service is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel settings."
            });
        }

        // Create Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "")
            }
        });

        // Send email
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
};

