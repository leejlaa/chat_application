import React, { useState } from "react";
import "./home.css";
import Sidebar from "./Sidebar";
import ChatPage from "../chat-page/Chatpage";
import RecentChats from "./RecentChats";
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/icons/logo.png";

export default function Home() {
  const username = localStorage.getItem("username");
  const [selectedChat, setSelectedChat] = useState(null); // Can hold either a friend or group
  const navigate = useNavigate();

  const handleSelectChat = (chat) => {
    setSelectedChat(chat); // This can be a friend or a group
    if (chat.isGroup) {
      // Navigate to group chat page
      navigate(`/chat/${chat.groupId}`); 
    } else {
      // Navigate to 1-to-1 chat page
      navigate(`/chat/${chat.receiver}`); 
    }
  };

  return (
    <div className="home-page">
      <RecentChats username={username} onSelectFriend={handleSelectChat} />
      <div className="main-content">
        <Sidebar username={username} onSelectFriend={handleSelectChat} />
        
        {selectedChat ? (
          <div style={{ flex: 1 }}>
            <ChatPage 
              username={username} 
              chat={selectedChat} // Pass the entire chat object
              key={selectedChat.groupId || selectedChat.receiver} // Ensure a unique key
            />
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
