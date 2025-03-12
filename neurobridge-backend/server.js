require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello from the backend!");

});
app.post("/chat", async (req, res) => {
    try {
        const { model, messages, temperature } = req.body;

        // Use the built-in fetch in Node 18+
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_KEY}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature
            })
        });

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        return res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
