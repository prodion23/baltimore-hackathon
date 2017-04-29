var express = require('express')
var app = express()
require('dotenv').config()

var api = require('./api/api');

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use('/api', api);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Example app listening on port ' + port)
})
