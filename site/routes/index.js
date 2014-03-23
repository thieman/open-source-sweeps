var api = require('./api');

var potPercentage = (process.env.POT_PERCENTAGE || 0.5);

exports.index = function(req, res) {
  api.withBitcoinBalance(function(balance) {
    api.withCurrentDrawing(function(drawing) {
      res.render('home', { title: 'Express', pot: balance * potPercentage, drawing: drawing});
    });
  });
};

exports.user = function(req, res) {
};

exports.repo = function(req, res) {
};
