import express from "express";
import "dotenv/config";
import { initMQTTHandler } from "./mqtt/handler.js";

const app = express();
app.use(express.json());

initMQTTHandler();

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});