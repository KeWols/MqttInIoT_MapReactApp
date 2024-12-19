//AIzaSyAOdzL_11lgUUD7CQObIyEoKUUDYRyxZHA
//cae4ae0a5cbea883
//46.776638,23.595149


import React, { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import connectMqtt from "../broker/mqtt";
import { getUserLocation } from "../locationService";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { collection, getDocs } from "firebase/firestore";
import db from "../database/firebase";

const MapPage = () => {
  const [mqttClient, setMqttClient] = useState(null);
  const [userPosition, setUserPosition] = useState({ lat: 46.776638, lng: 23.595149 }); // Default position
  const [otherPositions, setOtherPositions] = useState([]);
  const [isSharingEnabled, setIsSharingEnabled] = useState(true);
  const [userPins, setUserPins] = useState({}); // Map of username to pin URL
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Get current user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "", image: "" };
  const [currentUser, setCurrentUser] = useState(storedUser);

  const topicPub = "friends/location";
  const topicSub = "friends/location";

  const mapContainerStyle = { width: "100%", height: "500px" };

  // Load Google Maps API
  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyAOdzL_11lgUUD7CQObIyEoKUUDYRyxZHA",
      version: "weekly",
    });

    loader
      .load()
      .then(() => {
        console.log("Google Maps API successfully loaded");
        setGoogleLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading Google Maps API:", err);
      });
  }, []);

  // Fetch all user pins from Firestore
  const fetchUserPins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const pins = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pins[data.username] = data.image || "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // Default pin
        console.log(`Fetched pin for user: ${data.username}, image: ${data.image}`);
      });
      setUserPins(pins);
    } catch (error) {
      console.error("Error fetching user pins:", error);
    }
  };

  // Publish user location
  const fetchAndPublishLocation = () => {
    getUserLocation(
      (position) => {
        setUserPosition(position);
        if (mqttClient && isSharingEnabled) {
          const payload = JSON.stringify({
            lat: position.lat,
            lng: position.lng,
            username: currentUser.username, // Current user's name
            iconUrl: currentUser.image, // Current user's icon URL
          });
          mqttClient.publishMessage(topicPub, payload);
          console.log("Location published:", payload);
        }
      },
      (error) => console.error("Location Error:", error)
    );
  };

  // Connect to MQTT and fetch user pins
  useEffect(() => {
    fetchUserPins();

    const { client, subscribeToTopic, publishMessage } = connectMqtt((topic, message) => {
      if (topic === topicSub) {
        try {
          const receivedData = JSON.parse(message);

          // Update Other Users' Positions
          setOtherPositions((prev) => {
            const filtered = prev.filter((pos) => pos.username !== receivedData.username);
            return [...filtered, receivedData];
          });
        } catch (err) {
          console.error("Error parsing MQTT message:", err);
        }
      }
    });

    setMqttClient({ client, subscribeToTopic, publishMessage });
    subscribeToTopic(topicSub);

    return () => client.end();
  }, []);

  // Periodically publish location
  useEffect(() => {
    if (isSharingEnabled) {
      const interval = setInterval(fetchAndPublishLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [isSharingEnabled, mqttClient]);

  if (!googleLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <div>
      <h1>Map Page</h1>
      <APIProvider apiKey="AIzaSyAOdzL_11lgUUD7CQObIyEoKUUDYRyxZHA">
        <Map defaultZoom={13} defaultCenter={userPosition} mapId="cae4ae0a5cbea883" style={mapContainerStyle}>
          {/* User Marker */}
          <Marker
            position={userPosition}
            options={{
              title: currentUser.username || "My Position",
              icon: {
                url: currentUser.image || "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Default pin
                scaledSize: new window.google.maps.Size(32, 32),
              },
            }}
          />

          {/* Other Users' Markers */}
          {otherPositions.map((pos, index) => (
            <Marker
              key={index}
              position={{ lat: pos.lat, lng: pos.lng }}
              options={{
                title: pos.username,
                icon: {
                  url: pos.iconUrl || "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Default pin
                  scaledSize: new window.google.maps.Size(32, 32),
                },
              }}
            />
          ))}
        </Map>
      </APIProvider>

      {/* Checkbox to Start/Stop Sharing */}
      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={isSharingEnabled}
            onChange={() => setIsSharingEnabled(!isSharingEnabled)}
          />
          Share My Location
        </label>
      </div>

      {/* Active Users List */}
      <div style={{ marginTop: "20px" }}>
        <h2>Active Users:</h2>
        <ul>
          {otherPositions.map((pos, index) => (
            <li key={index}>
              {pos.username} - <img src={pos.iconUrl} alt={pos.username} style={{ width: "20px", height: "20px" }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;

