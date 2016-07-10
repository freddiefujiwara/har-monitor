har-monitor
===================
## Demo

[Demo](https://har-monitor.herokuapp.com/?url=http://www.rakuten.co.jp&ua=sp).
[Har Viewer](http://www.softwareishard.com/har/viewer/?inputUrl=https%3A%2F%2Fhar-monitor.herokuapp.com%2F%3Furl%3Dhttp%3A%2F%2Fwww.rakuten.co.jp%26ua%3Dsp).

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
```

## Thanks for the qiita article
[ページ表示速度をPhantomJSで計測してZabbixに記録する](http://qiita.com/zaru/items/d6c6be01f7153f2bf9c1).
