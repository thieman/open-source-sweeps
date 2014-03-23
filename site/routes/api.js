var request = require('request');
var cache = require('memory-cache');
var db = require('monk')((process.env.OSSWEEPS_MONGO_HOST || 'localhost:27017') + '/data');

var bitcoinAddress = process.env.BITCOIN_ADDRESS;
var balanceCacheTimeMs = 1000 * 60 * 5;

function withBitcoinBalance(cb) {
  var balance = cache.get('bitcoinBalance');
  if (balance) { cb(balance); return; }

  responseCb = function(err, res, body) {
    if (!err && res.statusCode === 200) {
      var balance = body.final_balance / 100000000;
      cache.put('bitcoinBalance', balance, balanceCacheTimeMs);
      cache.put('lastKnownBitcoinBalance', balance);
      cb(balance);
    } else {
      cache.put('bitcoinBalance', cache.get('lastKnownBalance'), balanceCacheTimeMs);
      cb(cache.get('bitcoinBalance'));
    }
  };

  request({url: "https://blockchain.info/address/" + bitcoinAddress + "?format=json",
           json: true},
          responseCb);
};

function withCurrentDrawing(cb) {
  db.get('drawing').find({}, {sort: {_id: -1}, limit: 1}, function(err, docs) {
    if ((!err) && docs.length > 0) { cb(docs[0]); }
    else { cb(null); }
  });
};

function withUser(username, cb) {
  db.get('user').findOne({_id: username}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

function withRepoById(repoId, cb) {
  db.get('repo').findOne({_id: repoId}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

function withRepoByName(repoName, cb) {
  db.get('repo').findOne({name: repoName}, function(err, doc) {
    if (!err) { cb(doc); }
    else { cb(null); }
  });
};

module.exports = {
  withBitcoinBalance: withBitcoinBalance,
  withCurrentDrawing: withCurrentDrawing,
  withUser: withUser,
  withRepoById: withRepoById,
  withRepoByName: withRepoByName
};
