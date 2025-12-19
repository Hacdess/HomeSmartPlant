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