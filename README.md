slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create --buildpack https://github.com/stomita/heroku-buildpack-phantomjs.git`
2. `heroku config:add FITOCRACY_USERS_TO_FOLLOW=nicksergeant`
3. `heroku config:add FITOCRACY_USERNAME=<username>`
4. `heroku config:add FITOCRACY_PASSWORD=<password>`
5. `heroku config:add SLACK_WEBHOOK_URL=<slack_webhook_url>,<slack_webhook_url2>`
6. `heroku addons:add mongohq:sandbox`
7. `heroku addons:add scheduler:standard`
8. `heroku addons:open scheduler`
9. Add job -> `node index.js` -> `Every 10 minutes`
