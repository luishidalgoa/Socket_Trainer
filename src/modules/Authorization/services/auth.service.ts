import {Token_Not_Found} from "../../../Shared/errors/models/errors";
import jwt from "jsonwebtoken";
import {JwtUserPayload} from "../models/DTO/credentialsDTO";
import {JWT_ACCESS_SECRET} from "../../../Config/env";
import UserToken_model_mongoose from "../models/token.model";

export const validateToken_Service = async (token:string):Promise<JwtUserPayload> =>{
    if (!token || !token.startsWith("Bearer ")){
        throw new Token_Not_Found("Autorización no proporcionada")
    }

    token = token.split("Bearer ")[1]

    if (!await UserToken_model_mongoose.exists({token:token}))
        throw new Token_Not_Found("Este token no es válido, tal vez exista un token mas reciente para este usuario")

    return jwt.verify(token, JWT_ACCESS_SECRET) as JwtUserPayload // objeto que devuelve la decodificación del token
}