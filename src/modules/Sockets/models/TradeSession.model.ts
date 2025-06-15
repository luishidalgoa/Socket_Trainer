export interface TradeSession {
    // Identificador único de la sesión, puede ser un UUID generado al crearla
    roomSessionId: string;

    users: {
        [username: string]: {
            socketId: string; // ID del socket del usuario
            role: 'creator' | 'invited'; // Rol del usuario en la sesión
            trade_status: 'propose_trade' | 'trade_accept' |'none'; // Estado del intercambio para este usuario
            connected: boolean; // Indica si el usuario está conectado
            offeredCardIds: string | number[]; // IDs de cartas que propone intercambiar
        };
    }

    // Estado actual de la sesión. Controla la etapa del proceso.
    // Posibles valores: 'waiting', 'active', 'denied'
    status: 'waiting' | 'active' | 'denied' | 'closed';

    // Timestamp de la última acción, útil para TTL y limpieza de sesiones inactivas
    lastUpdated: Date;
}