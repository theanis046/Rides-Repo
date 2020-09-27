const winston = require('winston');


const myformat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp(),
	winston.format.json(),
	winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)

const logger = winston.createLogger({
	level: 'info',
	format: myformat,
	transports: [
		new winston.transports.File({ filename: './log/logs.log' }),
	],
});


if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.simple(),
	}));
}

module.exports = logger;