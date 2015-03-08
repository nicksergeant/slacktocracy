slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create`
2. Log in to [Fitocracy](https://www.fitocracy.com/).
3. Inspect any web request via the network inspector in your browser.
4. From the `Request Headers` section, copy the entire cookie string.
5. `heroku config:add FITOCRACY_COOKIE=<cookie_string>`
6. Visit a user on Fitocracy who you want to track and open up the inspector again.
7. Type `profile_user_id` and hit enter.
8. `heroku config:add FITOCRACY_USER_IDS_TO_FOLLOW=583852,583853`
9. `heroku config:add SLACK_WEBHOOK_URLS=<slack_webhook_url>,<slack_webhook_url2>`
10. `heroku addons:add mongolab:sandbox`
11. `heroku addons:add scheduler:standard`
12. `git push heroku`
13. `heroku addons:open scheduler`
14. Add job -> `node index.js` -> `Every 10 minutes`
