import {v4 as uuidv4} from 'uuid';
import log from "../../Config/logger";
import {
    addSocketToSession,
    delete_RoomSession,
    get_RoomSession_By_Username,
    get_sessionId_BySocketId, removeItemFrom_SocketToSessionMap,
    roomJoin,
    save_RoomSession
} from "./services/trade.service";
import {secureOn} from "./index.socket";
import {checkOnlineStatus} from "../User/services/user.service";
import UserModel from "../User/models/user.model";
import {TradeSession} from "./models/TradeSession.model";
import {sendNotification} from "../User/services/notification.service";
import {INotification, NotificationModel} from "../User/models/notification.model";

export const handleTradeSocket = (socket: any) => {

    socket.onAny((event:any) => {
        if (event.includes('trade') && !get_sessionId_BySocketId(socket.id)) {
            addSocketToSession(socket.id,'blank')
        }
    });

    secureOn(socket,'trade:invite', async ({redirectTo}:{redirectTo?:string}) => {
        const username = socket.data.user.username;

        const roomSessionId = uuidv4();
        const invitedUsername:string = socket.handshake.query.invitedUsername;

        const newSession = createRoomSession(username,invitedUsername, roomSessionId,socket)

        if (invitedUsername === username) {
            socket.emit('trade:invite', {message: 'No puedes invitarte a ti mismo, se cerró la sesión'});
            return socket.disconnect(true);
        }

        const user=await UserModel.findOne({"information.username": invitedUsername}, { _id: 0, "information.username": 1 })
        if (!user) {
            socket.emit('trade:invite', {message: `El usuario ${invitedUsername} no existe, se cerro la sesión`});
            return socket.disconnect(true);
        }
        if (!await checkOnlineStatus(invitedUsername)) {
            socket.emit('trade:invite', {message: `El usuario ${invitedUsername} no está en línea o no existe, se cerró la sesión`});
            return socket.disconnect(true)
        }

        log.info(`Trade session ${roomSessionId} created without ${username} and ${invitedUsername}`);
        socket.join(roomSessionId);

        if (newSession.status === 'already_exist') {
            socket.emit('trade:invite', {message: `Already exists a trade session with ${invitedUsername}, a new session has been created`, roomSessionId: newSession.session?.roomSessionId});
        }else{
            socket.emit('trade:invite', {message: 'Invitación enviada', roomSessionId});
        }
        const notification:INotification=new NotificationModel({
            username: invitedUsername,
            title: `Solicitud de intercambio`,
            message: `El usuario ${username} te ha invitado a un intercambio, por favor, acepta la invitación`,
            type: 'trade',
            redirectTo: `${redirectTo}/${roomSessionId}` || `trade/${roomSessionId}`,
        })
        await sendNotification(notification)
    });

    secureOn(socket,'trade:accept', ({roomSessionId}: { roomSessionId: string, }) => {
        try {
            const roomSession = roomJoin(socket, roomSessionId);
            roomSession.status = 'active';

            socket.emit('trade:accept', {message: `La invitación ha sido aceptada con exito`, roomSessionId: roomSession.roomSessionId});
            socket.to(roomSessionId).emit('trade:invite', {message: `Solicitud de intercambio aceptada, por favor, suscríbanse a los mensajes 'trade:session' de socket.io`,roomSession: roomSession});
        }catch (error:any){
            socket.emit('trade:accept', {message: error.message });
            socket.disconnect(true)
        }
    })

    secureOn(socket,'trade:exit', ({roomSessionId}: { roomSessionId: string, }) => {
        const roomSession = get_RoomSession_By_Username(socket.data.user.username,{connected:true});
        if (!roomSession)
            return socket.emit('trade:accept', {message: 'No estás en una sesión de intercambio activa'});

        roomSession.status = 'closed';

        socket.to(roomSessionId).emit('trade:session', {message: `El participante ${socket.data.user.username}, abandono la sala`});
        socket.disconnect(true)
    })
};

const createRoomSession = (inviterUsername: string, invitedUsername: string, roomSessionId:string ,socket:any) => {
    const result: {status: 'new' | 'already_exist',session:TradeSession | null} = {status: 'new',session:null}

    result.session=get_RoomSession_By_Username(inviterUsername,{connected: true});
    // si existe una sesión activa con el mismo usuario, se elimina la sesión anterior
    if(result.session){
        delete_RoomSession({socket:socket,socketId:result.session.users[inviterUsername].socketId}, result.session, {disconnect: false});
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