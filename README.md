har-monitor
===================

## Deploying

This can be deployed to heroku with the [phantomjs buildpack](https://github.com/stomita/heroku-buildpack-phantomjs).

```bash
# create a new heroku app
heroku create --stack cedar --buildpack http://github.com/stomita/heroku-buildpack-phantomjs.git

# deploy
git push heroku master

#if not working
heroku ps:scale web=1
heroku restart

## Demo

[Demo](https://har-monitor.herokuapp.com/?url=http://www.google.com).
