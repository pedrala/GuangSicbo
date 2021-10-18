'use strict'

import io from '@pm2/io'

import log from './logger'
import Crawler from './crawler'

new class App extends io.Entrypoint {
  // This is the very first method called on startup
  onStart(cb) {
    this.crawler = new Crawler();
    this.crawler.start();
    return cb()
  }

  // This is the very last method called on exit || uncaught exception
  onStop(err, cb, code, signal) {
    this.crawler.stop();
    cb()
  }

  // Here we declare some process metrics
  sensors() {}

  // Here are some actions to interact with the app in live
  actuators() {}
}