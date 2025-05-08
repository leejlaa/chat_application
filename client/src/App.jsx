import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/register/register";
import Login from "./components/login/login";
import Home from "./components/home/home"; // New home component
import Chatpage from "./components/chat-page/Chatpage"; // New chat page component

import "./App.css";

function App() {

  
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home/:friend" element={<Chatpage />} />
      </Routes>
    </Router>
  );
}

export default App;