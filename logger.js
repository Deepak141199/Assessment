const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(), 
    format.json(), 
    format.timestamp(), 
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`; 
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('This is an info message');
logger.error('This is an error message');

