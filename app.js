const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const os = require('os');
const cpuCount = os.cpus().length;
process.env.UV_THREADPOOL_SIZE = cpuCount * 4;
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = {
  origin: process.env.ALLOW_ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,POST",
}

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
