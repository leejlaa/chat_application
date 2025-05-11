import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import "./ChatPage.css"; // If you keep styles in a separate file
import userIcon from "../../assets/icons/user.png";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/^http/, "ws") + "/ws";
const API_URL = import.meta.env.VITE_API_URL;

export default function ChatPage({ username, friend }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Fetch message history when a friend is selected
  useEffect(() => {
    if (!friend || !username) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(`${API_URL}/api/messages/history?friendUsername=${friend}`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch message history");
        return res.json();
      })
      .then(data => {
        setMessages(data);
      })
      .catch(err => {
        console.error("Error fetching message history:", err);
      });
  }, [username, friend]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // WebSocket connection setup
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found.");
      return;
    }

    const client = new Client({
      brokerURL: SOCKET_URL,
      connectHeaders: {
        Authorization: "Bearer " + token.trim(),
      },
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        setConnected(true);

        client.subscribe(`/topic/messages/${username}`, (message) => {
          console.log("👂 Subscribing to /topic/messages/" + username);
          console.log("📨 Received message:", message.body);
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onStompError: (frame) => {
        console.error("❌ Broker error:", frame.headers["message"]);
      },
      onDisconnect: () => {
        console.log("🔌 Disconnected");
        setConnected(false);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, [username]);

  const sendMessage = () => {
    const client = clientRef.current;

    if (!input.trim() || !friend || !client || !client.connected) {
      console.warn("Message not sent. WebSocket is not ready.");
      return;
    }

    const msg = {
      receiver: friend,
      content: input,
      timestamp: new Date().toISOString(),
    };

    console.log("🚀 Sending to /app/chat:", msg);

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify(msg),
    });

    setMessages((prev) => [
      ...prev,
      { sender: username, receiver: friend, content: input, timestamp: new Date().toISOString() },
    ]);
    setInput("");
  };

  // Function to check if a message is the first in a sequence from the same sender
  const isFirstInSequence = (index) => {
    if (index === 0) return true;
    return messages[index].sender !== messages[index - 1].sender;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="friend-profile">
          <div className="friend-avatar">
            <img src={userIcon} alt="User" />
          </div>
          <span className="friend-name">{friend}</span>
        </div>
        {!connected && <p className="connection-status">🔌 Connecting to chat...</p>}
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, idx) => {
          const isSentByMe = msg.sender === username;
          const isFirst = isFirstInSequence(idx);
          
          return (
            <div
              key={idx}
              className={`message-wrapper ${isSentByMe ? "sent-wrapper" : "received-wrapper"}`}
            >
              {!isSentByMe && isFirst ? (
                <div className="sender-avatar">
                  <img src={userIcon} alt="User" />
                </div>
              ) : !isSentByMe && !isFirst ? (
                <div className="avatar-spacer"></div>
              ) : null}
              
              <div className={`message-container ${isSentByMe ? "sent-container" : "received-container"}`}>
                <div className={`message-bubble ${isSentByMe ? "sent" : "received"}`}>
                  {!isSentByMe && isFirst && (
                    <div className="message-sender">{msg.sender}</div>
                  )}
                  <div className="message-content-wrapper">
                    <div className="message-content">
                      {msg.content}
                    </div>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          disabled={!connected}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
