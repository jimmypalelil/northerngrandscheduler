var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const employeeRouter = require('./routes/employee');
const scheduleRouter = require('./routes/schedule');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});



// view engine setup
app.set('views', path.join(__dirname, 'dist/NghScheduler'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/employee', employeeRouter);
app.use('/schedule', scheduleRouter);

// Redirect all the other resquests
app.get('*', (req, res) => {
  if (req.url.length > 0) {
    res.sendFile(path.resolve(`dist/NghScheduler/${req.url}`));
  } else {
    res.sendFile(path.resolve('dist/NghScheduler/index.html'));
  }
});

module.exports = app;
