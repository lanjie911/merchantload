//npm install axios
//npm install express
//npm install express-session
//npm install express-session memorystore
//npm install multer
//npm install body-parser
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 定义JSON参数处理
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
// for parsing multipart/form-data
var upload = multer(); 


// 定义session
var session = require('express-session');
var MemoryStore = require('memorystore')(session);

// 定义日志滚动输出
var fs = require('fs')
var FileStreamRotator = require('file-stream-rotator')
var logDirectory = __dirname + '/logs'

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
})

// 这里我们规定了两个路由
// 在实际中，如果有多个路由，在这里定义
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 预定义五种日志格式，选择最复杂的
// combined common dev short tiny
app.use(logger('combined'));
// 记得上产线的时候把下面的代码打开
app.use(logger('combined', { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// 定义session管理器，这个管理器一定要放到所有的路由设定之前
app.use(session({
  cookie: { maxAge: 3000000 },
  store: new MemoryStore({
    checkPeriod: 3000000 // prune expired entries every 24h
  }),
  secret: 'apaydayloadpl',
  saveUninitialized: false,
  resave: false
}));

// 路由的映射根路径
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
