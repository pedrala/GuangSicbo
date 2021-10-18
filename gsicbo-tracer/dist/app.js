'use strict';

var _io = _interopRequireDefault(require("@pm2/io"));

var _logger = _interopRequireDefault(require("./logger"));

var _crawler = _interopRequireDefault(require("./crawler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new class App extends _io.default.Entrypoint {
  // This is the very first method called on startup
  onStart(cb) {
    this.crawler = new _crawler.default();
    this.crawler.start();
    return cb();
  } // This is the very last method called on exit || uncaught exception


  onStop(err, cb, code, signal) {
    this.crawler.stop();
    cb();
  } // Here we declare some process metrics


  sensors() {} // Here are some actions to interact with the app in live


  actuators() {}

}();