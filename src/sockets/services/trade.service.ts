import {TradeSession} from "../models/roomSession.model";

const tradeSessions_Map = new Map<string, TradeSession>();
const socketToSession_Map = new Map<string, string>();

export const save_RoomSession = (socket: any, newSession: TradeSession) => {
    tradeSessions_Map.set(newSession.roomSessionId, newSession);
    socketToSession_Map.set(socket.id, newSession.roomSessionId);
}
export const delete_RoomSession = (socket: any, status: 'disconnect' | 'exit') => {
    const sessionId = socketToSession_Map.get(socket.id)
    if (sessionId) {
        socket.emit('session:deleted', {message: status == 'disconnect' ? `El participante se ha desconectado` : `El otro participante abandono la sesión`});

        tradeSessions_Map.delete(sessionId);
        socketToSession_Map.delete(socket.id);
    }
    // Aquí podrías también eliminar el socketToSession_Map si es necesario
}