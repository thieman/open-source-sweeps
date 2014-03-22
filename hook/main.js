var express = require('express');
var connect = require('connect');
var app = express();
app.use(connect.bodyParser());

app.post('/', function(req, res) {
  console.log(req.body);
  res.end();
});

var server = app.listen(7777, function() {
  console.log('Hook server started on port %d', server.address().port);
});
