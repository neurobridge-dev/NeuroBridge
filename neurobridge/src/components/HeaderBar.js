// HeaderBar.js
import React from "react";

const HeaderBar = () => {
    return (
        <header className="fixed top-0 left-0 w-full h-16 z-50 bg-black/40 backdrop-blur-md text-white text-center shadow-md border-b border-white/30 px-4 py-2 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold m-0">NeuroBridge</h2>
            <p className="text-base font-light opacity-90 m-0">A Friendly AI ChatBot</p>
        </header>
    );
};

export default HeaderBar;
