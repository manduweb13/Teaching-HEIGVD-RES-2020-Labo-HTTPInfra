var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send( generatePresencesAndMembers() );
});

app.listen(3000, function () {
	console.log('Accepting HTTP requests on port 3000!');
});

// Génère un nombre de présence aléatoires pour des membres
function generatePresencesAndMembers() {
	var numberOfPresences = bordedRandomNumber(1,4);
	var numberOfMembers = bordedRandomNumber(1,5);

	//Un membre a un nom, un prénom, un sexe et une date de naissance et un tableau 	//de présences
	var members = [];
	

	for(var i = 0; i < numberOfMembers; i++) {
		var gender = chance.gender();
		var firstName = chance.first({gender: gender});
		var lastName = chance.last({gender: gender});
		var birthDate = chance.date({string: true, american: false});

		var presences = [];;
		
		for(var j = 0; j < numberOfPresences; j++) {
			presences.push({
				date: chance.date({string: true, american:false}),
				eventLocation: chance.city()
			});
		}
	
		members.push({
				firstName: firstName,
				lastName: lastName,
				gender: gender,
				birthDate: birthDate,
				presences: presences
			});
	}

	console.log(numberOfMembers);
	console.log(numberOfPresences);
	
	return members;

}

// Retourne un nombre aléatoire entre min et max
function bordedRandomNumber(minV, maxV) {
	return chance.integer({
		min: minV,
		max: maxV
	});
}


