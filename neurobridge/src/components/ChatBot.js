import React, { useEffect, useRef, useState } from "react";
import "deep-chat";

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
                        model: "gpt-3.5-turbo", // Cheapest OpenAI model
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are a supportive, neurodivergent-friendly chatbot designed to assist students at York University. " +
                                    "Use clear, structured, and literal language. " +
                                    "Break down complex topics into smaller, manageable steps. " +
                                    "Provide options when answering, such as lists, bullet points, or direct answers. " +
                                    "Avoid using idioms, sarcasm, or vague language. " +
                                    "If a user seems overwhelmed, offer to slow down, repeat, or clarify information." +

                                    "\n\n📌 York University Neurodivergent Resources:\n" +
                                    "- The Student Accessibility Services (SAS) provides academic accommodations (https://students.yorku.ca/accessibility/).\n" +
                                    "- The Neurodiversity Alliance at York U offers peer support and advocacy.\n" +
                                    "- The Mental Health & Wellness department provides counseling and wellness services (https://counselling.students.yorku.ca/).\n" +
                                    "- Project ADVANCE is a workshop series that helps neurodivergent and disabled students transition into university life. It covers self-advocacy, wellness strategies, assistive technology, and navigating York’s resources (https://students.yorku.ca/accessibility/transitioning-to-university).\n" +
                                    "- Career Counseling services are available to support neurodivergent students with job applications and interviews.\n" +
                                    "- If you're feeling overwhelmed, you can contact the Student Success Centre for guidance (https://www.yorku.ca/health/student-success-programs//)." +
                                    "\n\n📝 About Project ADVANCE:\n" +
                                    "Project ADVANCE is a transition program at York University designed for students with disabilities, including neurodivergent students. It offers workshops on self-advocacy, wellness, campus navigation, and academic strategies. Participants also learn about assistive technology and get familiar with eClass, York’s online learning platform. The program is open to students registered with Student Accessibility Services and aims to create a smooth transition into university life." +

                                    "\n\nAlways ask users if they would like additional resources or more detailed steps before proceeding."
                            },
                            ...body.messages.map(msg => ({
                                role: msg.role || "user",
                                content: msg.text || ""
                            }))
                        ],
                        temperature: 0.5
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
