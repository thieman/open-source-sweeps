var api = require('./api');

var potPercentage = (process.env.POT_PERCENTAGE || 0.5);

exports.index = function(req, res) {
  api.withBitcoinBalance(function(balance) {
    api.withCurrentDrawing(function(drawing) {
      res.render('home', {navKey: 'home', pot: balance * potPercentage, drawing: drawing});
    });
  });
};

exports.user = function(req, res) {
};

exports.repo = function(req, res) {
};

exports.enter = function(req, res) {
  res.render('enter', {navKey: 'enter'});
};

exports.faq = function(req, res) {
  res.render('faq', {navKey: 'faq'});
};

exports.donate = function(req, res) {
  res.render('donate', {navKey: 'donate'});
}
