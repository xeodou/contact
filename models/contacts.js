var mongo = require('../config').mongo;
var client = require('mongoskin');
var db = client.db(mongo.url);
var contacts = db.collection(mongo.collections.contacts);
contacts.ensureIndex({'id': 1}, {'unique': true}, function() { });

var contact = {
	id : '',
	name :　'',
	weibo : '',
	location : '',
	tel : []
};

exports.insert = function (data, next) {
  contacts.insert(data, next);
};

exports.find = function (next) {
  contacts.find({}, {_id: 0}).sort('id', 'asc').toArray(next);
};

exports.findOne = function (id, next) {
  contacts.findOne({id: id}, {_id: 0}, next);
};

exports.update = function (id, data, next) {
  contacts.update({id: id}, {$set: data}, next);
};

exports.remove = function (id, next) {
  contacts.remove({id: id}, next);
};