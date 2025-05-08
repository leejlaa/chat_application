import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Sidebar from "./Sidebar";
import ChatPage from "../chat-page/Chatpage";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [selectedFriend, setSelectedFriend] = useState(null);


  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    navigate("/login"); // Redirect back to login on logout
  };
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="home-page">
      <div className="main-welcome">
        <div style={{ fontSize: "1.5rem", marginBottom: "20px", color: "black" }}>Hi, {username}</div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <Sidebar username={username} />
      <div style={{ display: "flex" }}>
        <Sidebar username={username} onSelectFriend={handleSelectFriend} />
        
        {selectedFriend && (
          <div style={{ flex: 1 }}>
          <ChatPage username={username} friend={selectedFriend} key={selectedFriend} />
          </div>
        )}
      </div>
      
    </div>
  );
}
