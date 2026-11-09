module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Portfolio server is running."
    });
};

