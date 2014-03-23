var api = require('./api');

exports.index = function(req, res) {
  api.withBitcoinBalance(function(balance) {
    res.render('home', { title: 'Express', balance: balance});
  });
};

exports.user = function(req, res) {
};

exports.repo = function(req, res) {
};
