import mqtt from 'mqtt';

// MQTT Client Initialization
const connectMqtt = (onMessageCallback) => {
  const brokerUrl = "wss://violetqueen-d2a2qp.a03.euc1.aws.hivemq.cloud:8884/mqtt";
  const options = {
    username: "KeWols1355", // Cseréld ki a HiveMQ felhasználóneveddel
    password: "Asdfghjkl456", // Cseréld ki a HiveMQ jelszavaddal
  };

  // Connect to the broker
  const client = mqtt.connect(brokerUrl, options);

  // Handle connection success
  client.on('connect', () => {
    console.log('Connected to HiveMQ Cloud');
  });

  // Handle incoming messages
  client.on('message', (topic, message) => {
    console.log(`Message received on topic ${topic}: ${message.toString()}`);
    if (onMessageCallback) {
      onMessageCallback(topic, message.toString());
    }
  });

  // Handle errors
  client.on('error', (err) => {
    console.error('Connection error:', err);
  });

  /**
   * Subscribe to a topic
   * @param {string} topic - The topic to subscribe to
   */
  const subscribeToTopic = (topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  };

  /**
   * Publish a message to a topic
   * @param {string} topic - The topic to publish to
   * @param {string} message - The message to publish
   */
  const publishMessage = (topic, message) => {
    client.publish(topic, message, (err) => {
      if (err) {
        console.error('Publish error:', err);
      } else {
        console.log(`Published message: "${message}" to topic: "${topic}"`);
      }
    });
  };

  return { client, subscribeToTopic, publishMessage };
};

export default connectMqtt;
