import React, { useEffect, useRef, useState } from "react";
import "deep-chat";
import chatConfig from "./chatConfig";

const ChatBot = () => {
    const chatRef = useRef(null);

    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (!chatRef.current) return;


        chatRef.current.loadHistory = () => {
            if (chatHistory.length === 0) {
                return [{ text: "Hey, how can I help you today?", role: "ai" }];
            }
            return chatHistory;
        };

        // Connect to Netlify function
        chatRef.current.connect = {
            url: "/.netlify/functions/chat",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            stream: true, // Keep if you need streaming responses
            handler: async (body, signals) => {
                try {
                    const formattedBody = {
                        model: chatConfig.model,
                        messages: [
                            { role: "system", content: chatConfig.systemMessage },
                            ...body.messages.map((msg) => ({
                                role: msg.role || "user",
                                content: msg.text || "",
                            })),
                        ],
                        temperature: chatConfig.temperature,
                    };

                    const response = await fetch("/.netlify/functions/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formattedBody),
                    });
                    const data = await response.json();

                    if (data.choices && data.choices.length > 0) {
                        const responseText = data.choices[0].message.content;
                        signals.onResponse({ text: responseText });

                        // Append user & AI messages
                        const userText = body.messages[body.messages.length - 1].text;
                        setChatHistory((prev) => [
                            ...prev,
                            { text: userText, role: "user" },
                            { text: responseText, role: "ai" },
                        ]);
                    } else {
                        signals.onResponse({ error: "No response from AI" });
                    }
                } catch (err) {
                    console.error("API Error:", err);
                    signals.onResponse({ error: "Failed to fetch response" });
                }
            },
        };

        // Optional speech-to-text
        chatRef.current.speechToText = {
            webSpeech: { language: "en-US" },
            stopAfterSubmit: true,
        };
    }, [chatHistory]);

    return (
        <div className="flex flex-col w-screen h-screen pt-[70px] pb-[30px]">


            <main className="flex-1 overflow-auto">
                <deep-chat
                    ref={chatRef}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                        justifyContent: "space-between",
                    }}
                ></deep-chat>
            </main>
        </div>
    );
};

export default ChatBot;
