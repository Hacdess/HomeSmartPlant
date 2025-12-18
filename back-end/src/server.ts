import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth_routes';
import cookieParser from 'cookie-parser';
import { mqttClient } from './config/mqtt_config';
import { MqttServices } from './services/mqtt_services';
import { config } from './config/config';

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json()); // Để đọc được body json
app.use(cookieParser());

// ===== MQTT =====
MqttServices.init();
mqttClient.on("connect", () => {
  console.log("MQTT connected to HiveMQ");
});

mqttClient.on("error", (err) => {
  console.error("MQTT error:", err.message);
});

mqttClient.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});


// ===== SERVER EXPRESS =====
// Setup Router API
// Tất cả api auth sẽ bắt đầu bằng /api/auth
app.use('/api/auth', authRoutes);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});