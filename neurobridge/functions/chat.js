require("dotenv").config();

// Use dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
    try {


        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Bad Request. No request body found." })
            };
        }

        // 🔹 Parse the incoming request body
        const { model, messages, temperature } = JSON.parse(event.body);

        // 🔹 Ensure API Key is available
        if (!process.env.OPENAI_KEY) {
            console.error("Error: OPENAI_KEY is missing in Netlify");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "OPENAI_KEY is not set in the environment variables." })
            };
        }

        // 🔹 Make request to OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: model || "gpt-3.5-turbo",
                messages: messages || [],
                temperature: temperature || 0.5
            })
        });

        // 🔹 If OpenAI API fails, return an error response
        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to fetch response from OpenAI" })
            };
        }

        // 🔹 Return OpenAI response
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Unexpected Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
