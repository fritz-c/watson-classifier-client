# Watson Classifier Client

A web client for using a trained Watson classifier.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Manual Heroku deploy:
```sh
heroku create

heroku addons:create heroku-postgresql:hobby-dev
node init-database.js

# Enable db access from local app
# get DATABASE_URL info from:
heroku config -s
# Replace CONFIG_VAL with the URL and the following to an .env file in the project root
DATABASE_URL=CONFIG_VAL?ssl=true

# Add configuration for Watson classifier API
# (Add the same environment vars to .env file for local dev)
heroku config:set CLASSIFIER_ID=MY_CLASSIFIER_ID
heroku config:set CLASSIFIER_USER=MY_CLASSIFIER_USER
heroku config:set CLASSIFIER_PASS=MY_CLASSIFIER_PASS
```

### License

MIT
