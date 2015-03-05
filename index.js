'use strict';

var jsdom = require('jsdom');
let Promise = require('bluebird');
let exec = require('child_process').exec;

const fitocracyCookie = process.env.FITOCRACY_COOKIE;
const fitocracyUserIdsToFollow = process.env.FITOCRACY_USER_IDS_TO_FOLLOW;
const slackWebhookUrls = process.env.SLACK_WEBHOOK_URLS;

function lastActivity(userId) {
  return new Promise(function(resolve, reject) {
    jsdom.env({
      url: 'https://www.fitocracy.com/activity_stream/0/?user_id=' + userId,
      headers: { cookie: fitocracyCookie },
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {

        if (error) return reject(error);

        let $ = window.$;
        let workout = $('.stream_item').eq(0);

        let author = $('.stream-author', workout).text().trim();
        let type = $('.stream-type', workout).text().trim();

        resolve({
          title: `${author} ${type}`
        });

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
  lastActivity(userId).then(function(workout) {
    console.log(workout);
  });
});
