import React, { useState, useEffect } from "react";
import "./RecentChats.css";
import userIcon from "../../assets/icons/user.png";
import { FaUsers } from "react-icons/fa"; // install with: npm i react-icons
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function RecentChats({ username, onSelectFriend }) {
  const [recentChats, setRecentChats] = useState([]);
  const [userGroups, setUserGroups] = useState([]); // Store the groups
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  
  const navigate = useNavigate();

  // Function to toggle friend selection
  const toggleFriendSelection = (friend) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friend)
        ? prevSelected.filter((f) => f !== friend)
        : [...prevSelected, friend]
    );
  };

  // Fetch friends list once when modal opens
  useEffect(() => {
    if (showGroupModal) {
      const token = localStorage.getItem("authToken");
      fetch(`${API_URL}/api/friends/list?username=${username}`, {
        headers: { "Authorization": "Bearer " + token },
      })
        .then((res) => res.json())
        .then((data) => setFriendsList(data))
        .catch(console.error);
    }
  }, [showGroupModal]);

  // Function to create a group
  const handleCreateGroup = () => {
    const token = localStorage.getItem("authToken");

    // Create group
    fetch(`${API_URL}/api/groups/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        name: groupName,
        ownerId: username,
        memberUsernames: selectedFriends, // Correctly send memberUsernames
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create group");
        return res.json();
      })
      .then((data) => {
        console.log("Group created:", data);
        alert("Group created!");
        setShowGroupModal(false);
        setGroupName("");
        setSelectedFriends([]);

        // Now refresh the recent chats and groups
        refreshRecentChats();
        fetchUserGroups();  // Fetch updated groups
      })
      .catch((err) => {
        console.error(err);
        alert("Error creating group");
      });
  };

  // Function to refresh recent chats
  const refreshRecentChats = () => {
    const token = localStorage.getItem("authToken");

    fetch(`${API_URL}/api/messages/recent`, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent chats");
        return res.json();
      })
      .then((data) => {
        setRecentChats(data);
      })
      .catch((err) => {
        console.error("Error fetching recent chats:", err);
        setError("Could not load recent chats");
      });
  };

  // Fetch user groups when component mounts
  const fetchUserGroups = () => {
    const token = localStorage.getItem("authToken");
    fetch(`${API_URL}/api/groups/my`, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user groups");
        return res.json();
      })
      .then((data) => {
        setUserGroups(data); // Set the groups for the user
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user groups:", err);
        setError("Could not load user groups");
        setLoading(false);
      });
  };

  // Fetch recent chats and user groups on component mount
  useEffect(() => {
    if (!username) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    setError(null);

    // Fetch recent chats
    fetch(`${API_URL}/api/messages/recent`, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent chats");
        return res.json();
      })
      .then((data) => {
        setRecentChats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recent chats:", err);
        setError("Could not load recent chats");
        setLoading(false);
      });

    // Fetch user groups
    fetchUserGroups();  // Fetch groups for the user
  }, [username]);

  // Format timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // This week
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    // This year
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Get chat partner name (the other person in the conversation)
  const getChatPartner = (chat) => {
    if (chat.isGroup) {
      return chat.groupName;  // Display the group name if it's a group chat
    }

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

  const handleSelectChat = (chat) => {
    if (chat.isGroup) {
      // Navigate to ChatPage for group chat
      navigate(`/chat/${chat.groupId}`);
    } else {
      // Navigate to ChatPage for 1-to-1 chat
      onSelectFriend(chat);
    }
  };

  return (
    <div className="recent-chats">
      <div className="create-group-wrapper">
        <button className="create-group-button" onClick={() => setShowGroupModal(true)}>
          <FaUsers className="icon" />
          <span>Create Group Chat</span>
        </button>
      </div>

      <h2>Your Groups</h2>
      {loading && <div className="loading">Loading your groups...</div>}
      {!loading && error && <div className="error-message">{error}</div>}

      {!loading && !error && userGroups.length === 0 && (
        <div className="no-groups">You are not a member of any groups yet.</div>
      )}

      <ul className="chat-list">
        {userGroups.map((group, index) => (
          <li key={index} className="chat-item" onClick={() => handleSelectChat(group)}>
             <div className="avatar">
                <img src={userIcon} alt="User" />
              </div>
            <div className="chat-details">
            <div className="chat-content">
            <span className="username">{group.name}</span>
            <div className="message-preview">
                    {group.sender === username ? (
                      <span className="message-text">
                        <span className="you">You: </span>
                        {truncateMessage(group.content)}
                      </span>
                    ) : (
                      <span className="message-text">{truncateMessage(group.content)}</span>
                    )}
                  </div>
            </div>
            <span className="timestamp">{formatTime(group.timestamp)}</span>
            </div>
          </li>
        ))}
      </ul>

      <h2>Recent Chats</h2>
      {!loading && !error && recentChats.length === 0 && (
        <div className="no-chats">No recent conversations</div>
      )}

      <ul className="chat-list">
        {recentChats.map((chat, index) => {
          const chatPartner = getChatPartner(chat);

          return (
            <li key={index} className="chat-item" onClick={() => handleSelectChat(chat)}>
              <div className="avatar">
                <img src={userIcon} alt="User" />
              </div>

              <div className="chat-details">
                <div className="chat-content">
                  <span className="username">{chatPartner}</span>
                  <div className="message-preview">
                    {chat.sender === username ? (
                      <span className="message-text">
                        <span className="you">You: </span>
                        {truncateMessage(chat.content)}
                      </span>
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

      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Group Chat</h2>
            <input
              type="text"
              placeholder="Enter group name"
              className="modal-input"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="friend-list">
              {friendsList.map((friend) => (
                <label key={friend}>
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend)}
                    onChange={() => toggleFriendSelection(friend)}
                  />
                  {friend}
                </label>
              ))}
            </div>

            <div className="modal-buttons">
              <button className="create-btn" onClick={handleCreateGroup}>
                Create
              </button>
              <button className="cancel-btn" onClick={() => setShowGroupModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
