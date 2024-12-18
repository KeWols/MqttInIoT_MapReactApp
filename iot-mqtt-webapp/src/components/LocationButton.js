import React, { useState, useEffect } from 'react';
import connectMqtt from '../broker/mqtt';

const LocationButton = () => {
  const [mqttClient, setMqttClient] = useState(null);

  const topicPub = 'friends/location'; // A publikálási téma

  useEffect(() => {
    const { client } = connectMqtt();
    setMqttClient(client);

    // Cleanup
    return () => {
      client.end();
    };
  }, []);

  const handleSendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = JSON.stringify({ lat: latitude, lng: longitude });

          if (mqttClient) {
            mqttClient.publish(topicPub, locationData, (err) => {
              if (err) {
                console.error('Publish error:', err);
              } else {
                console.log('Location published:', locationData);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <button onClick={handleSendLocation}>Send Location</button>
  );
};

export default LocationButton;
