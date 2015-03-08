'use strict';

let $;
let db;
let jsdom = require('jsdom');
let MongoClient = require('mongodb').MongoClient;
let Promise = require('bluebird');
let Slack = require('slack-node');

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

        let id = parseInt($('.action_time', workout).attr('href').split('/')[2]);

        db.collection('workouts').find({
          workout_id: id
        }).toArray(function(err, existingWorkouts) {
          if (existingWorkouts.length) {
            return reject(`- ${ id } already tracked.`);
          }
          db.collection('workouts').save({
            workout_id: id
          }, function(err, result) {

            console.log('- Added workout', result.workout_id + '.');

            let actions = $('ul.action_detail > li', workout).toArray();
            let author = $('.stream-author', workout).text().trim();
            let type = $('.stream-type', workout).text().trim();
            let url = `https://www.fitocracy.com${ $('.action_time', workout).attr('href') }`;

            let parsedActions = actions.map(parseAction);

            let text = `${ author } ${ type }. ${ linkify(url, 'View »') }\n\n${ parsedActions.join('') }`;

            resolve({
              title: text
            });

          });
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
function postToSlack(workout, resolve) {

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
      resolve();
    });
  });

}

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/slacktocracy';
MongoClient.connect(mongoUri, function(err, mongoDb) {

  db = mongoDb;
  
  let promises = [];

  fitocracyUserIdsToFollow.split(',').forEach(function(userId) {

    promises.push(new Promise(function(resolve, reject) {
      lastActivity(userId).then(function(workout) {
        return postToSlack(workout, resolve);
      }).catch(function(error) {
        resolve(console.error(error));
      });
    }));
  });

  Promise.all(promises).then(function() {
    console.log('Done.');
    process.exit();
  });

});
