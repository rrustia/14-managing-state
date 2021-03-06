'use strict';

const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const requestProxy = require('express-request-proxy');
const app = express();
const PORT = process.env.PORT || 3000;
const conString = 'postgres://david:Password@localhost:5432'; // DONE: Don't forget to set your own conString
const client = new pg.Client(conString);
client.connect(console.error);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


//[x] DONE: Describe what our function for our middleware / proxy handling interacts with, both in what it does and where it is called
//   It is called in requestRepos it appends data to repos.all, then sends a callback.
function proxyGitHub(request, response) {
  console.log('Routing GitHub request for', request.params[0]);
  (requestProxy({
    url: `https://api.github.com/${request.params[0]}`,
    headers: {Authorization: `token ${process.env.GITHUB_TOKEN}`}
  }))(request, response);
}


// NOTE: Routes for requesting HTML resources
app.get('/', (request, response) => response.sendFile('index.html', {root: './public'}));
app.get('/new', (request, response) => response.sendFile('new.html', {root: './public'}));
app.get('/about', (request, response) => response.sendFile('index.html', {root: './public'}));
//[x] DONE: Where is this route called in the code? When invoked, what happens next?
// this is called requestProxy (express-request-proxy)  When invoked it creates a custom route by appending the needed URL to send a request to the github API.
app.get('/github/*', proxyGitHub);


// NOTE: Routes for making API calls to enact CRUD Operations on our database
app.get('/articles', (request, response) => {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR (255)
    );`
  )
  client.query(`
    CREATE TABLE IF NOT EXISTS
    articles (
      article_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`
  )
  client.query(`
    SELECT * FROM articles
    INNER JOIN authors
      ON articles.author_id=authors.author_id;`,
    (err, result) => {
      if (err) console.error(err);
      response.send(result.rows);
    }
  );
});


//[x] DONE: This is a new route to find a specific instance of an article record from the DB. Where is it invoked? What does it do?
// This is invoked in articles.js by the method findWhere.  It returns data from the articles table, joined with the appropriate data from authors table, to be stored in the "sql" variable.
app.get('/articles/find', (request, response) => {
  let client = new pg.Client(conString);
  let sql = `SELECT * FROM articles
            INNER JOIN authors
            ON articles.author_id=authors.author_id
            WHERE ${request.query.field}=$1`

  client.connect(err => {
    if (err) console.error(err);
    client.query(
      sql,
      [request.query.val],
      (err, result) => {
        if (err) console.error(err);
        response.send(result.rows);
        client.end();
      }
    )
  })
})


//[x] DONE: Where is this route invoked? What does it do?
// this is invoked in the model (article.js) Article.allCategories method, which sends a query to our database and returns data to articleView.js (view) to provide the callback for our append method to write to the document.
app.get('/categories', (request, response) => {
  let client = new pg.Client(conString);

  client.connect(err => {
    if (err) console.error(err);
    client.query(`SELECT DISTINCT category FROM articles;`, (err, result) => {
      if (err) console.error(err);
      response.send(result.rows);
      client.end();
    })
  })
})

app.post('/articles', (request, response) => {
  client.query(
    'INSERT INTO authors(author, "authorUrl") VALUES($1, $2) ON CONFLICT DO NOTHING',
    [request.body.author, request.body.authorUrl],
    err => {
      if (err) console.error(err)
      queryTwo()
    }
  )

  function queryTwo() {
    client.query(
      `SELECT author_id FROM authors WHERE author=$1`,
      [request.body.author],
      (err, result) => {
        if (err) console.error(err)
        queryThree(result.rows[0].author_id)
      }
    )
  }

  function queryThree(author_id) {
    client.query(
      `INSERT INTO
      articles(author_id, title, category, "publishedOn", body)
      VALUES ($1, $2, $3, $4, $5);`,
      [
        author_id,
        request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body
      ],
      err => {
        if (err) console.error(err);
        response.send('insert complete');
      }
    );
  }
});

app.put('/articles/:id', (request, response) => {
  client.query(
    `SELECT author_id FROM authors WHERE author=$1`,
    [request.body.author],
    (err, result) => {
      if (err) console.error(err)
      queryTwo(result.rows[0].author_id)
      queryThree(result.rows[0].author_id)
    }
  )

  function queryTwo(author_id) {
    client.query(
      `UPDATE authors
      SET author=$1, "authorUrl"=$2
      WHERE author_id=$3;`,
      [request.body.author, request.body.authorUrl, author_id]
    )
  }

  function queryThree(author_id) {
    client.query(
      `UPDATE articles
      SET author_id=$1, title=$2, category=$3, "publishedOn"=$4, body=$5
      WHERE article_id=$6;`,
      [
        author_id,
        request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.params.id
      ],
      err => {
        if (err) console.error(err);
        response.send('update complete');
      }
    );
  }
});

app.delete('/articles/:id', (request, response) => {
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  );
  response.send('Delete complete');
});

// DONE: Where is this invoked? What does it do?
// It is invoked when the user hits the delete records URL.  It calls .delete() which is a method on express, our app, with params of request, response, and sends a call to pgsql to truncate the table.
app.delete('/articles', (request, response) => {
  client.query(
    'DELETE FROM articles;'
  );
  response.send('Delete complete');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
