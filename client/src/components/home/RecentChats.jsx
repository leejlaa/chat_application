import React, { useState, useEffect } from "react";
import "./RecentChats.css";
import userIcon from "../../assets/icons/user.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function RecentChats({ username, onSelectFriend }) {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent chats when component mounts
  useEffect(() => {
    if (!username) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    setError(null);

    // Try fetching recent chats first
    fetch(`${API_URL}/api/messages/recent`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch recent chats");
        return res.json();
      })
      .then(data => {
        setRecentChats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recent chats:", err);
        
        // Fallback to friends list if recent chats fails
        fetch(`${API_URL}/api/friends/list?username=${username}`, {
          headers: {
            "Authorization": "Bearer " + token
          }
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch friends list");
            return res.json();
          })
          .then(friends => {
            // Simulate recent chats with empty messages
            const mockRecentChats = friends.map(friend => ({
              id: Math.random().toString(36).substring(7),
              sender: username,
              receiver: friend,
              content: "Start a conversation...",
              timestamp: new Date().toISOString()
            }));
            setRecentChats(mockRecentChats);
            setLoading(false);
          })
          .catch(friendErr => {
            console.error("Error with fallback:", friendErr);
            setError("Could not load recent chats");
            setLoading(false);
          });
      });
  }, [username]);

  // Format timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // This week
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // This year
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get chat partner name (the other person in the conversation)
  const getChatPartner = (chat) => {
    if (chat.sender === username) {
      return chat.receiver;
    }
    return chat.sender;
  };

  // Truncate long messages
  const truncateMessage = (message, maxLength = 40) => {
    if (!message) return "";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="recent-chats">
      <h2>Recent Chats</h2>
      
      {loading && <div className="loading">Loading recent chats...</div>}
      
      {!loading && error && (
        <div className="error-message">{error}</div>
      )}
      
      {!loading && !error && recentChats.length === 0 && (
        <div className="no-chats">No recent conversations</div>
      )}
      
      <ul className="chat-list">
        {recentChats.map((chat, index) => {
          const chatPartner = getChatPartner(chat);
          
          return (
            <li 
              key={index} 
              className="chat-item"
              onClick={() => onSelectFriend(chatPartner)}
            >
              <div className="avatar">
                <img src={userIcon} alt="User" />
              </div>
              
              <div className="chat-details">
                <div className="chat-content">
                  <span className="username">{chatPartner}</span>
                  <div className="message-preview">
                    {chat.sender === username ? (
                      <span className="message-text"><span className="you">You: </span>{truncateMessage(chat.content)}</span>
                    ) : (
                      <span className="message-text">{truncateMessage(chat.content)}</span>
                    )}
                  </div>
                </div>
                <span className="timestamp">{formatTime(chat.timestamp)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 