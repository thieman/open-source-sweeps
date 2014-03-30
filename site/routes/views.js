var api = require('./api');

var potPercentage = (process.env.POT_PERCENTAGE || 0.5);

function sortByKey(array, key, reverse) {
    return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      if (!reverse) {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      } else {
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
      }
    });
}

exports.index = function(req, res) {
  api.withBitcoinInfo(req, function(total, balance) {
    api.withCurrentDrawing(req, function(drawing) {
      res.render('home', {navKey: 'home', pot: balance * potPercentage, drawing: drawing});
    });
  });
};

exports.lookup = function(req, res) {
  if (req.body.user) { res.redirect('/user/' + req.body.user); }
  if (req.body.repo) { res.redirect('/repo/' + req.body.repo); }
  res.send(400);
};

exports.user = function(req, res) {
  api.withUser(req, req.params.username, function(user) {
    if (user) {
      user.repos = sortByKey(user.repos, 'commits', true);
    }
    res.render('user', {username: req.params.username, user: user});
  });
};

exports.repo = function(req, res) {
  repoName = req.params[0];
  api.withRepoByName(req, repoName, function(repo) {
    if (repo) {
      repo.users = sortByKey(repo.users, 'commits', true);
    }
    res.render('repo', {repoName: repoName, repo: repo});
  });
};

exports.enter = function(req, res) {
  res.render('enter', {navKey: 'enter'});
};

exports.faq = function(req, res) {
  res.render('faq', {navKey: 'faq'});
};

exports.donate = function(req, res) {
  api.withBitcoinInfo(req, function(total, balance) {
    res.render('donate', {navKey: 'donate', total: total});
  });
}
