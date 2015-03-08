'use strict';

let jsdom = require('jsdom');
let Promise = require('bluebird');
let Slack = require('slack-node');
let $;

const fitocracyCookie = process.env.FITOCRACY_COOKIE;
const fitocracyUserIdsToFollow = process.env.FITOCRACY_USER_IDS_TO_FOLLOW;
const slackWebhookUrls = process.env.SLACK_WEBHOOK_URLS;

function linkify(link, text) {
  return `<${ link }|${ text }>`;
}
function parseAction(action) {

  if ($('div.group_container', action).length) {

    // TODO: Handle grouped workouts.

  } else {

    let exercises = $('li:not(.stream_note)', action).toArray();
    let title = `*${ $('div.action_prompt', action).text() }*`;
    let note = $('li.stream_note', action).length ? 
      `\n"${ $('li.stream_note', action).text() }"` : '';

    let parsedExercises = exercises.map(function(exercise) {

      let $exercise = $(exercise);
      let points = $('span.action_prompt_points', $exercise).remove().text();

      return `- ${ $exercise.text().trim() } (${ points } pts)`;
    });

    return `${ title }${ parsedExercises.join('\n') }${ note }`;

  }

}
function lastActivity(userId) {
  return new Promise(function(resolve, reject) {
    jsdom.env({
      url: 'https://www.fitocracy.com/activity_stream/0/?user_id=' + userId,
      headers: { cookie: fitocracyCookie },
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {

        if (error) return reject(error);

        $ = window.$;
        let workout = $('.stream_item').eq(0);

        let actions = $('ul.action_detail > li', workout).toArray();
        let author = $('.stream-author', workout).text().trim();
        let type = $('.stream-type', workout).text().trim();
        let url = `https://www.fitocracy.com/${ $('.action_time', workout).attr('href') }`;

        let parsedActions = actions.map(parseAction).join('\n\n');

        let text = `${ author } ${ type }. ${ linkify(url, 'View »') }\n\n${ parsedActions }`;

        resolve({
          title: text
        });

      }
    });
  });
}
function postToSlack(workout) {

  let payload = {
    username: 'Fitocracy',
    icon_emoji: 'http://i.imgur.com/ZmrMHuA.png',
    text: workout.title
  };

  slackWebhookUrls.split(',').forEach(function(webhookUrl) {
    let slack = new Slack();
    slack.setWebhook(webhookUrl);
    slack.webhook(payload, function(err, response) {
      if (err) throw err;
    });
  });

}

fitocracyUserIdsToFollow.split(',').forEach(function(userId) {
  lastActivity(userId).then(function(workout) {
    postToSlack(workout);
  });
});
