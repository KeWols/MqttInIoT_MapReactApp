//AIzaSyAOdzL_11lgUUD7CQObIyEoKUUDYRyxZHA
//cae4ae0a5cbea883
//46.776638,23.595149


import React, { useState, useEffect } from "react";
import connectMqtt from "../broker/mqtt";
import { getUserLocation } from "../locationService";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const MapPage = () => {
  const [mqttClient, setMqttClient] = useState(null);
  const [userPosition, setUserPosition] = useState({ lat: 46.776638, lng: 23.595149 }); // Default position
  const [otherPositions, setOtherPositions] = useState([]);
  const [isSharingEnabled, setIsSharingEnabled] = useState(true); // Default: sharing enabled
  const [simulateSecondPin, setSimulateSecondPin] = useState(null);

  const topicPub = "friends/location";
  const topicSub = "friends/location";

  const mapContainerStyle = { width: "100%", height: "500px" };

  // Function to fetch and publish user location
  const fetchAndPublishLocation = () => {
    getUserLocation(
      (position) => {
        setUserPosition(position);
        if (mqttClient && isSharingEnabled) {
          const payload = JSON.stringify({
            lat: position.lat,
            lng: position.lng,
            device: "user-phone",
          });
          mqttClient.publishMessage(topicPub, payload);
          console.log("Location published:", payload);
        }
      },
      (error) => console.error("Location Error:", error)
    );
  };

  // Simulate second pin
  const startSimulatingSecondPin = () => {
    const startingPosition = { lat: 46.776701, lng: 23.595895 };
    setSimulateSecondPin(startingPosition);

    const interval = setInterval(() => {
      setSimulateSecondPin((prevPosition) => ({
        lat: prevPosition.lat + 0.000100,
        lng: prevPosition.lng + 0.000100,
      }));
    }, 4000);

    return () => clearInterval(interval);
  };

  // Connect to MQTT and subscribe
  useEffect(() => {
    const { client, subscribeToTopic, publishMessage } = connectMqtt((topic, message) => {
      if (topic === topicSub) {
        try {
          const receivedData = JSON.parse(message);
          setOtherPositions((prev) => {
            const filtered = prev.filter((pos) => pos.device !== receivedData.device);
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

  // Periodically publish user location
  useEffect(() => {
    if (isSharingEnabled) {
      const interval = setInterval(fetchAndPublishLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [isSharingEnabled, mqttClient]);

  return (
    <div>
      <h1>Map Page</h1>
      <APIProvider apiKey="AIzaSyAOdzL_11lgUUD7CQObIyEoKUUDYRyxZHA">
        <Map
          defaultZoom={13}
          defaultCenter={userPosition}
          mapId="cae4ae0a5cbea883"
          style={mapContainerStyle}
        >
          {/* User Marker */}
          <AdvancedMarker
            position={userPosition}
            options={{ title: "My Position", icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
          />

          {/* Other Users' Markers */}
          {otherPositions.map((pos, index) => (
            <AdvancedMarker
              key={index}
              position={{ lat: pos.lat, lng: pos.lng }}
              options={{
                title: "Other User",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />
          ))}

          {/* Simulated Second Pin */}
          {simulateSecondPin && (
            <AdvancedMarker
              position={simulateSecondPin}
              options={{
                title: "Simulated Pin",
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          )}
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

      {/* Button to Start Simulation */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={startSimulatingSecondPin}>Testing</button>
      </div>
    </div>
  );
};

export default MapPage;

