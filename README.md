slacktocracy
============

A tiny little app to post Fitocracy workouts to Slack.

1. `heroku create`
2. Log in to [Fitocracy](https://www.fitocracy.com/).
3. Inspect any web request via the network inspector in your browser.
4. From the `Request Headers` section, copy the entire cookie string.
5. Seriously what the hell are you doing.
6. You know what? Computers are absolutely terrible. If I had an API to work
   with we wouldn't be in this mess.
7. In fact, you should just create an entirely new user on Fitocracy before
   you do this. I have no idea why Fitocracy hides user profiles behind auth
   anyway - you don't have to be friends with someone to view their activity
   stream.
8. `heroku config:add FITOCRACY_COOKIE=<cookie_string>`
9. Visit a user on Fitocracy who you want to track and open up the got-damn
   inspector again.
10. Type `profile_user_id` and hit enter.
11. `heroku config:add FITOCRACY_USER_IDS_TO_FOLLOW=583852,583853`
12. `heroku config:add SLACK_WEBHOOK_URLS=<slack_webhook_url>,<slack_webhook_url2>`
13. `heroku addons:add mongolab:sandbox`
14. `heroku addons:add scheduler:standard`
15. `git push heroku`
16. `heroku addons:open scheduler`
17. Add job -> `node index.js` -> `Every 10 minutes`
18. Just give up.
19. Go be a [coconut salesman](http://isles.broker.is/).
