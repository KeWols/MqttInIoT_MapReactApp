import mqtt from 'mqtt';

// Csatlakozási beállítások
const connectOptions = {
    clientId: 'mqtt_client_' + Math.random().toString(16).substr(2, 8),
    username: 'your_username', // MQTT broker felhasználónév
    password: 'your_password', // MQTT broker jelszó
};

// Kapcsolódás a Mosquitto brokerhez
const client = mqtt.connect('ws://broker_url:port', connectOptions);

// Csatlakozási események kezelése
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Alapértelmezett feliratkozás egy témára
    client.subscribe('iot/test/topic', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Subscribed to topic: iot/test/topic');
        }
    });
});

// Hibakezelés
client.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

// Üzenet fogadása
client.on('message', (topic, message) => {
    console.log(`Üzenet érkezett [${topic}]: ${message.toString()}`);
});

// Üzenet küldése
const publishMessage = (topic, message) => {
    client.publish(topic, message, (err) => {
        if (err) {
            console.error('Publishing error:', err);
        } else {
            console.log(`Üzenet elküldve: [${topic}] ${message}`);
        }
    });
};

// Exportálás
export { client, publishMessage };
