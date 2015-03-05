'use strict';

let Promise = require('bluebird');
let request = require('request');
let exec = require('child_process').exec;

const fitocracyCookie = process.env.FITOCRACY_COOKIE;
const fitocracyUserIdsToFollow = process.env.FITOCRACY_USER_IDS_TO_FOLLOW;
const slackWebhookUrls = process.env.SLACK_WEBHOOK_URLS;

function userActivityStream(userId) {
  return new Promise(function(resolve, reject) {
    request({
      headers: {
        Cookie: fitocracyCookie
      },
      url: 'https://www.fitocracy.com/activity_stream/0/?user_id=' + userId
    }, function(error, response) {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
function postToSlack(workout) {

  let payload = {
    username: 'Fitocracy',
    text: 'Hay gurl.'
  };

  slackWebhookUrls.split(',').forEach(function(webhookUrl) {
    exec('curl -X POST --data-urlencode \'payload=' + JSON.stringify(payload) + '\' ' + webhookUrl);
  });

}

fitocracyUserIdsToFollow.split(',').forEach(function(userId) {
  userActivityStream(userId).then(function(workouts) {
    console.log(workouts);
  });
});
