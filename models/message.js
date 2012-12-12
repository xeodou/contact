var mongo = require('../config').mongo;
var client = require('mongoskin');
var db = client.db(mongo.url);
var message = db.collection(mongo.collections.message);

// var message = {
//     'nick' : '',
//     'content' : '',
//     'signature' : '',
//     'status' : 0,
// }

// exports.message = message;

exports.insert = function(data, next){
    message.insert(data, next);
}

exports.update = function(conditon, data, next){
    message.update(conditon, {$set: data}, next);
}

exports.find = function(conditon, next){
    message.find(conditon, { _id : 0 }).sort('signature', 'asc').toArray(next);
}

exports.findOne = function(data, next){

}

exports.remove = function(data, next){
    message.remove(data, next);
}