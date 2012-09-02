var users = require('./models/users');
var md5 = require('./lib/utils').md5;

exports.createDefaultUser = function(callback){

	users.find(function(err, users){
		if(err){
			console.log(err);
			return;
		}
		if(users.length > 0 ){
			return;
		}
	});
	console.log('---');
	for(var i = 1, j = 41; i <= j; i++){
		var name = '30807031';
		if(i < 10){
			name = name + '0'+i;
		}else {
			name = name + i;
		}
		var pass = '123456';
		pass = md5(name+pass+name);
		var data = {'name':name, 'pass':pass};
		users.insert(data, function(err, next){
			if(err){
				console.log(err);
			}
		});
	}
	callback();
};