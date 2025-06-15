import {TradeSession} from "../models/TradeSession.model";
import {NOT_FOUND} from "../../../Shared/errors/models/errors";
import {io} from "../index.socket";

const tradeSessions_Map = new Map<string, TradeSession>();
//identifica al socket con la sesión a la que pertenece. De esta manera, si un socket se desconecta, podemos identificar la sesión a la que pertenece y eliminarla.
const socketToSession_Map = new Map<string, string>();

export const save_RoomSession = (socketId:string, newSession: TradeSession) => {
    tradeSessions_Map.set(newSession.roomSessionId, newSession);
    addSocketToSession(socketId, newSession.roomSessionId);
}

export const addSocketToSession = (socketId:string, sessionId: string) => {
    socketToSession_Map.set(socketId, sessionId);
}

export const get_sessionId_BySocketId = (socketId: string): string | null => {
    return socketToSession_Map.get(socketId) || null;
}

export const getTradeSession_BySocketId = (socketId: string): TradeSession | null => {
    const sessionId = socketToSession_Map.get(socketId);
    if (!sessionId) {
        return null; // No hay sesión asociada al socket
    }
    return tradeSessions_Map.get(sessionId) || null;
}

export const removeItemFrom_SocketToSessionMap = (socketId: string): boolean => {
    if (socketToSession_Map.has(socketId)) {
        socketToSession_Map.delete(socketId);
        return true; // Se eliminó correctamente
    }
    return false; // No se encontró el socketId en el mapa
}

/**
 * Elimina una sesión de intercambio de la sala. solo se puede eliminar si la conexion socket es de una sala de intercambios activa.
 * @param socket {socketId} identifica el socketId de un usuario en especifico y el socket para emitir eventos.
 * @param session
 * @param options {disconnect} si es true, desconecta el socket del usuario, si es false, solo elimina la sesión de intercambio.
 */
export const delete_RoomSession = (socket:{socket:any,socketId: string},session:TradeSession,options:{disconnect:boolean}):boolean => {
    let message: string
    switch (session.status){
        case 'closed':
            message = `La sesión de intercambio ha sido cerrada`
            break;
        case 'denied':
            message= `La invitación de intercambio ha sido rechazada`
            break;
        default:
            message = `El participante se ha desconectado`
            break
    }
    socket.socket.to(session.roomSessionId).emit('trade:session', {message:message });

    //borramos todos las entradas del socketToSession_Map que tengan el mismo sessionId
    socketToSession_Map.forEach((value, key) => {
        if (value === session.roomSessionId) {
            if(io?.sockets.sockets.get(key)?.id) {
                if (options.disconnect)
                    io?.sockets.sockets.get(key)?.disconnect(true);

                socketToSession_Map.delete(key);
            }
        }
    });
    // Liberamos la sesion (room) entre los participantes
    socket.socket.leave(session.roomSessionId);
    // Eliminamos la sesión del mapa de sesiones
    tradeSessions_Map.delete(session.roomSessionId)

    return true;
}

export const roomJoin = (socket: any, roomSessionId: string):TradeSession => {
    const roomSession = get_RoomSession(roomSessionId);
    addSocketToSession(socket.id, roomSessionId);
    socket.join(roomSessionId);

    roomSession.lastUpdated = new Date();
    roomSession.status = 'active';
    roomSession.users[socket.data.user.username] = {
        socketId: socket.id,
        role: 'invited',
        trade_status: 'none',
        connected: true,
        offeredCardIds: [],
    }

    return roomSession
}

export const get_RoomSession = (sessionId: string):TradeSession => {
    const session = tradeSessions_Map.get(sessionId);
    if (!session) {
        throw new NOT_FOUND(`Trade session with ID ${sessionId} not found`);
    }
    return session;
}
/**
 * Obtiene la sesión de intercambio activa por el nombre de usuario.
 * Si la opcion connected es false, devolvera tambien los usuarios que esten invitados pero no conectados.
 * @param username
 * @param options
 */
export const get_RoomSession_By_Username = (username: string,options:{connected:boolean}): TradeSession | null => {
    const session: TradeSession | undefined = Array.from(tradeSessions_Map.values()).find(session => {
        const userEntry = session.users[username];

        if (!userEntry) return false;

        // Si options.connected es true, filtra solo si el usuario está conectado
        // Si es false, acepta cualquiera que esté presente en la sesión
        return options.connected ? userEntry.connected : true;
    });

    return session || null;

}