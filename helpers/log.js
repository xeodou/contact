var fs = require('fs');
var path = require('path');
var Log = require('log');
var config = require('../config');

var logger;
if (!config.logdir) {
  throw Error("Error log file must be set.");
}
var logPath = path.join(config.logdir, "crawler.log");
var dirname = path.dirname(logPath);
if (!path.existsSync(dirname)) {
  fs.mkdirSync(dirname);
}
logger = new Log('notice', fs.createWriteStream(logPath, { flags: 'a' }));
var getMessage = function (action, err, params, url) {
  var message = "";
  if (action) {
    message += action + ".\n";
  }
  if (err.message) {
    var errorMsg = err.message;
    if (typeof err.message === 'object') {
      try {
        errorMsg = JSON.stringify(err.message);
      } catch(ex) {}
    }
    message += "MESSAGE: \n" + errorMsg + ".\n";
  } else if (typeof err === "string") {
    message += "MESSAGE: \n" + err + ".\n";
  }
  if (url) {
    message += "URL: \n" + url + ".\n";
  }
  if (params) {
    if (typeof params === "object") {
      try {
        params = JSON.stringify(params);
      } catch(ex) {}
    }
    message += "PARAMETERS: \n" + params + ".\n";
  }
  if (err.stack) {
    message += "ERROR STACK: \n";
    message += err.stack;
  }
  return message + "\n";
};
exports.getMessage = getMessage;

var _log = function (method, action, err, params, url) {
  logger[method](getMessage(action, err, params, url));
};

exports.emergency = function (action, err, params, url) {
  _log("emergency", action, err, params, url);
};
exports.alert = function (action, err, params, url) {
  _log("alert", action, err, params, url);
};

exports.critical = function (action, err, params, url) {
  _log("critical", action, err, params, url);
};

exports.error = function (action, err, params, url) {
  _log("error", action, err, params, url);
};

exports.warning = function (action, err, params, url) {
  _log("warning", action, err, params, url);
};

exports.notice = function (action, err, params, url) {
  _log("notice", action, err, params, url);
};

exports.info = function (action, err, params, url) {
  _log("info", action, err, params, url);
};
exports.debug = function (action, err, params, url) {
  _log("debug", action, err, params, url);
};