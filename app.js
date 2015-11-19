var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var teams = require('./routes/teams');
var records = require('./routes/records');
var chating = require('./routes/chating');

var db = require('./db.js');

var multer = require('multer');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  path: '/',
  secret: 'showonne',
  resave: false,
  saveUninitialized: true,
  maxAge: 30 * 60 * 1000
}));

app.use(multer({
  dest: './public/upload'
}));

app.use('/', routes);
app.use('/record', records);
app.use('/team', teams);
app.use('/chating', chating);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);


server.listen(80, function(){
  console.log('server is listening on port 80');
});

var socketArr = {};

io.on('connection', function(socket){
  socket.on('join', function(data){
    socket.join(data.teamid);
    socketArr[data.accountid] = socket; //将socket加入socketArr
  });
  //接收前端发送过来的消息
  socket.on('sendMsg', function(data){
    if(data.to == 'all'){
      var team = data.teamid;
      io.sockets.in(data.teamid).emit('replyMsg', data);
    }else{
      console.log(data.to);
      if(socketArr[data.to]){
        socketArr[data.to].emit('replyPriMsg', data);
      }else{
        ;
      }
    }
  });

  socket.on('disconnect', function(){
    console.log("a user leaved...");
  });
});


