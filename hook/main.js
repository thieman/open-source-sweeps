var express = require('express');
var connect = require('connect');
var db = require('monk')(process.env.OSSWEEPS_MONGO_HOST + '/data');

var app = express();
app.use(connect.bodyParser());

function errorHandler(err, req, res, next) {
  db.get('web_error').insert({
    dt: new Date(),
    stack: err.stack
  });
  res.status(500);
  res.render('error', { error: err });
}
app.use(errorHandler);

function processEntry(hookBody) {
  if (hookBody.ref !== 'refs/heads/master' ||
      hookBody.repository.private === true) {
    return;
  }

  var users = {}
  var numCommits = 0;

  for (var i = 0; i < hookBody.commits.length; i++) {
    if (hookBody.commits[i].distinct === false) {
      continue;
    }
    var author = hookBody.commits[i].author;
    var username = author.username;
    users[username] = (users[username] || 0) + 1;
    numCommits++;
  }

  updateRepo(hookBody.repository, numCommits);
  for (var user in users) {
    updateUser(user, hookBody.repository, users[user]);
  }
}

function updateRepo(repo, numCommits) {
  db.get('repo').update(
    {_id: repo.id},
    {
      $set: {
        name: repo.name,
        url: repo.url
      },
      $inc: {entries: numCommits}
    },
    {upsert: true}
  );
}

function updateUser(username, repo, numCommits) {
  var repoKey = 'repos.' + repo.id;
  db.get('user').update(
    {_id: username},
    {$inc: {repoKey: numCommits}},
    {upsert: true}
  );
}

app.post('/', function(req, res) {
  try { processEntry(req.body); }
  catch (err) {
    db.get('error').insert({
      dt: new Date(),
      body: req.body,
      stack: err.stack
    });
  }
  res.end();
});

var server = app.listen(7777, function() {
  console.log('Hook server started on port %d', server.address().port);
});
