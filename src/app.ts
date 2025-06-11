import dotenv from "dotenv";
import express from "express";
import {router} from "./routes";
import { Server } from 'socket.io';
import * as http from "node:http";
import {setupSockets} from "./sockets";

dotenv.config();
const app = express().use(express.json()); // Crear una instancia de Express

app.use('/api', router);

setupSockets(app); // <- centralizado

export default app;