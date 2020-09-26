const winston = require('winston')

const myformat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp(),
	winston.format.align(),
	winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			format: myformat
		})
	]
})

logger.configure({
	level: 'info',
	transports: [
		new winston.transports.Console()
	]
})

module.exports = logger