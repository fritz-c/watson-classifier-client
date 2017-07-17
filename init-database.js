require('dotenv').config();
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

client.connect(connectErr => {
  if (connectErr) {
    // eslint-disable-next-line no-console
    console.error('could not connect to postgres', connectErr);
    return;
  }

  client.query(
    'CREATE TABLE IF NOT EXISTS categoryHistory (id SERIAL NOT NULL, phrase varchar, category varchar)',
    err => {
      client.end();
      if (err) {
        // eslint-disable-next-line no-console
        console.error('error running query', err);
      }
    }
  );
});
