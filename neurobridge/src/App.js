import React from "react";
import ChatBot from "./components/ChatBot";
import HeaderBar from "./components/HeaderBar";
import "./App.css";

function App() {
    return (
        <div className="app-container">
            <HeaderBar />
            <ChatBot />
        </div>
    );
}

export default App;
