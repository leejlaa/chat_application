import React from "react";
import "./home.css";
import Sidebar from "./Sidebar";
import ChatPage from "../chat-page/Chatpage";
import RecentChats from "./RecentChats";
import { useState } from "react";
import logo from "../../assets/icons/logo.png";

export default function Home() {
  const username = localStorage.getItem("username");
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="home-page">
      <RecentChats username={username} onSelectFriend={handleSelectFriend} />
      <div className="main-content">
        <Sidebar username={username} onSelectFriend={handleSelectFriend} />
        
        {selectedFriend ? (
          <div style={{ flex: 1 }}>
            <ChatPage username={username} friend={selectedFriend} key={selectedFriend} />
          </div>
        ) : (
          <div className="welcome-screen">
            <img src={logo} alt="App Logo" className="welcome-logo" />
            <h2 className="welcome-message">Connect With Your Friends!</h2>
          </div>
        )}
      </div>
    </div>
  );
}
