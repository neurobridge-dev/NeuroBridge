import React, { useEffect, useRef, useState } from "react";
import "deep-chat";
import chatConfig from "./chatConfig";

const ChatBot = () => {
    const chatRef = useRef(null);
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.loadHistory = (index) => {
                if (chatHistory.length === 0) {
                    return [{ "text": "Hey, how can I help you today?", "role": "ai" }];
                }
                return chatHistory;
            };

            // Setup Chat API to use Netlify Function
            chatRef.current.connect = {
                url: "/.netlify/functions/chat",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                stream: true,
                handler: (body, signals) => {
                    console.log("Outgoing Request to Netlify:", body);

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

                    // Call Netlify function instead of OpenAI API
                    fetch("/.netlify/functions/chat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(formattedBody)
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Netlify Function Response:", data);
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
                                signals.onResponse({ error: "No response from AI" });
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
