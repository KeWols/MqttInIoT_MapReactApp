import React, { useState } from "react";
import "../App.css";
import Alert from "./Alert";
import db from "../database/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import bcrypt from "bcryptjs";

const Login = ({ setView }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setAlert({ type: "danger", message: "Both fields are required." });
      return;
    }

    try {
      const usersCollection = collection(db, "users");
      const userQuery = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const passwordMatch = bcrypt.compareSync(password, userData.password);

        if (passwordMatch) {
          setAlert({ type: "success", message: "Login successful!" });

          // Save user data to localStorage
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              username: userData.username,
              image: userData.image || "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Default pin
            })
          );

          setTimeout(() => {
            setAlert(null);
            setView("map"); // Redirect to MapPage
          }, 2000);
        } else {
          setAlert({ type: "danger", message: "Invalid username or password." });
        }
      } else {
        setAlert({ type: "danger", message: "Invalid username or password." });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setAlert({ type: "danger", message: "Error during login. Try again later." });
    }
  };

  const handlePwdWarning = () => {
    setAlert({
      type: "warning",
      message: "This feature is currently unavailable and is not planned for future release.",
    });
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className="back-g">
      {/* Alert Component */}
      {alert && <Alert type={alert.type} message={alert.message} onClose={handleCloseAlert} />}

      {/* Buttons */}
      <div className="same-login">
        <button className="login" disabled>
          Login
        </button>
        <button className="regist" onClick={() => setView("registration")}>
          Registration
        </button>
      </div>

      {/* Login Form */}
      <div className="login-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handlePwdWarning}>Forget password</button>
      </div>
    </div>
  );
};

export default Login;
