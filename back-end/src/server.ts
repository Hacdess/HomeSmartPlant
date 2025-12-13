import { config } from "./config/supabase";
import express from "express"
import mqtt from "mqtt/*";

async function main() {
  const app = express();

  app.listen(config.PORT, () => {
    console.log(`Server is running on port: ${config.PORT}`)
  });
}

main();
