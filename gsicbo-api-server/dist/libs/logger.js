'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = require("winston");

const {
  combine,
  printf,
  colorize
} = _winston.format;
const myFormat = printf(info => {
  let msg = info.message;

  if (info.message && Object.keys(info.message).length > 0) {
    msg = JSON.stringify(info.message);
  }

  return `${info.timestamp} [ ${info.level} ]\t ${msg}`;
});
const myFormatD = printf(info => {
  let msg = info.message;

  if (info.message && Object.keys(info.message).length > 0) {
    msg = JSON.stringify(info.message, null, 4);
  }

  return `${info.timestamp} [ ${info.level} ]\t ${msg}`;
});
(0, _winston.addColors)({
  error: 'bold yellow redBG',
  warn: 'bold red whiteBG',
  info: 'bold yellow blackBG',
  debug: 'bold green blackBG'
});
const consoleLogFormat = combine(colorize(), _winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
}), myFormat);
const consoleLogFormatD = combine(colorize(), _winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
}), myFormatD);
const logger = (0, _winston.createLogger)();
const loggerD = (0, _winston.createLogger)();

if (process.env.NODE_ENV === "development") {
  logger.add(new _winston.transports.Console({
    format: consoleLogFormat,
    level: 'debug'
  }));
  loggerD.add(new _winston.transports.Console({
    format: consoleLogFormatD,
    level: 'debug'
  }));
} else {
  logger.add(new _winston.transports.Console({
    format: consoleLogFormat,
    level: 'info'
  }));
  loggerD.add(new _winston.transports.Console({
    format: consoleLogFormatD,
    level: 'info'
  }));
}

const log = {
  e: logger.error.bind(logger),
  w: logger.warn.bind(logger),
  i: logger.info.bind(logger),
  d: logger.debug.bind(loggerD)
};
var _default = log;
exports.default = _default;