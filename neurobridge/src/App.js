import React from "react";
import ChatBot from "./components/ChatBot";
import HeaderBar from "./components/HeaderBar";

function App() {
    return (
        <div className="w-screen h-screen flex flex-col bg-gradient-to-r from-indigo-600 via-purple-900 to-pink-600 text-white font-sans overflow-hidden">
            <HeaderBar />
            <ChatBot />
        </div>
    );
}

export default App;
