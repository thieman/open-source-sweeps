var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/views');

var app = express();

// view engine setup
app.set('port', process.env.OSSWEEPS_PORT || 3000)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('bitcoinAddress', process.env.BITCOIN_ADDRESS || "1NaRps3JEUu1BXo2RzCgmEx9rxCNRNcxUp")

app.locals.app = app;
app.locals.sprintf = require('sprintf-js').sprintf;
app.locals.intFormat = function(val) {
  var parts = parseInt(val).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
}

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.post('/lookup', routes.lookup);
app.get('/user/:username', routes.user);
app.get(/repo\/(.*)/, routes.repo);
app.get('/enter', routes.enter);
app.get('/faq', routes.faq);
app.get('/donate', routes.donate);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("OSS web server listening on port " + app.get('port'));
});

module.exports = app;
