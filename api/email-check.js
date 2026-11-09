module.exports = (req, res) => {
    res.status(200).json({
        gmailUserLoaded: Boolean(process.env.GMAIL_USER),
        gmailPasswordLoaded: Boolean(process.env.GMAIL_APP_PASSWORD)
    });
};
