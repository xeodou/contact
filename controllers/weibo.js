var weiboapi = require('weiboapi');
var config = require('../config');
var msgModel = require('../models/message');
var issend = 0;

function sendMsg(callback){
  //   weiboapi.update(config.weibo.cookies,{uid:'3038788181', status:'test'}, function(err, result){
  //     if(err)
  //       console.log(err);
  //     console.log(result);
  // });
    msgModel.find({status : 0 }, function(err, message){
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      if(message.length === 0){
        issend = -1;
        return callback(null, message);        
      }
      issend = 1;
      var query = {nick : message[0].nick,content:message[0].content};
      send(query, function(err, result){
        if(err){
          console.log(err);
          msgModel.update({signature: message[0].signature}, {signature : (new Date()).valueOf()}, function(err, result){
            if(err)
              console.log(err);
              return sendMsg(callback);
          });
        }
        msgModel.update({signature: message[0].signature}, {status : 1}, function(err, result){
          if(err){
            console.log(err);
          }
          sendMsg(callback);
        });
      });
    });
} 

function send(query, callback){
    weiboapi.msgSend(config.weibo.cookies, query, callback);
}

exports.addmsg = function(nick, content, callback){
  if(issend >= 0){
      var msg = {nick : nick, content: content, signature: (new Date().valueOf())+'', status: 0};
      msgModel.insert(msg, function(err, result){
        if(err){
          console.log(err);
          return callback(err);
        }
        if(issend === 0)
          sendMsg(callback);
          return callback(null, result);
      });
  } else {
      var query = {nick: nick, content : content};
      weiboapi.msgSend(config.weibo.cookies, query, function(err, result){
        if(err){
          console.log(err);
          var msg = {nick : nick, content: content, signature: (new Date().valueOf())+'', status: 0};
          msgModel.insert(msg, function(err, result){
            if(err){
              console.log(err);
              return callback(err);
            }
            return callback(null, result);
          });
        }
        return callback(null, result);
      });
  }
}

