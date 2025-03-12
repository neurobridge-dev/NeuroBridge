import React, { useEffect, useRef, useState } from "react";
import "deep-chat";

const ChatBot = () => {
    const chatRef = useRef(null);
    const [chatHistory, setChatHistory] = useState([]);

    const apiKey = process.env.REACT_APP_OPENAI_KEY;



    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.style.width = "100vw";
            chatRef.current.style.height = "calc(100vh - 100px)";
            chatRef.current.style.marginTop = "100px";
            chatRef.current.style.borderRadius = "0";
            chatRef.current.style.padding = "0";

            // Load chat history
            chatRef.current.loadHistory = (index) => {
                if (chatHistory.length === 0) {
                    return [{ "text": "Hey, how can I help you today?", "role": "ai" }];
                }
                return chatHistory;
            };

            // Setup OpenAI API connection
            chatRef.current.connect = {
                url: "https://api.openai.com/v1/chat/completions",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                stream: true,
                handler: (body, signals) => {
                    console.log("Outgoing Request:", body);

                    const formattedBody = {
                        model: "gpt-3.5-turbo", // Cheapest OpenAI model
                        messages: [
                            {
                                role: "system",
                                content: "You are a patient, neurodivergent-friendly chatbot. " +
                                    "Use clear, direct, and literal language. Provide structured responses " +
                                    "and avoid metaphors unless explained. Ask if the user wants additional context. " +
                                    "Be accommodating to sensory sensitivities and offer multiple response formats when possible."
                            },
                            ...body.messages.map(msg => ({
                                role: msg.role || "user",
                                content: msg.text || ""
                            }))
                        ],
                        temperature: 0.5
                    };

                    fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(formattedBody)
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("OpenAI Response:", data);
                            if (data.choices && data.choices.length > 0) {
                                const responseText = data.choices[0].message.content;
                                signals.onResponse({ text: responseText });

                                // Store message history
                                const newHistory = [
                                    ...chatHistory,
                                    { "text": body.messages[body.messages.length - 1].text, "role": "user" },
                                    { "text": responseText, "role": "ai" }
                                ];
                                setChatHistory(newHistory);
                                localStorage.setItem("chatHistory", JSON.stringify(newHistory));
                            } else {
                                signals.onResponse({ error: "No response from OpenAI" });
                            }
                        })
                        .catch(error => {
                            console.error("API Error:", error);
                            signals.onResponse({ error: "Failed to fetch response" });
                        });
                }
            };

            // Enable speech-to-text
            chatRef.current.speechToText = {
                webSpeech: { language: "en-US" },
                stopAfterSubmit: true
            };
        }
    }, [apiKey, chatHistory]);

    return (
        <div className="chatbot-container">
            <deep-chat ref={chatRef}></deep-chat>
        </div>
    );
};

export default ChatBot;
