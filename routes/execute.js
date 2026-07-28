const express = require("express");
const router = express.Router();

const { runCode } = require("../services/runner");

router.post("/", async (req, res) => {
    try {
        const { language, code } = req.body;

        if (!language || !code) {
            return res.status(400).json({
                success: false,
                error: "language and code are required"
            });
        }

        if (language !== "python") {
            return res.status(400).json({
                success: false,
                error: "Only Python is supported for now."
            });
        }

        const output = await runCode(language, code);

        res.json({
            success: true,
            output
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
