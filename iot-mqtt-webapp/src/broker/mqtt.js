import mqtt from 'mqtt';


const connectMqtt = (onMessageCallback) => {
  const brokerUrl = process.env.REACT_APP_HIVEMQ_BROKER_URL;
  const options = {
    username: process.env.REACT_APP_HIVEMQ_USERNAME,
    password: process.env.REACT_APP_HIVEMQ_PWD,
  };

  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('Connected to HiveMQ Cloud');
  });

  client.on('error', (err) => {
    console.error('Connection error:', err);
  });

//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------

  client.on('message', (topic, message) => {
    console.log(`Message received on topic ${topic}: ${message.toString()}`);
    if (onMessageCallback) {
      onMessageCallback(topic, message.toString());
    }
  });

  //--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------

  const subscribeToTopic = (topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  };

  
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
