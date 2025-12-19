import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth_routes';
import espRoutes from './routes/esp_routes';
import sensorRoutes from './routes/sensor_routes';
import outdeviceRoutes from './routes/outdevice_routes';
import logRoutes from './routes/log_routes';
import cookieParser from 'cookie-parser';
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
app.use('/api/esp', espRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/device', outdeviceRoutes);
app.use('/api/log', logRoutes);

app.listen(config.PORT, () => {
  console.log(`Server đang chạy trên cổng ${config.PORT}`);
});