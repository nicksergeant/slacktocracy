'use strict';

let Promise = require('bluebird');
let Slack = require('slack-node');

const slackWebhookUrls = process.env.SLACK_WEBHOOK_URLS;

if (!slackWebhookUrls) return console.error('SLACK_WEBHOOK_URLS is not defined');

module.exports = {
  postMessage: function(message) {
    return new Promise(function(resolve, reject) {
      let payload = {
        username: 'Fitocracy',
        icon_emoji: 'http://i.imgur.com/ZmrMHuA.png',
        text: message
      };
      slackWebhookUrls.split(',').forEach(function(webhookUrl) {
        let slack = new Slack();
        slack.setWebhook(webhookUrl);
        slack.webhook(payload, function(error, response) {
          return error ? reject(error) : resolve(response);
        });
      });
    });
  }
};
