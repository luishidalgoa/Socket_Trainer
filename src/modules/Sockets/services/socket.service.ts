import {UsersOnlineModel} from "../../User/models/user.model";
import {io} from "../index.socket";

export async function getSocketByUsername(username:string){
    const result:UsersOnlineModel | null=await UsersOnlineModel.findOne({username:username, online:true}, {socketId:1,online:1});
    if (!result || !result.socketId)
        return null;
    return io?.sockets.sockets.get(result.socketId)
}
