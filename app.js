// app.js
var connect = require('connect');
var ejs = require('ejs');
var config = require('./config');
var render = require('./lib/render');

var app = connect();

// Controllers
var homeCtrl = require('./controllers/home');

// Middleware
app.use(connect.static(__dirname + '/public', {maxAge: 3600000 * 24 * 365}));
app.use(connect.cookieParser());
app.use(connect.session({
  secret: config.session_secret,
}));
app.use(connect.query());
app.use(connect.bodyParser());
app.use(connect.csrf());
app.use(render({
  root: __dirname + '/views',
  layout: 'layout.html',
  cache: !config.debug,
  csrf: true,
  helpers:{
    config: config,
  }
}));

app.use('/', homeCtrl.isLogin());

// Business Logics
app.use('/', connect.router(homeCtrl));

module.exports = app;