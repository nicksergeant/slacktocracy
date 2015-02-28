slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create`
2. `heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git`
3. `heroku config:set PATH=$PATH:vendor/phantomjs/bin`
4. `heroku config:add FITOCRACY_USERS_TO_FOLLOW=nicksergeant`
5. `heroku config:add FITOCRACY_USERNAME=<username>`
6. `heroku config:add FITOCRACY_PASSWORD=<password>`
7. `heroku config:add SLACK_WEBHOOK_URLS=<slack_webhook_url>,<slack_webhook_url2>`
8. `heroku addons:add mongolab:sandbox`
9. `heroku addons:add scheduler:standard`
10. `git push heroku`
11. `heroku addons:open scheduler`
12. Add job -> `node index.js` -> `Every 10 minutes`
