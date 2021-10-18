'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import http from 'http';
import log from './libs/logger';
import socket from './socket';
import {
  postGames,
  postResults,
  getLeaderboard,
  getOrders,
  getDividends,
  getUsers,
  getGames,
  getBets,
  forbidden
} from './rest';

import {Subject} from 'rxjs';

const port = process.env.API_PORT | 8081;
const app = express();
const server = http.Server(app);
const gameResults = new Subject();

// Express
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.post('/api/v1/games', postGames);
app.post('/internal/api/v1/results', (req, res) => postResults(req, res, gameResults));
app.get('/api/v1/leaderboard', getLeaderboard);
app.get('/api/v1/orders', getOrders);
app.get('/api/v1/dividends', getDividends);
app.get('/api/v1/users', getUsers);
app.get('/api/v1/games', getGames);
app.get('/api/v1/bets', getBets);

app.use(forbidden);

// Scoket.io
socket(server, gameResults);

server.listen(port, () => {
  log.i(`Guang Sicbo server listening on port ${port}`);
});