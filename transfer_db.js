var contactsModel = require('./models/contacts');
var util = require('util');


exports.transf = function(){
	var contact = contactsModel.contact;
	contactsModel.find(function(err, result){
		if (err) {
			console.log(err);
			return;
		}
		transfer(result, function(){
			console.log('transfer db complete');
		});
	});	
};
var  transfer = function(contacts,callback){

	for(var c in contacts){
		if (!util.isArray(contacts[c].tel)) {
			console.log(contacts[c]);
			contact.id = contacts[c].id;
			contact.name = contacts[c].name;
			contact.weibo = contacts[c].weibo;
			contact.location = contacts[c].location;
			var pattern = /[^\d+$]/g;
			var tel = contacts[c].tel.replace(pattern, '');
			var tel_ = tel.substring(0, 11);
			var tel__ = tel.substring(11, tel.lenght);
			contact.tel.push([tel_, '']);
			if (tel__) {
				contact.tel.push([tel__, '']);
			}
			contactsModel.update(contacts[c].id, contact, function(err){
				if (err) {
					console.log(err);
					return;
				}
			});
		}
	}
	callback();
}