import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth_routes';
import espRoutes from './routes/esp_routes'
import cookieParser from 'cookie-parser';
import { mqttClient } from './config/mqtt_config';
import { MqttServices } from './services/mqtt_services';
import { config } from './config/config';
import { MqttController } from './controllers/mqtt_controllers';

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json()); // Để đọc được body json
app.use(cookieParser());

// ===== MQTT =====
MqttController.init();

// ===== SERVER EXPRESS =====
// Setup Router API
app.use('/api/auth', authRoutes);
app.use('api/esp', espRoutes);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});