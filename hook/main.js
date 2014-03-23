var express = require('express');
var connect = require('connect');
var db = require('monk')(process.env.OSSWEEPS_MONGO_HOST + '/data');

var app = express();
app.use(connect.bodyParser());

var DEBUG = ((process.env.OSSWEEPS_DEBUG || '').toLowerCase() === 'true');

function errorHandler(err, req, res, next) {
  db.get('web_error').insert({
    dt: new Date(),
    stack: err.stack
  });
  res.status(500);
  res.render('error', { error: err });
}
app.use(errorHandler);

function isLegitimateEntry(hookBody) {
  if (hookBody.ref !== 'refs/heads/master' ||
      (DEBUG === false && hookBody.repository.private === true)) {
    return false;
  }
  return true;
}

function isLegitimateCommit(commit) {
  if (commit.distinct === false ||
      commit.message.indexOf("Merge pull request") !== -1 ||
      commit.message.indexOf("Merge branch") !== -1) {
    return false;
  }
  return true;
}

function processEntry(hookBody) {
  if (!isLegitimateEntry(hookBody)) { return; }

  var users = {}
  var numCommits = 0;

  for (var i = 0; i < hookBody.commits.length; i++) {
    if (!isLegitimateCommit(hookBody.commits[i])) { continue; }
    var author = hookBody.commits[i].author;
    var username = author.username;
    users[username] = (users[username] || 0) + 1;
    numCommits++;
  }

  for (var user in users) {
    updateRepo(user, hookBody.repository, numCommits);
    updateUser(user, hookBody.repository, users[user]);
  }

  if (DEBUG) { writePayload(hookBody, users); }
}

function updateRepo(username, repo, numCommits) {
  db.get('repo').findOne({_id: repo.id}, function(err, doc) {
    if (err) { return; }
    if (doc) {
      db.get('repo').update(
        {_id: repo.id, 'users._id': username},
        {$inc: {'users.$.commits': numCommits},
         $set: {dt: new Date()}}
      );
    } else {
      updateDrawing('repo');
      db.get('repo').update(
        {_id: repo.id},
        {$push: {users: {_id: username, commits: numCommits}},
         $set: {dt: new Date();}},
        {upsert: true}
      );
    }
  });
}

function userHasRepo(userDoc, repo) {
  for (var i = 0; i < (userDoc.repos || []).length; i++) {
    if (userDoc.repos[i]._id === repo.id) {
      return true;
    }
  }
  return false;
}

function updateUser(username, repo, numCommits) {
  db.get('user').findOne({_id: username}, function(err, doc) {
    if (err) { return; }
    if (doc && userHasRepo(doc, repo)) {
      db.get('user').update(
        {_id: username, 'repos._id': repo.id},
        {$inc: {'repos.$.commits': numCommits}}
      );
    } else {
      updateDrawing('user');
      db.get('user').update(
        {_id: username},
        {$push: {repos: {_id: repo.id, name: repo.owner.name + "/" + repo.name, commits: numCommits}}},
        {upsert: true}
      );
    }
    }
  );
}

function updateDrawing(incKey) {
  var toInc = {};
  toInc[incKey] = 1;
  db.get('drawing').find({}, {sort: {_id: -1}, limit: 1}, function(err, docs) {
    if (err) { return; }
    if (docs.length !== 0) {
      db.get('drawing').update({_id: docs[0]._id}, {$set: {dt: new Date();}, $inc: toInc});
    } else {
      toInc['dt'] = new Date();
      db.get('drawing').update({_id: 1}, {$set: toInc}, {upsert: true});
    }
  });
}

function writePayload(hookBody, users) {
  db.get('payload').insert({
    dt: new Date(),
    payload: hookBody,
    users: users
  });
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
