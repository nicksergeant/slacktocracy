'use strict';

let jsdom = require('jsdom');
let Promise = require('bluebird');
let Slack = require('slack-node');
let $;

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

        $ = window.$;
        let workout = $('.stream_item').eq(0);

        let actions = $('ul.action_detail > li', workout).toArray();
        let author = $('.stream-author', workout).text().trim();
        let type = $('.stream-type', workout).text().trim();
        let url = `https://www.fitocracy.com${ $('.action_time', workout).attr('href') }`;

        let parsedActions = actions.map(parseAction);

        let text = `${ author } ${ type }. ${ linkify(url, 'View »') }\n\n${ parsedActions.join('') }`;

        resolve({
          title: text
        });

      }
    });
  });
}
function linkify(link, text) {
  return `<${ link }|${ text }>`;
}
function parseAction(action) {

  let groupedWorkout = $('div.group_container', action).length;

  let title = `*${ $('> div.action_prompt', action).text().trim() }*`;

  let note = '';
  if ($('li.stream_note', action).length) {
    note = groupedWorkout ? 
      `\n\n"${ $('li.stream_note', action).text() }"` :
      `\n> \n> "${ $('li.stream_note', action).text() }"`;
  }

  let parsedExercises = groupedWorkout ?
      parseGroupedAction(action) :
      parseNonGroupedAction(action);

  return groupedWorkout ?
    `${ title }\n${ parsedExercises.join('\n') }${ note }\n\n` :
    `\n> ${ title }\n${ parsedExercises.join('\n') }${ note }\n> `;

}
function parseGroupedAction(action) {
  let exercises = $('div.group_container:eq(0) div > ul > li', action).toArray();

  return exercises.map(function(exercise, index) {

    let $exercise = $(exercise);
    let title = $('div.action_prompt', $exercise).text();
    let sets = $('ul > li', $exercise).toArray();

    let parsedSets = sets.map(function(set) {

      let points = $('span.action_prompt_points', set).remove().text();
      let title = $(set).text().trim();

      return `> ${ title } (${ points } pts)`;
    });

    return index !== 0 ?
      `> \n> *${ title.trim() }*\n${ parsedSets.join('\n') }` :
      `> *${ title.trim() }*\n${ parsedSets.join('\n') }`;
  });
}
function parseNonGroupedAction(action) {
  let exercises = $('li:not(.stream_note)', action).toArray();

  return exercises.map(function(exercise) {

    let $exercise = $(exercise);
    let points = $('span.action_prompt_points', $exercise).remove().text();

    return `> ${ $exercise.text().trim() } (${ points } pts)`;
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
