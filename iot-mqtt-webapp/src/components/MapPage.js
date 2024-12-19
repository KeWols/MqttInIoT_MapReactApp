//46.776638,23.595149

import React, { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import connectMqtt from "../broker/mqtt";
import { getUserLocation } from "../locationService";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { collection, getDocs } from "firebase/firestore";
import db from "../database/firebase";
import './MapPage.css';



const MapPage = () => {
  const [mqttClient, setMqttClient] = useState(null);
  const [userPosition, setUserPosition] = useState({ lat: 46.776638, lng: 23.595149 });
  const [otherPositions, setOtherPositions] = useState([]);
  const [isSharingEnabled, setIsSharingEnabled] = useState(true);
  const [userPins, setUserPins] = useState({});
  const [googleLoaded, setGoogleLoaded] = useState(false);



  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "", image: "" };
  const [currentUser, setCurrentUser] = useState(storedUser);

  
  const topicPub = "friends/location";
  const topicSub = "friends/location";

  const mapContainerStyle = { width: "100%", height: "500px" };

  // Betoltese Google Maps API
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
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

  
  const fetchUserPins = async () => {
    try {

      const querySnapshot = await getDocs(collection(db, "users"));
      const pins = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pins[data.username] = data.image || "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        console.log(`Fetched pin for user: ${data.username}, image: ${data.image}`);
      });

      setUserPins(pins);

    } catch (error) {

      console.error("Error fetching user pins:", error);
    }
  };

  const fetchAndPublishLocation = () => {
    getUserLocation(
      (position) => {
        setUserPosition(position);
        if (mqttClient && isSharingEnabled) {
          const payload = JSON.stringify({
            lat: position.lat,
            lng: position.lng,
            username: currentUser.username,
            iconUrl: currentUser.image,
          });
          mqttClient.publishMessage(topicPub, payload);
          console.log("Location published:", payload);
        }
      },
      (error) => console.error("Location Error:", error)
    );
  };


  useEffect(() => {

    fetchUserPins();

    const { client, subscribeToTopic, publishMessage } = connectMqtt((topic, message) => {
      if (topic === topicSub) {
        try {
          const receivedData = JSON.parse(message);

    
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

  
  useEffect(() => {
    if (isSharingEnabled) {
      const interval = setInterval(fetchAndPublishLocation, 1000); //lekeres es publikalas
      return () => clearInterval(interval);
    }
  }, [isSharingEnabled, mqttClient]);

  if (!googleLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <div className="map-page">
      <h1>Map Page</h1>
  

      <div className="map-container">
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
          <Map
            defaultZoom={13}
            defaultCenter={userPosition}
            mapId={process.env.REACT_APP_MAP_ID_KEY}
          >
            
            <Marker
              position={userPosition}
              options={{
                title: currentUser.username || "My Position",
                icon: {
                  url: currentUser.image || "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Alapértelmezett pin
                  scaledSize: new window.google.maps.Size(32, 32),
                },
              }}
            />
  
            

            {otherPositions.map((pos, index) => (
              <Marker
                key={index}
                position={{ lat: pos.lat, lng: pos.lng }}
                options={{
                  title: pos.username,
                  icon: {
                    url: pos.iconUrl || "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Alapértelmezett pin
                    scaledSize: new window.google.maps.Size(32, 32),
                  },
                }}
              />
            ))}
          </Map>
        </APIProvider>
      </div>
  

      <div className="checkbox-container">
        <label>
          <input
            type="checkbox"
            checked={isSharingEnabled}
            onChange={() => setIsSharingEnabled(!isSharingEnabled)}
          />
          Share My Location
        </label>
      </div>
  

      <div className="active-users-container">
        <h2>Active Users:</h2>
        <ul>
          {otherPositions.map((pos, index) => (
            <li key={index}>
              <img src={pos.iconUrl} alt={pos.username} />
              <span>{pos.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;

