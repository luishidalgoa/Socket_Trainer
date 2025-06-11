import log from "./Config/logger";
import {HOST, PORT} from "./Config/env";
import app from "./app";
import connectDB from "./Config/mongodb";


app.listen(PORT, () => {
    log.info(`Servidor escuchando en ${HOST}${PORT ? `:${PORT}` : ""}`);
    connectDB().then(r => log.info("Conectado a la base de datos")); // Conectar a la base de datos
});