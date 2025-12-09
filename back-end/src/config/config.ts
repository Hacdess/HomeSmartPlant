import dotenv from "dotenv"
dotenv.config();

export default class Config {
    public readonly PORT: number;
    public readonly DB_URL: string;
    public readonly DB_KEY: string;

    constructor() {
        this.PORT = Number(process.env.PORT);
        this.DB_URL = String(process.env.SUPABASE_URL);
        this.DB_KEY = String(process.env.SUPABASE_KEY);
    }
}