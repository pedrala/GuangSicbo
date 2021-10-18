'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _mysql = _interopRequireDefault(require("mysql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pool = _mysql.default.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  supportBigNumbers: true
});

class Database {
  constructor() {}

  connect() {
    return new _rxjs.Observable(observer => {
      pool.getConnection((error, connection) => {
        if (error) {
          return observer.error(error);
        }

        this.connection = connection;
        observer.next(this);
        observer.complete();
      });
    });
  }

  release() {
    this.connection.release();
  }

  beginTransaction() {
    return new _rxjs.Observable(observer => {
      this.connection.beginTransaction(error => {
        if (error) {
          return observer.error(error);
        }

        observer.next(this);
        observer.complete();
      });
    });
  }

  commit() {
    return new _rxjs.Observable(observer => {
      this.connection.commit(error => {
        if (error) {
          return observer.error(error);
        }

        observer.next(this);
        observer.complete();
      });
    });
  }

  rollback() {
    return new _rxjs.Observable(observer => {
      this.connection.rollback(error => {
        if (error) {
          return observer.error(error);
        }

        observer.next(this);
        observer.complete();
      });
    });
  }

  query(query, params) {
    return new _rxjs.Observable(observer => {
      this.connection.query(query, params, (error, result) => {
        if (error) {
          return observer.error(error);
        }

        observer.next(result);
        observer.complete();
      });
    });
  }

}

exports.default = Database;