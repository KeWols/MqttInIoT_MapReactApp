import React, { useEffect, useState } from 'react';
import mqttClient from '../mqttClient';

const MQTTComponent = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        mqttClient.subscribe('sensor/topic');

        mqttClient.on('message', (topic, message) => {
            setMessages((prev) => [...prev, message.toString()]);
        });

        return () => {
            mqttClient.end(); // Connection cleanup
        };
    }, []);

    return (
        <div>
            <h1>MQTT Messages</h1>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default MQTTComponent;
