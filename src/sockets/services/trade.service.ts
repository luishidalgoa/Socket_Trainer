import {TradeSession} from "../models/roomSession.model";

const tradeSessions_Map = new Map<string, TradeSession>();
//identifica al socket con la sesión a la que pertenece. De esta manera, si un socket se desconecta, podemos identificar la sesión a la que pertenece y eliminarla.
const socketToSession_Map = new Map<string, string>();

export const save_RoomSession = (socketId:string, newSession: TradeSession) => {
    tradeSessions_Map.set(newSession.roomSessionId, newSession);
    addSocketToSession(socketId, newSession.roomSessionId);
}

const addSocketToSession = (socketId:string, sessionId: string) => {
    socketToSession_Map.set(socketId, sessionId);
    console.log(socketToSession_Map)
}
/**
 * Elimina una sesión de intercambio de la sala. solo se puede eliminar si la conexion socket es de una sala de intercambios activa.
 * @param socket {socketId} identifica el socketId de un usuario en especifico y el socket para emitir eventos.
 * @param status
 */
export const delete_RoomSession = (socket:{socket:any,socketId: string}, status: 'disconnect' | 'exit'):boolean => {
    const sessionId = socketToSession_Map.get(socket.socketId)
    if (!sessionId) {
        return false; // No hay sesión asociada al socket
    }
    socket.socket.to(sessionId).emit('trade:close', {message: status == 'disconnect' ? `El participante se ha desconectado` : `El otro participante abandono la sesión`});

    //borramos todos las entradas del socketToSession_Map que tengan el mismo sessionId
    socketToSession_Map.forEach((value, key) => {
        if (value === sessionId) {
            socketToSession_Map.delete(key);
        }
    });
    // Liberamos la sesion (room) entre los participantes
    socket.socket.leave(sessionId);
    // Eliminamos la sesión del mapa de sesiones
    tradeSessions_Map.delete(sessionId)

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
        throw new Error(`Trade session with ID ${sessionId} not found`);
    }
    return session;
}

export const get_RoomSession_By_Username = (username: string): TradeSession | null => {
    const session:TradeSession | undefined = Array.from(tradeSessions_Map.values()).find(session =>{
        return session.users[username] !== undefined
        }
    );
    return session || null;
}