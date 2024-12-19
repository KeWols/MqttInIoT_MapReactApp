import React, { useState } from "react";
import "../App.css";
import Alert from "./Alert";
import db from "../database/firebase"; 
import { collection, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

const Registration = ({ setView }) => {

  const [username, setUsername] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [selectedPin, setSelectedPin] = useState("");
  const [alert, setAlert] = useState(null);

  const pins = [
    { url: "https://img.icons8.com/color/48/000000/marker.png", name: "Marker" },
    { url: "https://img.icons8.com/?size=48&id=YpfO1uO_dkpP&format=png&color=000000", name: "Sloth" },
    { url: "https://img.icons8.com/color/48/000000/palm-tree.png", name: "Palm Tree" },
    { url: "https://img.icons8.com/?size=48&id=gyfjTMlmedO1&format=png&color=000000", name: "Whiskey" },
    { url: "https://img.icons8.com/?size=48&id=zxmflSmRCwbY&format=png&color=000000", name: "Ace" },
    { url: "https://img.icons8.com/color/48/000000/diamond.png", name: "Diamond" },
  ];

  const checkIfAllFieldsAreFilled = async () => {
    if (!username || !pwd1 || !pwd2) {
      setAlert({ type: "danger", message: "All fields are required." });
      return;
    }

    if (pwd1 !== pwd2) {
      setAlert({ type: "danger", message: "Passwords must match." });
      return;
    }

    try {
      const hashedPassword = bcrypt.hashSync(pwd1, 10);
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

  const showingPwdWAlert = () => {
    setAlert({
      type: "warning",
      message:
        "This is a test-based website. Please do not use any passwords that you actually use elsewhere.",
    });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <div className="back-g">
      
      {alert && <Alert type={alert.type} message={alert.message} onClose={closeAlert} />}

      <div className="same-regist">
        <button className="login" onClick={() => setView("login")}>Login</button>
        <button className="regist" disabled>Registration</button>
      </div>


      <div className="regist-box">
        <h2>Registration</h2>

        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
        <input className="pwd1" type="password" placeholder="Password" value={pwd1} onClick={showingPwdWAlert} onChange={(e) => setPwd1(e.target.value)}/>
        <input className="pwd2" type="password" placeholder="Confirm password" value={pwd2} onChange={(e) => setPwd2(e.target.value)}/>

        <div>
          
          <h3 className="icon-selector">Select your custom pin</h3>

          <div className="pins-container">
            {pins.map((pin, index) => (
              <img key={index} src={pin.url} alt={pin.name} className={`pin ${selectedPin === pin.url ? "selected" : ""}`} onClick={() => { console.log(`Clicked on: ${pin.name}`);
              setSelectedPin(pin.url);
              console.log(`Selected pin: ${pin.url}`);
              }}/>            
            ))}
          </div>

        </div>

        <button onClick={checkIfAllFieldsAreFilled}>Create profile</button>

      </div>

    </div>
  );
};

export default Registration;
