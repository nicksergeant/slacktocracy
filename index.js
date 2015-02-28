'use strict';

const fitocracyUsersToFollow = process.env.FITOCRACY_USERS_TO_FOLLOW;
const fitocracyUsername = process.env.FITOCRACY_USERNAME;
const fitocracyPassword = process.env.FITOCRACY_PASSWORD;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

console.log(fitocracyUsersToFollow, fitocracyUsername, fitocracyPassword, slackWebhookUrl);
