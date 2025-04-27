import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: credentials.username, // ✅ Now correctly sending username
                password: credentials.password
            }),
            credentials: "include"
        });

        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await response.json() : { error: await response.text() };

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        console.log("🔑 Auth Token:", data.token);
        localStorage.setItem("authToken", data.token);
        navigate("/home");

    } catch (error) {
        console.error("❌ Login error:", error);
        setErrorMessage(error.message);
    }
};

  return (
    <div className="login-page">
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.loginButton}>Login</button>
        </form>
        <p className={styles.registerLink}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}
