import {INotification} from "../models/notification.model";
import {getSocketByUsername} from "../../Sockets/services/socket.service";

export async function sendNotification(notification:INotification){
    notification.read=false;
    await notification.save()

    const socket=await getSocketByUsername(notification.username)
    socket?.emit('notifications', notification)
}