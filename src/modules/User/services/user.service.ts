import User_schema, {UsersOnlineModel} from "../../User/models/user.model";
import {io} from "../../../sockets";

export const getUserRoles = async (username: string): Promise<string[]> => {
    const user = await User_schema.findOne(
        { "information.username": username },
        { "state.role": 1, _id: 0 }
    )

    return user?.state?.role || [];
};

export const updateOnlineStatus = async (username: string, option:{socketId:string,online: boolean}): Promise<void> => {
    if (option.online){
        await UsersOnlineModel.updateOne(
            { "username": username },
            { $set: { "socketId": option.socketId,"online": option.online, "username": username } },
            { upsert: true } // Crea un nuevo documento si no existe
        );
    }else{
        await UsersOnlineModel.deleteOne(
            { "username": username }
        );
    }
}

export const checkOnlineStatus = async (username: string): Promise<boolean> => {
    return await UsersOnlineModel.findOne(
        { "username": username, "online": true },
    ).then(async (user) => {
        if (!user) return false; // Usuario no encontrado
        if (!io?.sockets.sockets.has(user.socketId)){
            await updateOnlineStatus(username, {socketId: user.socketId, online: false});
            return false
        }
        return true
    }).catch(() => {
        return false;
    });
}