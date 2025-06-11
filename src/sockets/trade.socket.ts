import {v4 as uuidv4} from 'uuid';
import log from "../Config/logger";
import {delete_RoomSession, save_RoomSession} from "./services/trade.service";
import {TradeSession} from "./models/roomSession.model";

export const handleTradeSocket = (socket: any) => {
    socket.on('trade:invite', ({inviterUsername, invitedUsername}: {
        inviterUsername: string,
        invitedUsername: string
    }) => {
        const roomSessionId = uuidv4();

        const newSession = createRoomSession(inviterUsername, invitedUsername, roomSessionId,socket.id)

        save_RoomSession(socket, newSession);

        log.info(`Trade session ${roomSessionId} creada entre ${inviterUsername} e ${invitedUsername}`);

        socket.join(roomSessionId);

        socket.emit('trade:invite', {message: 'Invitación enviada', roomSessionId});
    });

    socket.on('trade:accept', ({roomSessionId}: { roomSessionId: string }) => {

    })

    socket.on('disconnect', () => {
        log.warn(`Trade socket disconnected: ${socket.id}`);
        delete_RoomSession(socket, 'disconnect');
    });
};

const createRoomSession = (inviterUsername: string, invitedUsername: string, roomSessionId:string ,socketId: string): TradeSession => {
    return {
        roomSessionId,
        users: {
            [inviterUsername]: {
                socketId: socketId,
                role: 'creator',
                trade_status: 'propose_trade',
                connected: true,
                offeredCardIds: [],
            },
            [invitedUsername]: {
                socketId: '', // Se llenará cuando se conecte
                role: 'invited',
                trade_status: 'propose_trade',
                connected: false,
                offeredCardIds: [],
            },
        },
        status: 'waiting',
        lastUpdated: new Date(),
    };
}