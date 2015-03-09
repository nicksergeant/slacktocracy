'use strict';

let $;
let db = require('./lib/db');
let slack = require('./lib/slack');
let jsdom = require('jsdom');
let Promise = require('bluebird');

const fitocracyCookie = process.env.FITOCRACY_COOKIE;
const fitocracyUserIdsToFollow = process.env.FITOCRACY_USER_IDS_TO_FOLLOW;

if (!fitocracyCookie) return console.error('FITOCRACY_COOKIE is not defined');
if (!fitocracyUserIdsToFollow) return console.error('FITOCRACY_USER_IDS_TO_FOLLOW is not defined');

function lastActivity(userId) {
  return new Promise(function(resolve, reject) {
    jsdom.env({
      url: 'https://www.fitocracy.com/activity_stream/0/?user_id=' + userId,
      headers: { cookie: fitocracyCookie },
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {

        if (error) return reject(error);

        $ = window.$;
        let workout = $('.stream_item[data-ag-type="workout"]').eq(0);

        if (!workout.length) return reject(`- ${ userId } has no workouts.`);

        let id = parseInt($('.action_time', workout).attr('href').split('/')[2]);

        db.connection.collection('workouts').find({
          workout_id: id
        }).toArray(function(error, existingWorkouts) {
          // if (existingWorkouts.length) {
          if (false) {
            return reject(`- ${ id } already tracked.`);
          }
          db.connection.collection('workouts').save({
            workout_id: id
          }, function(error, result) {

            if (error) return reject(error);

            console.log('- Added workout', result.workout_id + '.');

            let actions = $('ul.action_detail > li', workout).toArray();
            let author = $('.stream-author', workout).text().trim();
            let type = $('.stream-type', workout).text().trim();
            let url = `https://www.fitocracy.com${ $('.action_time', workout).attr('href') }`;

            let parsedActions = actions.map(parseAction);

            let message = `${ author } ${ type }. ${ linkify(url, 'View »') }\n\n${ parsedActions.join('') }`;

            resolve(message);

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

db.connect().then(function() {
  
  let promises = [];

  fitocracyUserIdsToFollow.split(',').forEach(function(userId) {
    promises.push(
      lastActivity(userId)
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
