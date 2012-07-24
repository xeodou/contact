var contactsModel = require('./models/contacts');
var contacts = contactsModel.find(function(err, contacts){
	if (err) {
		console.log(err);
		return;
	}
});
var contact = contactsModel.contact;
var transfer = function(contact,callback){
	for(var c in contacts){
		contact.id = c.id;
		contact.name = c.name;
		contact.weibo = c.weibo;
		contact.location = c.location;
		var pattern = /[^\d+$]/g;
		var tel = c.tel.replace(pattern, '');
		var tel_ = tel.substring(0, 11);
		var tel__ = tel.substring(11, tel.lenght);
		contact.tel.push([tel_, '']);
		if (tel__) {
			contact.tel.push([tel__, '']);
		}
		contactsModel.insert(contact, function(err, result){
			if (err) {
				console.log(err);
				return;
			}
			contactsModel.remove(c.id, function(err){
				if (err) {
					console.log(err);
					return;
				}
			});
		});
	}
	callback();
}
