// Shared/errors/control.errors.ts
import {NextFunction, Response} from "express";
import {Express} from "../types/express/index";
import Request = Express.Request;
import logger from "../../config/logger";
import {BaseError} from "./models/errors";

/**
 * Controla los errores lanzados por el servidor comparándolos con una lista de errores esperados.
 * Si el tipo de error coincide, devuelve una respuesta personalizada.
 *
 *   - Clase del error
 *   - Mensaje personalizado
 *   - Código de estado HTTP
 * @param err
 * @param req
 * @param res - Objeto Response de Express
 * @param next
 */
export const handleError = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const logPayload = {
        error: {
            type: err.name,
            code: err.code,
            message: err.rawMessage ?? err.message,
            stack: err.stack,
        },
        request: {
            path: req.url,
            method: req.method,
            IP: req.ip,
        },
        user: req.user ? {username: req.user.username} : undefined,
    };

    if (err instanceof BaseError) {
        logger.warn(logPayload);
        res.status(err.code).json({message: err.rawMessage ?? err.message});
        return;
    }

    logger.error(logPayload);
    res.status(500).json({message: "Error interno del servidor"});
};