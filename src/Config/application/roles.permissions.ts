/**
 * Este fichero sirve para crear nuevos roles y asignarles permisos a esos roles. de esta manera assignaremos que puede
 * y que no puede hacer segun que rol
 *
 * Ademas cada rol tendra un nuemero que simboliza su nivel de permiso, de esta manera unos roles tendran mas poder que otros
 */

export enum RolesEnum {
    ADMIN = "admin",
    EDITOR = "editor",
    USER = "user",
    INACTIVE = "inactive",
    BANNED = "banned",
}


export const Permissions = {
    [RolesEnum.ADMIN]: {
        permission:[
            'album:create', // permiso para crear albumes
            'album:delete', // permiso para eliminar albumes
            'album:update', // permiso para actualizar albumes
            'user:manage', // permiso para gestionar usuarios (sin usar)
            "roles:manage", // permiso para gestionar roles
            'roles:change_others',// permiso para cambiar roles a otros usuarios
            'album:view', // permiso para ver albumes
            "user_album:add", // permiso para añadir albumes a un usuario
            "user_album:view", // permiso para ver albumes de un usuario
            "user_album:addCards", // permiso para añadir cartas a un album de un usuario
            "user_album:deleteCards", // permiso para eliminar cartas del album del usuario
            "user_album:tradeCards" // permiso para intercambiar cartas de con otro usuario
        ],
        level:1
    },
    [RolesEnum.EDITOR]: {
        permission:[
            'album:create',
            'album:update',
            "user_album:view"
        ],
        level:2
    },
    [RolesEnum.USER]:  {
        permission:[
            'album:view',
            "user_album:add",
            "user_album:view",
            "user_album:addCards",
            "user_album:deleteCards",
            "user_album:tradeCards"
        ],
        level:3
    },
    [RolesEnum.INACTIVE]: {
        permission:[
            'album:view',
            "user_album:view"
        ],
        level:4
    },
    [RolesEnum.BANNED]: {
        permission:[
            'album:view',
        ],
        level:4
    }
} as const;


export type Role = RolesEnum; //tipado de todos los nombres de roles
export type Permission = (typeof Permissions)[Role]['permission'][number]; //tipado de todos los nombres de permisos

