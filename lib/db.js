'use strict';

let MongoClient = require('mongodb').MongoClient;
let Promise = require('bluebird');

module.exports = {
  connection: null,
  connect: function() {
    return new Promise(function(resolve, reject) {
      MongoClient.connect(process.env.MONGO_URL, function(error, db) {
        if (error) throw new Error(error);
        this.connection = db;
        resolve();
      }.bind(this));
    }.bind(this));
  }
};
