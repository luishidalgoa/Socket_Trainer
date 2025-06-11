import dayjs from "dayjs";
import pino from "pino";

const log = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            colorizeObjects: true,
            translateTime: true,
            minimumLevel: "info", // Ahora sí se respeta esto
        },
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
