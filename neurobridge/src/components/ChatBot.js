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

        // Connect to your Netlify function
        chatRef.current.connect = {
            url: "/.netlify/functions/chat",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            stream: true,
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

                        // Append the user and AI messages to state.
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


        chatRef.current.speechToText = {
            webSpeech: { language: "en-US" },
            stopAfterSubmit: true,
        };
    }, [chatHistory]);

    return (
        <div className="absolute inset-0 w-screen h-screen flex flex-col pt-[70px] pb-[30px]">

            <deep-chat
                ref={chatRef}
                className="flex-1 w-full h-full"
                style={{
                    width: "100vw",
                    height: "calc(100vh - 70px)",
                    paddingTop: "10px",
                    borderRadius: "0px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            ></deep-chat>
        </div>
    );
};

export default ChatBot;
