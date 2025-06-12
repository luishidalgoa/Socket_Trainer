import {v4 as uuidv4} from 'uuid';
import log from "../Config/logger";
import {delete_RoomSession, get_RoomSession_By_Username, roomJoin, save_RoomSession} from "./services/trade.service";
import {TradeSession} from "./models/roomSession.model";
import {secureOn} from "./index";

export const handleTradeSocket = (socket: any) => {
    secureOn(socket,'trade:invite', () => {
        const username = socket.data.user.username;

        const roomSessionId = uuidv4();
        const invitedUsername:string = socket.handshake.query.invitedUsername;

        const newSession = createRoomSession(username,invitedUsername, roomSessionId,socket)

        log.info(`Trade session ${roomSessionId} created without ${username} and ${invitedUsername}`);
        socket.join(roomSessionId);

        if (newSession.status === 'already_exist') {
            socket.emit('trade:invite', {message: `Already exists a trade session with ${invitedUsername}, a new session has been created`, roomSessionId: newSession.session?.roomSessionId});
        }else{
            socket.emit('trade:invite', {message: 'Invitación enviada', roomSessionId});
        }
    });

    secureOn(socket,'trade:accept', ({roomSessionId}: { roomSessionId: string, }) => {

        const roomSession = roomJoin(socket, roomSessionId);
        roomSession.status = 'active';

        socket.to(roomSessionId).emit('trade:invite', {message: `Solicitud de intercambio aceptada, por favor, suscríbanse a los mensajes 'trade:session' de socket.io`,roomSession: roomSession});
    })
};

const createRoomSession = (inviterUsername: string, invitedUsername: string, roomSessionId:string ,socket:any) => {
    const result: {status: 'new' | 'already_exist',session:TradeSession | null} = {status: 'new',session:null}

    result.session=get_RoomSession_By_Username(inviterUsername)
    // si existe una sesión activa con el mismo usuario, se elimina la sesión anterior
    if(result.session){
        delete_RoomSession({socket:socket,socketId:result.session.users[inviterUsername].socketId}, 'exit')
        result.status = 'already_exist';
    }

    result.session = {
        roomSessionId,
        users: {
            [inviterUsername]: {
                socketId: socket.id,
                role: 'creator',
                trade_status: 'none',
                connected: true,
                offeredCardIds: [],
            },
            [invitedUsername]: {
                socketId: '', // Se llenará cuando se conecte
                role: 'invited',
                trade_status: 'none',
                connected: false,
                offeredCardIds: [],
            },
        },
        status: 'waiting',
        lastUpdated: new Date(),
    };
    save_RoomSession(socket.id, result.session);
    return result
}