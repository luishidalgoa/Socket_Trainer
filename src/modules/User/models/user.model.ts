import mongoose, {Schema} from "mongoose";
import {Role} from "../../../Config/application/roles.permissions";
import {Language} from "../../../Config/application/enum/Global";
import {Theme} from "../../../Config/application/enum/Theme";


const UserSchema = new Schema<UserModel>({
    information:{
        username: {type: String, required: true, unique: true},
        avatarUrl: {type: String, required: false},
        email: {type: String, required: true, unique: true},
    },
    preferences:{
        language: {type: String, required: true, default: "es"},
        theme: {type: String, required: true, default: "white"},
        notifications: {type: Boolean, required: true, default: false},
        notificationsEmail: {type: Boolean, required: true, default: false},
    },
    security: {
        passwordHash: {type: String, required: true},
        lastReset: {type: Date, required: true, default: Date.now},
    },
    state:{
        role: {type: [String], required: true, default: ["inactive"]},
        lastLogin: {type: Date, required: true, default: Date.now},
        active: {type: Boolean, required: true, default: false},
    },
},{ timestamps: true }).set("toJSON",{
    transform: (doc, ret) => {
        delete ret.__v;
        return ret; // <- return the transformed version
    }
});

export default mongoose.model<UserModel>("User", UserSchema);

interface UserInformation {
    username: string;
    avatarUrl?: string;
    email: string;
}

interface UserPreferences {
    language: Language;
    theme: Theme;
    notifications: boolean;
    notificationsEmail: boolean;
}

interface UserSecurity {
    passwordHash: string;
    lastReset: Date;
}

interface UserState {
    role: [Role];
    lastLogin: Date;
    active: boolean;
}

export interface UserModel {
    _id?: mongoose.Schema.Types.ObjectId;
    information: UserInformation;
    preferences: UserPreferences;
    security: UserSecurity;
    state: UserState;
    createdAt: Date;
    updatedAt: Date;
}

const users_online_mongoose = new Schema({
    username: {type: String, required: true, unique: true},
    socketId: {type: String, required: true, unique: true},
    online: {type: Boolean, required: true, default: false},
}, {timestamps: true}).set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret; // <- return the transformed version
    }
})

export const UsersOnlineModel = mongoose.model("Users_Online", users_online_mongoose);

export interface UsersOnlineModel {
    _id?: mongoose.Schema.Types.ObjectId;
    username: string;
    socketId: string;
    online: boolean;
    createdAt: Date;
    updatedAt: Date;
}