import {Server} from "socket.io";
import {handleTradeSocket} from "./trade.socket";
import http from "node:http";
import log from "../../Config/logger";
import {validateToken_Service} from "../Authorization/services/auth.service";
import {JWT_TokenError, Token_Expired, Token_Not_Found} from "../../Shared/errors/models/errors";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {
    delete_RoomSession,
    get_sessionId_BySocketId,
    getTradeSession_BySocketId,
    removeItemFrom_SocketToSessionMap
} from "./services/trade.service";
import {
    checkOnlineStatus,
    checkSocketIdOnlineStatus, cleanUserOnlineList,
    getUserRoles,
    updateOnlineStatus
} from "../User/services/user.service";
import {getSocketByUsername} from "./services/socket.service";

export let io:Server | null = null;

export async function setupSockets(server: http.Server) {
    await cleanUserOnlineList()
    io = new Server(server, { cors: { origin: '*' } });

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
        secureOn(socket, 'online', () => {
            log.info(`Usuario conectado: ${socket.data.user.username} con id: ${socket.id}`);
            socket.emit('online', { message: `Usuario ${socket.data.user.username} está en línea` });
            updateOnlineStatus(socket.data.user.username, { online: true, socketId: socket.id }).then(()=> {})
        }, { skipCheck: true });

        handleTradeSocket(socket);

        socket.on('disconnect', async () => {
            const tradeSessionId = get_sessionId_BySocketId(socket.id);
            if (tradeSessionId) {
                const session = getTradeSession_BySocketId(socket.id);
                if (session)
                    delete_RoomSession({socket:socket,socketId:socket.id}, session, {disconnect: true});

                removeItemFrom_SocketToSessionMap(socket.id);
                log.warn(`Trade socket disconnected: ${socket.id}`);
            } else {
                const userOnline = await checkSocketIdOnlineStatus(socket.id)
                if (!userOnline)
                    return log.warn(`El socket ${socket.id} no está asociado a un usuario conectado`);

                log.warn(`El usuario ${socket.data.user.username} se ha desconectado, socketId: ${socket.id}`);
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
