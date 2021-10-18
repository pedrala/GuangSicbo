'use strict';

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _compression = _interopRequireDefault(require("compression"));

var _cors = _interopRequireDefault(require("cors"));

var _http = _interopRequireDefault(require("http"));

var _logger = _interopRequireDefault(require("./libs/logger"));

var _socket = _interopRequireDefault(require("./socket"));

var _rest = require("./rest");

var _rxjs = require("rxjs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const port = process.env.API_PORT | 8081;
const app = (0, _express.default)();

const server = _http.default.Server(app);

const gameResults = new _rxjs.Subject(); // Express

app.use((0, _cors.default)());
app.use(_bodyParser.default.urlencoded({
  extended: false
}));
app.use(_bodyParser.default.json());
app.use((0, _compression.default)({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }

    return _compression.default.filter(req, res);
  }
}));
app.post('/api/v1/games', _rest.postGames);
app.post('/internal/api/v1/results', (req, res) => (0, _rest.postResults)(req, res, gameResults));
app.get('/api/v1/leaderboard', _rest.getLeaderboard);
app.get('/api/v1/orders', _rest.getOrders);
app.get('/api/v1/dividends', _rest.getDividends);
app.get('/api/v1/users', _rest.getUsers);
app.get('/api/v1/games', _rest.getGames);
app.get('/api/v1/bets', _rest.getBets);
app.use(_rest.forbidden); // Scoket.io

(0, _socket.default)(server, gameResults);
server.listen(port, () => {
  _logger.default.i(`Guang Sicbo server listening on port ${port}`);
});