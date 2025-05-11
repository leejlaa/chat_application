import React from "react";
import "./home.css";
import Sidebar from "./Sidebar";
import ChatPage from "../chat-page/Chatpage";
import RecentChats from "./RecentChats";
import { useState } from "react";

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
        <div style={{ display: "flex" }}>
          <Sidebar username={username} onSelectFriend={handleSelectFriend} />
          
          {selectedFriend && (
            <div style={{ flex: 1 }}>
            <ChatPage username={username} friend={selectedFriend} key={selectedFriend} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
