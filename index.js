'use strict';

let db = require('./lib/db');
let fitocracy = require('./lib/fitocracy');
let slack = require('./lib/slack');
let Promise = require('bluebird');

const fitocracyUserIdsToFollow = process.env.FITOCRACY_USER_IDS_TO_FOLLOW;

if (!fitocracyUserIdsToFollow) throw new Error('FITOCRACY_USER_IDS_TO_FOLLOW is not defined');

db.connect().then(function() {
  
  let promises = [];

  fitocracyUserIdsToFollow.split(',').forEach(function(userId) {
    promises.push(
      fitocracy.lastActivity(userId)
        .then(slack.postMessage)
        .catch(function(error) {
          console.error(error);
        })
    );
  });

  Promise.all(promises).then(function() {
    console.log('Done.');
    process.exit();
  });

});
