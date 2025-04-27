import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Sidebar from "./Sidebar";

export default function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    navigate("/login"); // Redirect back to login on logout
  };

  return (
    <div className="home-page">
      <div className="content">
        <div style={{ fontSize: "1.5rem", marginBottom: "20px", color: "black" }}>Hi, {username}</div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <Sidebar username={username} />
    </div>
  );
}
