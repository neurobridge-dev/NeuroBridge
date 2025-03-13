// App.js
import React from "react";
import ChatBot from "./components/ChatBot";
import HeaderBar from "./components/HeaderBar";

function App() {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-900 to-pink-600 text-white font-sans">
            <HeaderBar />
            <div className="
        absolute
        overflow-auto
        overscroll-contain
        [@supports(-webkit-overflow-scrolling:touch)]:-webkit-overflow-scrolling-touch
            ">
                <ChatBot />
            </div>
        </div>
    );
}

export default App;
