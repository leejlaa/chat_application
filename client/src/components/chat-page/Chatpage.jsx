import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./Chatpage.css";
import sendIcon from "../../assets/icons/send_icon.png";
import userIcon from "../../assets/icons/user.png";

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_URL + "/ws"; // Keep it HTTP!

export default function ChatPage({ username, chat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const chatBoxRef = useRef(null);

  const isGroup = chat?.isGroup === true;
  const chatTitle = isGroup ? chat.name : chat;

  // Auto-scroll on new messages
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  // Load message history
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !chat || !username) return;

    const url = isGroup
      ? `${API_URL}/api/group-messages/history?groupId=${chat.id}`
      : `${API_URL}/api/messages/history?friendUsername=${chat}`;

    fetch(url, {
      headers: { Authorization: "Bearer "+ token },
    })
      .then((res) => res.json())
      .then(setMessages)
      .catch(console.error);
  }, [chat, username]);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !username) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: { Authorization: "Bearer " + token.trim()},
      debug: (str) => console.log("STOMP DEBUG:", str),
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        setConnected(true);

        const topic = isGroup
          ? `/topic/group/${chat.id}`
          : `/topic/messages/${username}`;

        client.subscribe(topic, (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
      onWebSocketError: (err) => {
        console.error("❌ WebSocket error:", err);
      },
      onDisconnect: () => {
        console.warn("🔌 Disconnected");
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) client.deactivate();
    };
  }, [username, chat]);

  // Send a message
  const sendMessage = () => {
    const client = clientRef.current;
    if (!input.trim() || !connected || !client || !client.connected) return;

    const now = new Date().toISOString();

    const messagePayload = isGroup
      ? {
          groupId: chat.id,
          sender: username,
          content: input.trim(),
          timestamp: now,
        }
      : {
          sender: username,
          receiver: chat,
          content: input.trim(),
          timestamp: now,
        };

    client.publish({
      destination: isGroup ? "/app/group" : "/app/chat",
      body: JSON.stringify(messagePayload),
    });

    // Optimistic UI update
    setMessages((prev) => [...prev, messagePayload]);
    setInput("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isFirstInSequence = (index) =>
    index === 0 || messages[index].sender !== messages[index - 1].sender;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="friend-profile">
          <div className="friend-avatar">
            <img src={userIcon} alt="User" />
          </div>
          <span className="friend-name">{chatTitle}</span>
        </div>
        {!connected && <p className="connection-status">🔌 Connecting...</p>}
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender === username;
          const first = isFirstInSequence(idx);

          return (
            <div
              key={idx}
              className={`message-wrapper ${isMe ? "sent-wrapper" : "received-wrapper"}`}
            >
              {!isMe && first && (
                <div className="sender-avatar">
                  <img src={userIcon} alt="sender" />
                </div>
              )}
              {!isMe && !first && <div className="avatar-spacer"></div>}

              <div className={`message-container ${isMe ? "sent-container" : "received-container"}`}>
                <div className={`message-bubble ${isMe ? "sent" : "received"}`}>
                  {!isMe && first && (
                    <div className="message-sender">{msg.sender}</div>
                  )}
                  <div className="message-content-wrapper">
                    <div className="message-content">{msg.content}</div>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-footer">
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!connected}
          />
          <button onClick={sendMessage} disabled={!connected || !input.trim()}>
            <img src={sendIcon} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
}
