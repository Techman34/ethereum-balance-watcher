
var winston     = require('winston');
var Transport   = require('winston-transport')
var matrix      = require("matrix-js-sdk");

const DEFAULT_RIOT_URL = "https://matrix.org"

export class Riot {
    constructor(opts) {
        let {token, user, room, url=DEFAULT_RIOT_URL} = opts;

        this.room = room;
        this.client = matrix.createClient({
            baseUrl: url,
            accessToken: token,
            userId: user,
        })
    }

    error(info) {
        logger.error(info);
        this.client.sendTextMessage(this.room, "[BALANCE WATCHER] " + info);
    }
}

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ property: 'level' }),
                winston.format.printf( 
                    (info) => { return `${info.level}: ${info.message}` } 
                )
            ),
            colorize: true,
        }),
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error' 
        }),
    ]
});

export default logger;
