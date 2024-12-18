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
      });
      setUserPins(pins);
      console.log("Fetched user pins:", pins);
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
            username: "currentUser", // Replace this with actual logged-in username
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

          // Update Other Users' Positions and adjust User Position
          setOtherPositions((prev) => {
            const filtered = prev.filter((pos) => pos.username !== receivedData.username);
            const updatedPositions = [...filtered, receivedData];

            // If the Other User's Marker changes, update the User Marker to match
            if (receivedData.username !== "currentUser") {
              setUserPosition({ lat: receivedData.lat, lng: receivedData.lng });
            }

            return updatedPositions;
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
      const interval = setInterval(fetchAndPublishLocation, 1000);
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
              title: "My Position",
              icon: {
                url: "https://img.icons8.com/?size=48&id=YpfO1uO_dkpP&format=png&color=000000",
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
                  url: userPins[pos.username] || "https://img.icons8.com/?size=48&id=gyfjTMlmedO1&format=png&color=000000", // Default
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
    </div>
  );
};

export default MapPage;
