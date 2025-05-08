import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import "./ChatPage.css"; // If you keep styles in a separate file

const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/^http/, "ws") + "/ws";

export default function ChatPage({ username, friend }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

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
    };

    console.log("🚀 Sending to /app/chat:", msg);

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify(msg),
    });

    setMessages((prev) => [
      ...prev,
      { sender: username, receiver: friend, content: input },
    ]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h2>Chat with {friend}</h2>
      {!connected && <p style={{ color: "gray" }}>🔌 Connecting to chat...</p>}

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender === username ? "chat-bubble sent" : "chat-bubble received"
            }
          >
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
