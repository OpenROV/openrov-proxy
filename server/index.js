/**
 * Created by roboto on 4/06/14.
 */
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var request = require('request');

var app = express();
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../../')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.post('/proxy', function(req, resp) {
  var options = req.body;
  console.log(options.url);
  resp.status(200);
  resp.send();
});

module.exports = app;

