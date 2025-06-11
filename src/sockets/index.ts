import {Server} from "socket.io";
import {handleTradeSocket} from "./trade.socket";
import {Express} from "express";
import http from "node:http";
import log from "../Config/logger";

export function setupSockets(app: Express) {
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });
    server.listen(process.env.PORT,()=> log.info((`Servidor Socket.IO escuchando en el puerto ${process.env.PORT}`)));

    io.on('connection', (socket) => {
        console.log('Conectado:', socket.id);

        socket.on('online', (data) => {
            console.log(`Usuario en línea: ${data.userId}`);
            socket.emit('online', { message: `Usuario ${data.userId} está en línea` });
            // Aquí podrías manejar la lógica para marcar al usuario como en línea
        })
        handleTradeSocket(socket); // manejas los eventos relacionados
        // Puedes añadir más: handleChatSocket(socket), etc.
    });
}