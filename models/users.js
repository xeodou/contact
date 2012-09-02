var mongo = require('../config').mongo;
var client = require('mongoskin');
var db = client.db(mongo.url);
var users = db.collection(mongo.collections.users);
users.ensureIndex({'name':1}, {'unique':true}, function(){});
var user = {
	'name':'',
	'pass':'123456',
};
exports.user = user;

exports.insert = function(data, next){
	users.insert(data, next);
};

exports.find = function(next){
	users.find({},{_id:0}).sort({'name': 'asc'}).toArray(next);
};

exports.findOne = function(name, next){
	users.findOne({'name':name},{_id : 0}, next);
};

exports.update = function(name, data, next){
	users.update({'name':name},{$set: data}, next);
};

exports.remove = function(name, next){
	users.remove({'name':name}, next);
};