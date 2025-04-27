import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import groupIcon from "../../assets/icons/group.png";
import notificationIcon from "../../assets/icons/notification.png";
import addFriendIcon from "../../assets/icons/add-friend.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Sidebar({ username }) {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newFriend, setNewFriend] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authHeader = {
    "Authorization": "Bearer " + localStorage.getItem("authToken")
  };

  // Fetch friends list
  useEffect(() => {
    if (!username) return;
    fetch(`${API_URL}/api/friends/list?username=${username}`, {
      headers: authHeader
    })
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(() => setFriends([]));
  }, [username]);

  // Fetch pending requests
  useEffect(() => {
    if (activeTab !== "requests" || !username) return;
    fetch(`${API_URL}/api/friends/pending?username=${username}`, {
      headers: authHeader
    })
      .then(res => res.json())
      .then(data => setPendingRequests(data))
      .catch(() => setPendingRequests([]));
  }, [activeTab, username]);

  const handleAddFriend = async () => {
    setMessage(""); setErrorMessage("");
    if (!newFriend.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/friends/request?senderUsername=${username}&receiverUsername=${newFriend}`, {
        method: "POST",
        headers: authHeader
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Friend request sent!");
      setNewFriend("");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const handleAccept = async (senderUsername) => {
    setMessage(""); setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/api/friends/accept?receiverUsername=${username}&senderUsername=${senderUsername}`, {
        method: "PUT",
        headers: authHeader
      });
      if (!res.ok) throw new Error(await res.text());
      setPendingRequests(pendingRequests.filter(r => r.sender.username !== senderUsername));
      setMessage("Friend request accepted!");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const handleReject = async (senderUsername) => {
    setMessage(""); setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/api/friends/reject?receiverUsername=${username}&senderUsername=${senderUsername}`, {
        method: "PUT",
        headers: authHeader
      });
      if (!res.ok) throw new Error(await res.text());
      setPendingRequests(pendingRequests.filter(r => r.sender.username !== senderUsername));
      setMessage("Friend request rejected!");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const handleRemoveFriend = async (friendUsername) => {
    setMessage(""); setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/api/friends/remove?username=${username}&friendUsername=${friendUsername}`, {
        method: "DELETE",
        headers: authHeader
      });
      if (!res.ok) throw new Error(await res.text());
      setFriends(friends.filter(f => f !== friendUsername));
      setMessage("Friend removed.");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className={activeTab === "friends" ? "active" : ""} onClick={() => setActiveTab("friends")}> 
          <img src={groupIcon} alt="Friends" className="sidebar-tab-icon" />
        </button>
        <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}> 
          <img src={notificationIcon} alt="Pending" className="sidebar-tab-icon" />
        </button>
        <button className={activeTab === "addFriend" ? "active" : ""} onClick={() => setActiveTab("addFriend")}> 
          <img src={addFriendIcon} alt="Add Friend" className="sidebar-tab-icon" />
        </button>
      </div>
      {message && <div className="message success">{message}</div>}
      {errorMessage && <div className="message error">{errorMessage}</div>}
      <div className="tab-container">
        {activeTab === "friends" && (
          <div className="tab-content">
            <h2>Friends List</h2>
            <ul className="friends-list">
              {friends.length > 0 ? friends.map(friend => (
                <li key={friend} className="friend-item">
                  <span className="username">{friend}</span>
                  <button onClick={() => handleRemoveFriend(friend)}>Remove</button>
                </li>
              )) : <p>No friends yet.</p>}
            </ul>
          </div>
        )}
        {activeTab === "requests" && (
          <div className="tab-content">
            <h2>Pending Requests</h2>
            <ul className="pending-requests">
              {pendingRequests.length > 0 ? pendingRequests.map(req => (
                <li key={req.id} className="pending-item">
                  <span className="username">{req.sender.username}</span>
                  <button onClick={() => handleAccept(req.sender.username)}>Accept</button>
                  <button onClick={() => handleReject(req.sender.username)}>Reject</button>
                </li>
              )) : <p>No pending requests.</p>}
            </ul>
          </div>
        )}
        {activeTab === "addFriend" && (
          <div className="tab-content add-friend">
            <h2>Add Friend</h2>
            <input type="text" placeholder="Enter username" value={newFriend} onChange={e => setNewFriend(e.target.value)} />
            <button onClick={handleAddFriend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
} 