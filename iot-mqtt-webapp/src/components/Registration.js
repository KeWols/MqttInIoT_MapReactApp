import React, { useState } from "react";
import "../App.css";
import Alert from "./Alert";
import db from "../database/firebase"; 
import { collection, addDoc } from "firebase/firestore";

const Registration = ({ setView }) => {
  const [username, setUsername] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [selectedPin, setSelectedPin] = useState(""); // Kiválasztott pin
  const [alert, setAlert] = useState(null); // To handle alerts

  const pins = [
    { url: "https://img.icons8.com/color/48/000000/marker.png", name: "Marker" },
    { url: "https://img.icons8.com/?size=48&id=YpfO1uO_dkpP&format=png&color=000000", name: "Sloth" },
    { url: "https://img.icons8.com/color/48/000000/palm-tree.png", name: "Palm Tree" },
    { url: "https://img.icons8.com/?size=48&id=gyfjTMlmedO1&format=png&color=000000", name: "Whiskey" },
    { url: "https://img.icons8.com/?size=48&id=zxmflSmRCwbY&format=png&color=000000", name: "Ace" },
    { url: "https://img.icons8.com/color/48/000000/diamond.png", name: "Diamond" },
  ];

  const handleCreateProfile = async () => {
    if (!username || !pwd1 || !pwd2) {
      setAlert({ type: "danger", message: "All fields are required." });
      return;
    }

    if (pwd1 !== pwd2) {
      setAlert({ type: "danger", message: "Passwords must match." });
      return;
    }

    try {
      const hashedPassword = pwd1;
      const userCollecion = collection(db, "users");
      await addDoc(userCollecion, {
        username: username,
        password: hashedPassword,
        image: selectedPin,
      });

      setAlert({ type: "success", message: "Profile created successfully!" });

      setTimeout(() => {
        setAlert(null);
        setView("login");
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setAlert({ type: "danger", message: "Error creating profile. Try again later." });
    }
  };

  const handlePwdWarning = () => {
    setAlert({
      type: "warning",
      message:
        "This is a test-based website. Please do not use any passwords that you actually use elsewhere.",
    });
  };

  const handleCloseAlert = () => {
    setAlert(null); // Close the alert
  };

  return (
    <div className="back-g">
      {/* Alert Component */}
      {alert && <Alert type={alert.type} message={alert.message} onClose={handleCloseAlert} />}

      {/* Navigation Buttons */}
      <div className="same-regist">
        <button className="login" onClick={() => setView("login")}>
          Login
        </button>
        <button className="regist" disabled>
          Registration
        </button>
      </div>

      {/* Registration Form */}
      <div className="regist-box">
        <h2>Registration</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="pwd1"
          type="password"
          placeholder="Password"
          value={pwd1}
          onClick={handlePwdWarning} // Show warning alert
          onChange={(e) => setPwd1(e.target.value)}
        />
        <input
          className="pwd2"
          type="password"
          placeholder="Confirm password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
        />
        <div>
          <h3 className="icon-selector">Select your custom pin</h3>
          <div className="pins-container">
            {pins.map((pin, index) => (
              <img
              key={index}
              src={pin.url}
              alt={pin.name}
              className={`pin ${selectedPin === pin.url ? "selected" : ""}`}
              onClick={() => {
                console.log(`Clicked on: ${pin.name}`);
                setSelectedPin(pin.url);
                console.log(`Selected pin: ${pin.url}`); // Konzolra írja a kiválasztott pin URL-jét
              }}
            />            
            ))}
          </div>
        </div>
        <button onClick={handleCreateProfile}>Create profile</button>
      </div>
    </div>
  );
};

export default Registration;
