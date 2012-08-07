/**
 * Module dependencies.
 */

var util = require('util');
var contactsModel = require('../models/contacts');
var utils = require('../lib/utils');
var config = require('../config');
var auth = require('../auth');
var statCode = config.statCode;

var Q = 0;
var A = 1;

var isName = function (name) {
  var p = /^[^x00-xff]{2,4}$/;
  if (p.exec(name)) return true;
  return false;
};

var isId = function (id) {
  var p = /^[1-3][0-9]{9}$/;
  if (p.exec(id)) return true;
  return false;
};
var isPhone = function(phone){
  var p = /^0{0,1}(13[0-9]|15[0-9])[0-9]{8}$/;
  if (p.exec(phone)) return true;
  return false;
};

String.prototype.trim = function () {
  return this.replace(/(^\s*)|(\s*$)/g, "");
};

exports = module.exports = function(app) {
  app.get('/', listPage);
  app.get('/login', loginPage);
  app.post('/login.do', handleLogin);
  app.get('/logout', handleLogout);
  app.get('/create', createPage);
  app.post('/create.do', handleCreate);
  app.get('/update', updatePage);
  app.post('/update.do', handleUpdate);
  app.post('/delete.do', handleDelete);
};

var listPage = function (req, res) {
  contactsModel.find(function (err, contacts) {
    if (err) {
      console.log(err);
      return res.render("error", { message: '数据库出错' });
    }
    return res.render("home", { contacts: contacts });
  });
};

var loginPage = function (req, res) {
  return res.render("login", { q: auth });
};

var createPage = function (req, res) {
  return res.render("create", { });
};

var updatePage = function (req, res) {
  var id = req.query.id || '';

  if (!id || !isId(id)) {
    return res.render("error", { message: '参数错误' });
  }

  contactsModel.findOne(id, function (err, result) {
    if (err) {
      console.log(err);
      return res.render("error", { message: '数据库出错' });
    }
    if (!result) {
      return res.render("error", { message: '没有这个人' });
    }
    return res.render('update', { data: result });
  });
};

var handleLogin = function (req, res) {
  var query = req.body;
  if (!query.a) {
    return res.render("error", { message: '请完整填写答案' });
  }
  var ans = query.a;
  for (var i = 0, l = auth.length; i < l; i++) {
    if (!ans[i]) {
      return res.render("error", { message: '请完整填写答案' });
    }
    ans[i] = ans[i].trim();
    var right = auth[i][A];
    if (util.isArray(right)) {
      var h = false;
      for (var j = 0, s = right.length; j < s; j++) {
        if (ans[i] === right[j]) {
          h = true;
          break;
        }
      }
      if (!h) {
        return res.render("error", { message: '第 ' + (i + 1) + ' 题答错' });
      }
    } else {
      if (ans[i] !== right) {
        return res.render("error", { message: '第 ' + (i + 1) + ' 题答错' });
      }
    }
  }
  var autoLogin = query.remeber || '';

  if (autoLogin) {
    var timeOut = config.session_timeout;
    req.session.cookie.expires = new Date(Date.now() + timeOut);
    req.session.cookie.maxAge = timeOut;
  } else {
    req.session.cookie.expires = false;
  }
  req.session.user = 'user';
  return utils.redirect(res, '/', 302);
};

var handleLogout = function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      return res.render("error", {layout: 'layout', message: '出错'});
    }
    return utils.redirect(res, '/login', 302);
  });
}

var handleCreate = function (req, res) {
  var name = req.body.name || '';
  var id = req.body.id || '';
  var tel = req.body.tel || '';
  var weibo = req.body.weibo || '';
  var location = req.body.location || '';
  if (!name || !isName(name)) {
    return res.render("error", { message: '没填名字或名字不合法' });
  }
  if (!id || !isId(id)) {
    return res.render("error", { message: '没填学号或学号不合法' });
  }
  if (!tel) {
    return res.render("error", { message: '没填电话号码' });
  }

  var _tel = [];
  if (typeof tel === 'string') {
    if(!isPhone(tel)){
      return res.render("error",{ message: "非法手机号"});
    }
    _tel.push([tel,utils.formatDate(Date.now())]);
  } else if (typeof tel === 'object'){
    for(var t in tel){
      if(tel[t]){
        if(!isPhone(tel[t])){
          return res.render("error",{ message: "非法手机号"});
        }
        _tel.push([tel[t],utils.formatDate(Date.now())]);
      }
    }
  }
  var data = {'name': name, 'id': id, 'tel': _tel, 'weibo': weibo, 'location': location};
  contactsModel.insert(data, function (err, result) {
    if (err) {
      console.log(err);
      return res.render("error", { message: '数据库出错' });
    }
    return utils.redirect(res, '/', 302);
  });
};

var handleUpdate = function (req, res) {
  var name = req.body.name || '';
  var id = req.body.id || '';
  var tel = req.body.tel || '';
  var weibo = req.body.weibo || '';
  var location = req.body.location || '';

  if (!name || !isName(name)) {
    return res.render("error", { message: '没填名字或名字不合法' });
  }
  if (!id || !isId(id)) {
    return res.render("error", { message: '没填学号或学号不合法' });
  }
  if (!tel) {
    return res.render("error", { message: '没填电话号码' });
  }
  var data = contactsModel.contact;
  data.id = id;
  data.name = name;
  data.weibo = weibo;
  data.location = location;
  data.tel = [];
  if (typeof tel === 'string') {
    if(!isPhone(tel)){
      return res.render("error",{ message: "非法手机号"});
    }
    data.tel.push([tel,utils.formatDate(Date.now())]);
  } else if (typeof tel === 'object'){
    for(var t in tel){
      if(tel[t]){
        if(!isPhone(tel)){
          return res.render("error",{ message: "非法手机号"});
        }
        data.tel.push([tel[t],utils.formatDate(Date.now())]);
      }
    }
  }
  // var data = {'name': name, 'tel': tel, 'weibo': weibo, 'location': location};
  contactsModel.update(id, data, function (err) {
    if (err) {
      console.log(err);
      return res.render("error", { message: '数据库出错' });
    }
    return utils.redirect(res, '/', 302);
  });
};

var handleDelete = function (req, res) {
  var response = {'stat': statCode['UNKNOWN']};
  var id = req.body.id || '';

  if (!id || !isId(id)) {
    response.stat = statCode['ILLEGAL_PARAMETER'];
    return utils.sendJSON(res, 200, response);
  }

  contactsModel.remove(id, function (err) {
    if (err) {
      console.log(err);
      response.stat = statCode['DATABASE_ERR'];
      return utils.sendJSON(res, 500, response);
    }
    response.stat = statCode['SUCCEED'];
    return utils.sendJSON(res, 200, response);
  });
};

exports.isLogin = function() {
  return function(req, res, next) {
    if (!req.session || !req.session.user) {
      if (req.url.indexOf('/login') !== -1) {
        return next();
      }
      return utils.redirect(res, '/login', 302);
    } else {
      if (req.url.indexOf('/login') !== -1) {
        return utils.redirect(res, '/', 302);
      }
      return next();
    }
  };
};