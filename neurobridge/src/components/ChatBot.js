import React, { useEffect, useRef, useState } from "react";
import "deep-chat";
import chatConfig from "./chatConfig";

const ChatBot = () => {
    const chatRef = useRef(null);
    const chatHistoryRef = useRef([]);

    useEffect(() => {
        if (!chatRef.current) return;

        chatRef.current.loadHistory = () => {
            if (chatHistoryRef.current.length === 0) {
                return [{ text: "Hey, how can I help you today?", role: "assistant" }];
            }
            return chatHistoryRef.current;
        };

        chatRef.current.connect = {
            url: "/.netlify/functions/chat",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            stream: false,
            handler: async (body, signals) => {
                try {
                    const fullMessageHistory = [
                        { role: "system", content: chatConfig.systemMessage },
                        ...chatHistoryRef.current.map((msg) => ({
                            role: msg.role,
                            content: msg.text,
                        })),
                        {
                            role: "user",
                            content: body.messages[body.messages.length - 1].text,
                        },
                    ];

                    const formattedBody = {
                        model: chatConfig.model,
                        messages: fullMessageHistory,
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


                        chatHistoryRef.current.push(
                            { text: body.messages[body.messages.length - 1].text, role: "user" },
                            { text: responseText, role: "assistant" }
                        );
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
    }, []);


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