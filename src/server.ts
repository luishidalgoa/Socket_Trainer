import log from "./Config/logger";
import {HOST, PORT} from "./Config/env";
import app from "./app";
import connectDB from "./Config/mongodb";
import http from "node:http";
import {setupSockets} from "./modules/Sockets/index.socket";

const server = http.createServer(app);


setupSockets(server).then(()=> log.info("Socket activado")) // <- centralizado

server.listen(PORT, () => {
    log.info(`Servidor escuchando en ${HOST}${PORT ? `:${PORT}` : ""}`);
    connectDB().then(r => log.info("Conectado a la base de datos")); // Conectar a la base de datos
});