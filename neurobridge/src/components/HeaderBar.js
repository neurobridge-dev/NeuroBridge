import React from "react";

const HeaderBar = () => {
    return (
        <header className="w-full fixed top-0 left-0 z-50 bg-black bg-opacity-40 backdrop-blur-md text-white text-center shadow-md border-b border-white/30 px-4 py-2">
            <h2 className="text-2xl font-bold m-0">NeuroBridge</h2>
            <p className="text-base font-light opacity-90 m-0">A Friendly AI ChatBot</p>
        </header>
    );
};

export default HeaderBar;