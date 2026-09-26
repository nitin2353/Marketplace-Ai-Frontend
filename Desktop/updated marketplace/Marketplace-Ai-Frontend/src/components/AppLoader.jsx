import React from "react";
import GAPLLoader from "./GlobalLoader";

const AppLoader = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <GAPLLoader width={350} loading={true} />
        </div>

        <h4 style={styles.title}>Setting Up Your Workspace</h4>

        <p style={styles.subtitle}>
          Fetching your latest records and preparing the dashboard.
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.3)", 
    backdropFilter: "blur(15px)", 
    WebkitBackdropFilter: "blur(15px)", 
    zIndex: 9999,
  },
  card: {
    background: "rgba(255, 255, 255, 0.8)",  
    padding: "45px",
    borderRadius: "28px",
    textAlign: "center",
    width: "450px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginBottom: "-10px",
  },
  title: {
    marginTop: "15px",
    color: "#1a4d66",
    fontWeight: "700",
    fontSize: "1.4rem",
  },
  subtitle: {
    marginTop: "12px",
    fontSize: "15px",
    color: "#4a5568",
    maxWidth: "320px",
    lineHeight: "1.6",
  },
};

export default AppLoader;