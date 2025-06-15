import dotenv from "dotenv";
import express from "express";
import {router} from "./routes";
import {setupSockets} from "./modules/Sockets/index.socket";

dotenv.config();
const app = express().use(express.json()); // Crear una instancia de Express

app.use('/api', router);

export default app;