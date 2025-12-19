export interface SensorRecord {
  humid: number;
  light: number;
  soil_moisture: number;
  temperature: number;
  water_level: number;
  recorded_at: string | null;
}

export interface SensorLimit {
  humid_max: number;
  humid_min: number;
  light_max: number;
  light_min: number;
  soil_max: number;
  soil_min: number;
  temp_max: number;
  temp_min: number;
  water_level_max: number;
  water_level_min: number;
}

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