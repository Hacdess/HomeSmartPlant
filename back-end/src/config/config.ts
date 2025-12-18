import dotenv from "dotenv"
import { string } from "zod";
dotenv.config();

class Config {
    public readonly PORT: number;
    public readonly DB_URL: string;
    public readonly DB_KEY: string;
    public readonly JWT_SECRET: string;
    public readonly MQTT_URL: string;
    public readonly MQTT_USERNAME: string;
    public readonly MQTT_PASSWORD: string; 

    public readonly SMTP_HOST: string;
    public readonly SMTP_PORT: number;
    public readonly SMTP_USER: string;
    public readonly SMTP_PASS: string;
    public readonly FROM_EMAIL: string;
 
    constructor() {
        this.PORT = Number(process.env.PORT);
        this.DB_URL = String(process.env.SUPABASE_URL);
        this.DB_KEY = String(process.env.SUPABASE_KEY);
        this.JWT_SECRET = String(process.env.JWT_SECRET);
        this.MQTT_URL = String(process.env.MQTT_URL);
        this.MQTT_USERNAME = String(process.env.MQTT_USERNAME);
        this.MQTT_PASSWORD = String(process.env.MQTT_PASSWORD);

        this.SMTP_HOST = String(process.env.SMTP_HOST);
        this.SMTP_PORT = Number(process.env.SMTP_PORT);
        this.SMTP_USER = String(process.env.SMTP_USER);
        this.SMTP_PASS = String(process.env.SMTP_PASS);
        this.FROM_EMAIL = String(process.env.FROM_EMAIL);
    }
}

export const config: Config = new Config()