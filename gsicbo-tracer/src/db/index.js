'use strict'
import {
  Observable
} from 'rxjs';
import mysql from 'mysql';

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  supportBigNumbers: true
});

export default class Database {
  constructor() {}

  connect() {
    return new Observable(observer => {
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
    return new Observable(observer => {
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
    return new Observable(observer => {
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
    return new Observable(observer => {
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
    return new Observable(observer => {
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
