slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create`
2. `heroku config:set PATH=$PATH:vendor/phantomjs/bin`
3. `heroku config:add FITOCRACY_USERS_TO_FOLLOW=nicksergeant`
4. `heroku config:add FITOCRACY_USERNAME=<username>`
5. `heroku config:add FITOCRACY_PASSWORD=<password>`
6. `heroku config:add SLACK_WEBHOOK_URL=<slack_webhook_url>,<slack_webhook_url2>`
7. `heroku addons:add mongolab:sandbox`
8. `heroku addons:add scheduler:standard`
9. `heroku addons:open scheduler`
10. Add job -> `node index.js` -> `Every 10 minutes`
