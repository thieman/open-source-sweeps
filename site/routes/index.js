var api = require('./api');

exports.index = function(req, res) {
  api.withBitcoinBalance(function(balance) {
    api.withCurrentDrawing(function(drawing) {
      res.render('home', { title: 'Express', balance: balance, drawing: drawing});
    });
  });
};

exports.user = function(req, res) {
};

exports.repo = function(req, res) {
};
