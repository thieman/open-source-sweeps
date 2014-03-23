var request = require('request');
var cache = require('memory-cache');

var bitcoinAddress = process.env.BITCOIN_ADDRESS;
var balanceCacheTimeMs = 1000 * 60 * 5;

function withBitcoinBalance(cb) {
  var balance = cache.get('bitcoinBalance');
  if (balance) { cb(balance); }

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

exports.index = function(req, res) {
  withBitcoinBalance(function(balance) {
    res.render('home', { title: 'Express', balance: balance});
  });
};

exports.user = function(req, res) {
};

exports.repo = function(req, res) {
};
