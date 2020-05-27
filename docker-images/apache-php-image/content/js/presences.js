$(function() {
	console.log("Loading presences");

	function loadPresences() {
		$.getJSON("/api/presences/", function(presences) {
			console.log(presences);
			var message = "Hobody was present...";
			if (presences.length > 0) {
				
				//Recuperation des headers du json
				var col = [];
				
				for(var i = 0; i < presences.length; i++){
					for (var key in presences[i]) {
						if(col.indexOf(key) === -1) {
							col.push(key);
						}
					}
				}

				//Creation du tableau
				var table = document.createElement("table");
				var tr = table.insertRow(-1);

				for (var i = 0; i < col.length; i++) {
					var th = document.createElement("th");
					th.innerHTML = col[i];
					tr.appendChild(th);
				}

				for (var i = 0; i < presences.length; i++){
					tr = table.insertRow(-1);

					for(var j = 0; j < col.length; j++) {
						var cell = tr.insertCell(-1);
						
						//Creation d'une liste de presences à insérer dans une cellule du tableau
						if(j == 4){
							var list = $('<ul/>').appendTo(cell);
							for(var k = 0; k < presences[i][col[j]].length; k++){
								var li = $('<li/>').appendTo(list).html((presences[i][col[j]])[k]['date'] + ' : ' + (presences[i][col[j]])[k]['eventLocation']);
							}		
						}
						else{
							cell.innerHTML = presences[i][col[j]];
						}
					}
				}

				message = table;
			
			}
			// Supprimer l'ancien tableau et afficher le nouveau contenu
			$(".presences").empty();	
			$(".presences").append(message);
		});
	};

	loadPresences();
	//lancement de la fonction à intervalle régulier
	setInterval(loadPresences, 5000);
});
