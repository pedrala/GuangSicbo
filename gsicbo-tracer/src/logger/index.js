'use strict'

import {
  createLogger,
  format,
  transports,
  addColors,
} from 'winston'

const {
  combine,
  printf,
  colorize,
} = format

const myFormat = printf(info => {
  let msg = info.message
  if (info.message && Object.keys(info.message).length > 0) {
    msg = JSON.stringify(info.message)
  }
  return `${info.timestamp} [ ${info.level} ]\t ${msg}`
})

const myFormatD = printf(info => {
  let msg = info.message
  if (info.message && Object.keys(info.message).length > 0) {
    msg = JSON.stringify(info.message, null, 4)
  }
  return `${info.timestamp} [ ${info.level} ]\t ${msg}`
})

addColors({
  error: 'bold yellow redBG',
  warn: 'bold red whiteBG',
  info: 'bold yellow blackBG',
  debug: 'bold green blackBG'
})

const consoleLogFormat = combine(
  colorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  myFormat
)

const consoleLogFormatD = combine(
  colorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  myFormatD
)

const logger = createLogger()
const loggerD = createLogger()

if (process.env.NODE_ENV === "development") {
  logger.add(new transports.Console({
    format: consoleLogFormat,
    level: 'debug'
  }))
  loggerD.add(new transports.Console({
    format: consoleLogFormatD,
    level: 'debug'
  }))
} else {
  logger.add(new transports.Console({
    format: consoleLogFormat,
    level: 'info'
  }))
  loggerD.add(new transports.Console({
    format: consoleLogFormatD,
    level: 'info'
  }))
}

const log = {
  e: logger.error.bind(logger),
  w: logger.warn.bind(logger),
  i: logger.info.bind(logger),
  d: logger.debug.bind(loggerD)
}

export default log;
