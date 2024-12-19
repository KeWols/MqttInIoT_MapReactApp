const express = require("express");
const path = require("path");
const mqtt = require("mqtt");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";



const brokerUrl = process.env.REACT_APP_HIVEMQ_BROKER_URL;
const mqttOptions = {
  username: process.env.REACT_APP_HIVEMQ_USERNAME, 
  password: process.env.REACT_APP_HIVEMQ_PWD,
};

const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

mqttClient.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Connection error:", err);
});

app.use(express.static(path.join(__dirname, "iot-mqtt-webapp", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "iot-mqtt-webapp", "build", "index.html"));
});


app.listen(PORT, HOST, () => {
  console.log(`Server is running locally at http://localhost:${PORT}`);
  console.log(`Server is accessible on your network at http://192.168.1.3:${PORT}`);
});
