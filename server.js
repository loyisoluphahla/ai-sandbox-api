const express = require("express");
const cors = require("cors");

const executeRoute = require("./routes/execute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "AI Sandbox API"
    });
});

app.use("/execute", executeRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Sandbox running on port ${PORT}`);
});
