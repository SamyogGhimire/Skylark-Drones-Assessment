const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRouter = require("../routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Skylark BI Agent"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

module.exports = app;