// AppBar for Homepage.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AppBar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Inline styles
  const styles = {
    appbar: {
      width: "100%",
      padding: "15px 0",
      background: "rgba(0,0,0, 0.95)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    },
    container: {
      width: "90%",
      maxWidth: "1300px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
    },
    logo: {
      height: "55px",
      cursor: "pointer",
      transition: "transform 0.3s ease",
    },
    navLinks: {
      display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "15px" : "18px",
      position: isMobile ? "absolute" : "static",
      top: isMobile ? "70px" : "auto",
      right: isMobile ? "20px" : "auto",
      background: isMobile ? "rgba(11,29,43,0.95)" : "transparent",
      padding: isMobile ? "20px" : "0",
      borderRadius: isMobile ? "10px" : "0",
      textAlign: isMobile ? "center" : "left",
    },
    navBtn: {
      padding: "4px 22px",
      color: "#00eaff",
      border: "2px solid #00eaff",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 500,
      transition: "0.3s ease",
      display: "block",
    },
    navBtnPrimary: {
      padding: "4px 22px",
      backgroundColor: "#00eaff",
      color: "#0b1d2b",
      border: "2px solid #00eaff",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 500,
      transition: "0.3s ease",
      display: "block",
    },
    hamburger: {
      display: isMobile ? "flex" : "none",
      flexDirection: "column",
      justifyContent: "space-around",
      width: "30px",
      height: "22px",
      cursor: "pointer",
    },
    bar: {
      height: "4px",
      width: "100%",
      backgroundColor: "#00eaff",
      borderRadius: "2px",
      transition: "0.3s",
    },
  };

  return (
    <header style={styles.appbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logoSection}>
          <img
            src="/logo.png" // <-- replace with your logo
            alt="Logo"
            style={styles.logo}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        </Link>

        {/* Hamburger Menu for Mobile */}
        {isMobile && (
          <div
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div style={{ ...styles.bar, transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "rotate(0)" }} />
            <div style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
            <div style={{ ...styles.bar, transform: menuOpen ? "rotate(-45deg) translate(6px,-6px)" : "rotate(0)" }} />
          </div>
        )}

        {/* Navigation Buttons */}
        <nav style={styles.navLinks}>
          <Link
            to="/login"
            style={styles.navBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#00eaff", e.target.style.color = "#0b1d2b")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent", e.target.style.color = "#00eaff")}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={styles.navBtnPrimary}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#00c7d8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#00eaff")}
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppBar;

