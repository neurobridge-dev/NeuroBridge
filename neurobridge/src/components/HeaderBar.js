import React from "react";

const HeaderBar = () => {
    return (
        <header style={styles.header}>
            <h2 style={styles.title}>NeuroBridge</h2>
            <p style={styles.subtitle}>A Friendly AI ChatBot</p>
        </header>
    );
};

const styles = {
    header: {
        width: "100vw",
        textAlign: "center",
        padding: "10px 0",
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "1000",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(20px)",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    },
    title: {
        margin: "0",
        fontSize: "2rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: "0",
        fontSize: "1rem",
        fontWeight: "300",
        opacity: "0.9",
    },
};

export default HeaderBar;
