import React, { useEffect, useRef, useState } from "react";
import "deep-chat"; // Import DeepChat Web Component

const ChatBot = () => {
    const chatRef = useRef(null);
    const [lastResponse, setLastResponse] = useState(""); // Store last AI response

    const apiKey = process.env.REACT_APP_OPENAI_KEY;

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.style.width = "400px";
            chatRef.current.style.height = "500px";
            chatRef.current.style.borderRadius = "10px";

            console.log("Using API Key:", apiKey ? "Found" : "Not Found");

            chatRef.current.connect = {
                url: "https://api.openai.com/v1/chat/completions",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                handler: (body, signals) => {
                    console.log("Outgoing Request:", body);

                    const formattedBody = {
                        model: "gpt-3.5-turbo", // cheapest model
                        messages: [
                            {
                                role: "system",
                                content: "You are a patient, neurodivergent-friendly chatbot.Use clear, direct, and literal language." +
                                    "Provide structured responses and avoid metaphors unless explained." +
                                    "Ask if the user wants additional context. Be accommodating to sensory sensitivities and offer multiple response formats when possible."
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
                                setLastResponse(responseText);
                                signals.onResponse({ text: responseText });


                                // speakText(responseText);
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


            chatRef.current.speechToText = {
                webSpeech: { language: "en-US" },
                stopAfterSubmit: true
            };
        }
    }, [apiKey]);

    // const speakText = (text) => {
    //     if ("speechSynthesis" in window) {
    //         const utterance = new SpeechSynthesisUtterance(text);
    //         utterance.lang = "en-US";
    //         utterance.volume = 1.0;
    //         utterance.pitch = 1.0;
    //         utterance.rate = 1.0;
    //         window.speechSynthesis.speak(utterance);
    //     } else {
    //         alert("Text-to-Speech is not supported in this browser.");
    //     }
    // };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh"
        }}>
            <deep-chat ref={chatRef}></deep-chat>

        </div>
    );
};

export default ChatBot;
