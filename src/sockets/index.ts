import {Server} from "socket.io";
import {handleTradeSocket} from "./trade.socket";
import {Express} from "express";
import http from "node:http";
import log from "../Config/logger";
import {validateToken_Service} from "../modules/Authorization/services/auth.service";
import {JWT_TokenError, Token_Expired, Token_Not_Found} from "../Shared/errors/models/errors";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {delete_RoomSession} from "./services/trade.service";
import {checkOnlineStatus, getUserRoles, updateOnlineStatus} from "../modules/User/services/user.service";

export let io:Server | null = null;

export function setupSockets(app: Express) {
    const server = http.createServer(app);
    io = new Server(server, { cors: { origin: '*' } });
    server.listen(process.env.PORT,()=> log.info((`Servidor Socket.IO escuchando en el puerto ${process.env.PORT}`)));

    io.use(async (socket,next)=>{
        try {
            const accessToken = socket.handshake.headers.authorization;

            if (!accessToken)
                return next(new Token_Not_Found('Token de acceso no proporcionado'));

            socket.data.user = await validateToken_Service(accessToken)
            socket.data.user.role = await getUserRoles(socket.data.user.username);

            next()
        }catch (error:any){
            if (error instanceof TokenExpiredError){
                error = new Token_Expired("El token ha expirado")
            }
            if (error instanceof JsonWebTokenError){
                error = new JWT_TokenError("Token inválido")
            }
            // se envia el error y los tipos de errores esperados para obtener el mensaje
            next(error)
        }
    })

    io.on('connection', (socket) => {
        log.info(`Usuario conectado: ${socket.data.user.username} con id: ${socket.id}`);

        secureOn(socket, 'online', () => {
            socket.emit('online', { message: `Usuario ${socket.data.user.username} está en línea` });
            updateOnlineStatus(socket.data.user.username, { online: true, socketId: socket.id }).then(r => {})
        }, { skipCheck: true });

        handleTradeSocket(socket);

        socket.on('disconnect', () => {
            if (delete_RoomSession({socket:socket,socketId:socket.id}, 'disconnect')) {
                log.warn(`Trade socket disconnected: ${socket.id}`);
            } else {
                log.warn(`El socket ${socket.id} se ha desconectado`);
                updateOnlineStatus(socket.data.user.username, { socketId: socket.id, online: false }).then(r => {});
            }
        });
    });
}

export const secureOn = (socket:any, event:string, handler:any, options?:{skipCheck?:boolean}) => {
    const { skipCheck = false } = options || {};

    socket.on(event, async (...args:any) => {
        if (skipCheck) {
            return handler(...args);
        }

        try {
            const isOnline = await checkOnlineStatus(socket.data.user.username);
            if (!isOnline) {
                log.warn(`The user ${socket.data.user.username} is offline, event: ${event} not processed.`);
                return socket.emit('error', `User ${socket.data.user.username} is offline, event: ${event} not processed.`);
            }

            handler(...args);
        } catch (err) {
            socket.emit('error', 'Error procesando el evento');
        }
    });
};
