/**
 * Module dependencies.
 */

var util = require('util');
var contactsModel = require('../models/contacts');
var usersModel = require('../models/users');
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
  var p = /^0{0,1}(13[0-9]|15[0-9]|18[0-9])[0-9]{8}$/;
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
  app.get('/download', download);
  app.post('/create.do', handleCreate);
  app.get('/update', updatePage);
  app.post('/update.do', handleUpdate);
  app.post('/delete.do', handleDelete);
  app.get('/set',setpage);
  app.post('/user/hidden.do', handleHidden);
  app.post('/user/resetpass.do', handleResetpass);
};

var download = function(req, res){
  return res.render("download",{});
}

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
  return res.render("login", {message: '如果你是第一次登录，登录后请及时更改!'});
};

var createPage = function (req, res) {
  return res.render("create", { });
};

var setpage = function(req, res){
  var user = req.session.user;
  contactsModel.findOne(user.name, function(err, result){
    if(err){
      return res.render("error", {message:'数据库出错'});
    }
    if(!result){
      return res.render("set",{data:{'id': user.name} ,message:'您还没有添加电话号码到通讯录'});
    }
    return res.render("set",{data : result});
  });
}

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
  if (!query.name || !query.pass) {
    return res.render("error", { message: '请完整填写答案' });
  }
  var name = query.name.trim();
  var pass = query.pass.trim();

  if(!isId(name)){
        return res.render("error", { message: '非法的用户名' });
  }
  pass = utils.md5(name + pass + name);
  var defPass = utils.md5(name+'123456'+name);
  usersModel.findOne(name, function(err, result){
    if(err){
      return res.render("error", { message: '数据库错误!' });
    }
    if(!result || result.name.length <= 0 || result.pass.length <= 0){
      return res.render("error", { message: '没有该用户!' });
    }
    if( pass != result.pass){
      return res.render("error",{message:'密码错误请重新输入'});
    }
    // if(pass === defPass){

    // }
    var autoLogin = query.remeber || '';
    if (autoLogin) {
      var timeOut = config.session_timeout;
      req.session.cookie.expires = new Date(Date.now() + timeOut);
      req.session.cookie.maxAge = timeOut;
    } else {
      req.session.cookie.expires = false;
    }
    req.session.user = {'name':name};
    return utils.redirect(res, '/', 302);
  });
};


var handleResetpass = function(req, res){
  var response = { 'stat': statCode['UNKNOWN'] };
  var old_pass = req.body.old_pass.trim() || '';
  var new_pass = req.body.new_pass.trim() || '';
  var re_new_pass = req.body.re_new_pass.trim() || '';
  var user = req.session.user;
  var name = user.name;
  if(!old_pass || !new_pass || !re_new_pass){
    response.stat  = statCode['ILLEGAL_PARAMETER'];
    return utils.sendJSON(res, 200, response);
  }
  if(new_pass !== re_new_pass){
    console.log(new_pass === re_new_pass);
    response.stat = statCode['CONFIRM_PASS_ERR'];
    return utils.sendJSON(res, 200, response);
  }
  old_pass = utils.md5(name+old_pass+name);
  new_pass = utils.md5(name+new_pass+name);
  usersModel.findOne(name, function(err, result){
    if(err){
      console.log(err);
      response.stat = statCode['DATABASE_ERR'];
      return utils.sendJSON(res, 500, response);
    }
    if(old_pass != result.pass){
      response.stat = statCode['OLD_PASS_ERR'];
      return utils.sendJSON(res, 200, response);
    }
    var data = {'pass':new_pass};
    usersModel.update(name, data, function(err){
      if(err){
        console.log(err);
        response.stat = statCode['DATABASE_ERR'];
        return utils.sendJSON(res, 500, response);
      }
      response.stat = statCode['SUCCEED'];
      return utils.sendJSON(res, 200, response);
    })
  });
}

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
    var arr = tel;
    for(var t in tel){
      if(tel[t]){
        if(!isPhone(tel[t])){
          return res.render("error",{ message: "非法手机号"});
        }
        arr = arr.slice(t+1);
        if (arr.indexOf(tel[t]) >= 0) {
          return res.render("error", {message : "手机号码重复"});
        }
        _tel.push([tel[t],utils.formatDate(Date.now())]);
      }
    }
  }
  var data = {'name': name, 'id': id, 'tel': _tel, 'weibo': weibo, 'location': location,'hidden' : false};
  contactsModel.insert(data, function (err, result) {
    if (err) {
      console.log(err);
      return res.render("error", { message: '数据库出错' });
    }
    return utils.redirect(res, '/', 302);
  });
};

var handleHidden = function(req, res){
  var hidden = req.body.hidden;
  var user = req.session.user;
  if (!user.name) {
      return utils.redirect(res, '/',302);
  }
  if(typeof hidden === "string"){
    if(hidden === "true") hidden = true;
    if(hidden === "false") hidden = false;
  }
  var data = { 'hidden' : hidden};
  contactsModel.update(user.name, data,function(err){
    if(err){
      console.log(err);
      return res.render("error",{message: '数据库出错！'});
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
    var arr = tel;
    for(var t in tel){
      if(tel[t]){
        if(!isPhone(tel[t])){
          return res.render("error",{ message: "非法手机号"});
        }
        arr = arr.slice(t+1);
        if (arr.indexOf(tel[t]) >= 0) {
          return res.render("error", {message : "手机号码重复"});
        }
        data.tel.push([tel[t],utils.formatDate(Date.now())]);
      }
    }
  }
  // var data = {'name': name, 'tel': tel, 'weibo': weibo, 'location': location};
  contactsModel.findOne(id, function(err, result){
    if(err){
      console.log(err);
      return res.render("error", {message:'数据库出错！'});
    }
    if(!result){
      handleCreate(req, res);
    }
      contactsModel.update(id, data, function (err) {
      if (err) {
        console.log(err);
        return res.render("error", { message: '数据库出错' });
      }
      return utils.redirect(res, '/', 302);
    });
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