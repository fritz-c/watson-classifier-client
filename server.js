require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const axios = require('axios');
const ejs = require('ejs');

const port = process.env.PORT || 3001;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.static(path.resolve('client', 'build')));
app.set('views', path.resolve('client', 'build'));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.render('index.html');
});

app.post('/query', (req, res) => {
  const { phrase } = req.body;

  pool.connect((connectErr, client, done) => {
    if (connectErr) throw connectErr;

    // Check the db to see if the phrase has already been categorized
    client.query(
      'SELECT category FROM categoryHistory WHERE phrase = $1 LIMIT 1;',
      [phrase],
      (selectErr, result) => {
        done();
        if (selectErr) {
          // eslint-disable-next-line no-console
          console.error('error running query', selectErr);
          return;
        }

        // if there are old results, return them and quit
        if (result && result.rows.length > 0) {
          res.send({ phrase, category: JSON.parse(result.rows[0].category) });
          return;
        }

        // fetch from watson
        axios
          .post(
            `https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/${process
              .env.CLASSIFIER_ID}/classify`,
            { text: phrase },
            {
              headers: {
                Authorization: `Basic ${new Buffer(
                  `${process.env.CLASSIFIER_USER}:${process.env
                    .CLASSIFIER_PASS}`
                ).toString('base64')}`,
              },
            }
          )
          .then(watsonRes => {
            // Cache full response in db
            client.query(
              'INSERT INTO categoryHistory (phrase, category) VALUES ($1, $2) RETURNING id',
              [phrase, JSON.stringify(watsonRes.data)],
              err => {
                done();
                if (err) {
                  // eslint-disable-next-line no-console
                  console.error('error running query', err);
                }
              }
            );

            res.send({ phrase, category: watsonRes.data });
          })
          .catch(watsonErr => {
            console.error(watsonErr); // eslint-disable-line no-console
          });
      }
    );
  });
});

// curl -X POST \
//   http://localhost:3000/submit \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/x-www-form-urlencoded' \
//   -d 'user=Chris&song=Help.mp3&vote=sad'

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening at http://localhost:${port}`);
});
