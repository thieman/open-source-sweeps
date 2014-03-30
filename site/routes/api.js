var request = require('request');
var cache = require('memory-cache');
var db = require('monk')((process.env.OSSWEEPS_MONGO_HOST || 'localhost:27017') + '/data');

var balanceCacheTimeMs = 1000 * 60 * 5;

function withBitcoinInfo(req, cb) {
  var total = cache.get('bitcoinTotal');
  var balance = cache.get('bitcoinBalance');
  if (balance) { return cb(total, balance); }

  if (cache.get('fetchingBitcoinBalance')) {
    setTimeout(function() { withBitcoinBalance(cb); }, 250);
  };

  responseCb = function(err, res, body) {
    if (!err && res.statusCode === 200) {
      var total = body.total_received / 100000000;
      var balance = body.final_balance / 100000000;
      cache.put('bitcoinTotal', total, balanceCacheTimeMs);
      cache.put('bitcoinBalance', balance, balanceCacheTimeMs);
      cache.put('lastKnownBitcoinBalance', balance);
      cb(total, balance);
    } else {
      cache.put('bitcoinBalance', cache.get('lastKnownBalance'), balanceCacheTimeMs);
      cb(cache.get('bitcoinBalance'));
    }
  };

  cache.put('fetchingBitcoinBalance', true, 1000);
  request({url: "https://blockchain.info/address/" + req.app.get('bitcoinAddress') + "?format=json",
           json: true},
          responseCb);
};

function withCurrentDrawing(req, cb) {
  db.get('drawing').find({}, {sort: {_id: -1}, limit: 1}, function(err, docs) {
    if ((!err) && docs.length > 0) { cb(docs[0]); }
    else { cb(null); }
  });
};

function withUser(req, username, cb) {
  db.get('user').findOne({_id: username}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

function withRepoById(req, repoId, cb) {
  db.get('repo').findOne({_id: repoId}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

function withRepoByName(req, repoName, cb) {
  db.get('repo').findOne({name: repoName}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

module.exports = {
  withBitcoinInfo: withBitcoinInfo,
  withCurrentDrawing: withCurrentDrawing,
  withUser: withUser,
  withRepoById: withRepoById,
  withRepoByName: withRepoByName
};
