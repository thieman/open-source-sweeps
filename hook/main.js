var express = require('express');
var app = express();
app.use(express.bodyParser());

app.post('/', function(req, res) {
  console.log(req.body);
});

var server = app.listen(7777, function() {
  console.log('Hook server started on port %d', server.address().port);
});
