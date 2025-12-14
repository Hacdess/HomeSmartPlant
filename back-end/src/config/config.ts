import dotenv from "dotenv"
dotenv.config();

class Config {
    public readonly PORT: number;
    public readonly DB_URL: string;
    public readonly DB_KEY: string;
    public readonly MQTT_URL: string;
    public readonly MQTT_USERNAME: string;
    public readonly MQTT_PASSWORD: string; 
 
    constructor() {
        this.PORT = Number(process.env.PORT);
        this.DB_URL = String(process.env.SUPABASE_URL);
        this.DB_KEY = String(process.env.SUPABASE_KEY);
        this.MQTT_URL = String(process.env.MQTT_URL);
        this.MQTT_USERNAME = String(process.env.MQTT_USERNAME);
        this.MQTT_PASSWORD = String(process.env.MQTT_PASSWORD);
    }
}

export const config: Config = new Config()