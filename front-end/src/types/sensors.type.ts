export interface SensorData { // from sensor
  recId: string;
  userId: string;
  sensorId: string;
  temperature: number;
  humidity: number;
  lightIntensity: number;
  soilMoisture: number;
  waterLevel: number;
  timestamp: string;

  // limits (from sensor_limits table)
  tempMin: number;
  tempMax: number;
  humidMin: number;
  humidMax: number;
  lightMin: number;
  lightMax: number;
  soilMin: number;
  soilMax: number;
  waterLevelMin: number;
  waterLevelMax: number;
}