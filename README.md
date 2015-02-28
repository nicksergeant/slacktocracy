slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create`
3. `heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git`
4. `heroku config:set PATH=$PATH:vendor/phantomjs/bin`
5. `heroku config:add FITOCRACY_USERS_TO_FOLLOW=nicksergeant`
6. `heroku config:add FITOCRACY_USERNAME=<username>`
7. `heroku config:add FITOCRACY_PASSWORD=<password>`
8. `heroku config:add SLACK_WEBHOOK_URL=<slack_webhook_url>,<slack_webhook_url2>`
9. `heroku addons:add mongolab:sandbox`
10. `heroku addons:add scheduler:standard`
11. `heroku addons:open scheduler`
12. Add job -> `node index.js` -> `Every 10 minutes`
