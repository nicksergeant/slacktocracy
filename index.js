'use strict';

let Promise = require('bluebird');
let exec = require('child_process').exec;
let sys = require('sys');

const fitocracyUsersToFollow = process.env.FITOCRACY_USERS_TO_FOLLOW;
const fitocracyUsername = process.env.FITOCRACY_USERNAME;
const fitocracyPassword = process.env.FITOCRACY_PASSWORD;
const slackWebhookUrls = process.env.SLACK_WEBHOOK_URLS;

function postToSlack(workout) {

  // let deferred = Q.defer();
  // let sys = require('sys');
  // let exec = require('child_process').exec;

  // function done(error, stdout, stderr) {
  //   deferred.resolve();
  // }

  // let payload = {
  //   "username": "Untappd",
  //   "text": "" +
  //     checkin.user.user_name + " is drinking <https://untappd.com/beer/" + checkin.beer.bid + "|" + checkin.beer.beer_name.replace('\'', '’') + "> " +
  //     "(" + checkin.beer.beer_style.replace('\'', '’') + ", " + checkin.beer.beer_abv + "% ABV) " +
  //     "by <https://untappd.com/brewery/" + checkin.brewery.brewery_id + "|" + checkin.brewery.brewery_name.replace('\'', '’') + ">.\n" + 
  //     "He rated it a " + checkin.rating_score + 
  //       (checkin.checkin_comment ?
  //         " and said \"" + checkin.checkin_comment.replace('\'', '’') + "\". " :
  //         ". ") +
  //     "<https://untappd.com/user/" + checkin.user.user_name + "/checkin/" + checkin.checkin_id + "|Toast »>"
  // };

  // if (checkin.media.count) {
  //   payload.attachments = [{
  //     fallback: "Checkin photo",
  //     image_url: checkin.media.items[0].photo.photo_img_lg
  //   }];
  // }

  // let webhookUrls = slackWebhookUrls.split(',');

  // webhookUrls.forEach((webhookUrl) -> {
  //   exec('curl -X POST --data-urlencode \'payload=' + JSON.stringify(payload) + '\' ' + webhookUrl, done);
  // });

  // return deferred.promise;

  console.log('hay');

}

postToSlack();
