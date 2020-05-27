# Laboratoire infrastructure HTTP

## Etape 1: Serveur HTTP statique avec Apache httpd

Après avoir forké le repo du laboratoire, nous allons créer un container Docker à partir de l'image php sur docker.hub et contenant un serveur httpd fonctionnel. 

### Build de l'image, run du container et test d'accès depuis un browser
Nous allons d'abord créer la structure du contenu statique que nous voulons afficher sur notre serveur. Pour celà nous allons choisir un template bootstrap déniché sur internet et customisé pour présenter le cours RES. Nous allons placer ce contenu dans un dossier content.

Nous allons ensuite créer un Dockerfile dans le même dossier que le dossier content et allons y spécifier le contenu suivant. Nous utiliserons une image Docker contenant PHP couplé à un serveur Apache.

```
#On récupère l'image sur dockerhub
FROM php:7.2-apache
#Copie du contenu du dossier content (filesystem local) dans le répertoire du serveur web de l'image
COPY /content/ /var/www/html/
```

Génération de l'image avec la commande en étant dans le répertoire du Dockerfile.
```
docker build --tag php_httpd .
```

Lancement d'un container avec l'image créée et écoutant sur le port 8080. On a du port forwarding du port 8080 de l'hôte sur le port 80 du container.

```
docker run -d -p 8080:80 php_httpd
```

On peut ensuite y accéder en tappant 192.168.99.100:8080 dans le navigateur. L'adresse ip est celle-ci car j'utilise Docker Toolbox sur mon pc pour l'utiliser conjointement avec mes machines virtuelles. L'IP d'accès peut ainsi varier selon la configuration du poste.

### Fichier de configuration Apache

Les fichiers de configurations sont accessible dans le répertoire /etc/apache2 et on s'intéresse pour le moment plus spécifiquement aux fichiers apache2.conf et /sites-available/000-default.conf.

Le premier est le point central de toute la configuration du serveur Apache. En effet, la configuration est scindée en plusieurs fichiers de configuration. Ce fichier fait le lien entre eux.

Le 2ème contient les configuration propres aux hôtes virtuels et aux chemin d'accès aux racines des différents sites ainsi qu'aux ports qui leurs sont attribués.


## Etape 2: Serveur HTTP dynamique avec express.js
Dans cette partie, nous allons écrire une application Node.js et apprendre à utiliser Postman pour tester notre application.

### Récupération de l'image et Dockerfile
Nous allons utiliser l'image node:12.16.3 qui est la dernière version stable et est disponible sur hub.docker.

Le Dockerfile se décline comme ceci.
```
FROM node:12.16.3
COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
```

### Initialisation de l'application NodeJS

Dans le répertoire src que nous allons copier dans notre container, nous allons lancer la commande suivante pour initialiser l'application. Mais avant celÃ , il nous faut installer NodeJS sur notre machine en téléchargeant l'installer sur le [site de NodeJS](https://nodejs.org/en/download/).
```
npm init
```

Cette commande va générer un fichier package.json qui contient les informations propres Ã  notre application.

La commande suivante va ajouter la dépendance chance.js pour la génération de contenu aléatoire dans le package.json.

```
npm install --save chance
```

La suite de commandes précédentes génère le package.json suivant.

```
{
  "name": "presences",
  "version": "0.1.0",
  "description": "Une application de gestion des presences",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Julien Brunisholz",
  "license": "ISC",
  "dependencies": {
    "chance": "^1.1.4"
  }
}

```

On fait un build de l'image et on lance un container, ceci va avoir pour effet d'afficher un nom aléatoire dans notre console. Notre container s'arrÃªte dès la fin du script du coup pas moyen pour le moment de l'accéder depuis un navigateur par exemple.

### Implementation d'un serveur HTTP en NodeJS

#### Installation du framework Express.js et test de fonctionnement

On lance la commande suivante pour installer le framework dans notre répertoire src.

```
npm install --save express
```

Le répertoire node_modules contient les dépendances des différents packages installés, en général, on défini ce dossier dans le fichier .gitignore car il est volumineux.

On insère ensuite le code suivant dans notre index.js.

```Node.js
var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req, res) {
        res.send("Hello RES");
});

app.listen(3000, function () {
        console.log('Accepting HTTP requests on port 3000!');
});
```

On va donc écouter sur le port 3000 avec notre application et dès qu'une requÃªte HTTP (GET) venant d'un client est reÃ§ue avec comme contenu '/', on retourne un message.

Pour lancer notre application en local
```
node index.js
```

Pour se connecter en telnet à notre application
```
>telnet localhost 3000
>GET / HTTP/1.0
```

#### Création d'une première petite application en NodeJs

Pour se familiariser avec NodeJs, le framework Express.js et l'outil chance.js, nous avons modifier l'index.js pour qu'il renvoie une liste au format json de membres avec une liste de présences.

```Node.js
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

        //Un membre a un nom, un prénom, un sexe et une date de naissance et un tableau //de présences
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
```

## Step 3: Reverse proxy with apache (static configuration)
Cette partie a pour but la mise en place d'un reverse proxy, c'est à dire un point central d'accès à notre infrastructure web. Ce reverse proxy va en effet recevoir les différentes requêtes adressées à notre infrastructure et les dispatcher vers la bonne destination interne.

### Démarrage des container et tests de fonctionnement
Nous allons ici démarrer des container à partir des images créées dans les deux étapes précédentes.

`
>docker run -d --name apache_static php_httpd
>docker run -d --name express_dynamic express_presences

`

Ensuite, grâce à la commande docker inspect pour chaque container, on trouve (dans NetworkSettings/IPAddress) l'adresse IP donnée au container.

* 172.17.0.2 pour apache_static
* 172.17.0.2 pour express_dynamic

Utilisant powershell sous windows comme interface de ligne de commande, cette commande correspond à un grep -i en bash
`Powershell
>docker inspect apache_static | Select-String -Pattern IPAddress
`

`bash
>docker inspect apache_static | grep -i IPAddress
`
Ce qui nous donne la sortie suivante
`
"SecondaryIPAddresses": null,
"IPAddress": "172.17.0.2",
	"IPAddress": "172.17.0.2",
`

On peut ensuite tester nos container. Pour ceci, nous utilisons la commande suivante.

`
>docker-machine ssh
`
qui nous permet de nous connecter à notre machine virtuelle docker pour atteindre nos container. En effet, ceux-ci ne sont pas accessibles depuis l'extérieur du fait que nous n'avons pas fait de port forwarding.

On lance ensuite une connexion telnet à chaqun des container puis on leur envoie une requête HTTP.

`
GET / HTTP/1.0
`

### Configuration du Reverse Proxy et routage des requêtes

Dans cette configuration, les adresses ip des containers sont insérées en dur dans la configuration. Cette manière de faire n'est pas souhaitable si on souhaite obtenir une solution robuste. En effet, les adresses ip assignées aux container peuvent varier.

Notre reverse proxy va être implémenté dans un container Docker basé sur la même image que pour le contenu statique que nous avons créé auparavant. L'image php:7.2-apache.

La configuration voulue pour le reverse proxy doit nous permettre:

* d'atteindre le site statique dans le container apache_static en spécifiant la requête
`
GET / HTTP/1.0
Host: demo.res.ch
`
* d'atteindre le site dynamique (liste de présence) du container express_dynamic via la requête
`
GET /api/presences/ HTTP/1.0
`
#### configuration Dockerfile et des fichiers de configuration Apache
Nous allons créer un nouveau répertoire apache-reverse-proxy qui va contenir les fichiers nécessaires à la création de notre image personnalisée pour le reverse proxy.

Tout d'abord, un petit mot sur la structure de la configuration d'Apache.
/etc/apache2, est le répertoire contenant les fichiers de configuration du service Apache. Ses sous-dossiers importants pour notre configuration sont :

* mods-available : les modules disponibles
* mods-enabled : les modules activés via l'utilitaire a2enmod
* sites-available : les sous-sites disponibles
* sites-enabled : les sous-sites activés via l'utilitaire a2ensite

Le Dockerfile de notre image sera le suivant.

``
FROM php:7.2-apache                                                                                                                                                                                                                                                         COPY conf/ /etc/apache2                                                                                                                                                                                                                                                     RUN a2enmod proxy proxy_http                                                                                                          RUN a2ensite 000-* 001-*
``
La commande COPY va copier les fichiers de configuration Apache dans le répertoire de configuration du container à sa création. Ici il s'agit de copier le contenu du dossier sites-available (sous-dossier de conf) dans le container pour définir les 2 sites :
* 000-default.conf qui définit le virtual host par défaut. On le défini comme ça pour que le client, s'il envoie une requête sans définir l'en-tête "Host:", n'arrive pas sur la configuration statique.

RUN a2enmod ... va lancer l'utilitaire pour installer les 2 modules nécessaires pour configurer le proxy sur notre serveur.

RUN a2ensite ... va activer les deux sites que nous avons copié précédemment.

``
<VirtualHost *:80>
</VirtualHost>
``

* 001-reverse-proxy.conf qui défini les paramètres du routage vers nos deux containers.

``
<VirtualHost *:80>
        ServerName demo.res.ch

        ProxyPass "/api/presences/" "http://172.17.0.3:3000/"
        ProxyPassReverse "/api/presences/" "http://172.17.0.3:3000/"

        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
``
Dans ce fichier, on peut voir qu'on spécifie le ServerName, donc le contenu de l'en-tête Host: attendu, Proxy Pass va spécifier une réécriture de l'url. Donc quand le client envoie "/api/presences/" au reverse proxy, celui-ci va faire passer l'URL "http://172.17.0.3:3000/" et ainsi permettre d'être opaque sur la structure présente derrière lui.

A l'inverse on réécrit l'URL de base pour les réponses venant dans l'autre sens.


Nous allons ensuite générer notre image via la commande docker build sous le nom "apache-rp".
Puis nous allons lancer un container avec la commande suivante.

``
docker run -d -p 8080:80 apache-rp
``

#### Vérification du fonctionnement correct de nos routes

Si on tape l'adresse ip de la VM Docker avec le port 8080, on atteint bien une page d'interdiction d'accès. En effet, on suit le sous-site par défaut 000.

Il faut maintenant configurer le nom DNS demo.res.ch dans notre fichier hosts pour le faire correspondre à l'adresse ip de notre VM. Pour celà et sous Windows, il faut aller sous C:\Windows\System32\drivers\etc\hosts et insérer la ligne suivante dans le fichier.

``
192.168.99.100 demo.res.ch
``

## Step 4: AJAX requests with JQuery

Dans cette partie, nous allons faire en sorte que notre site accessible via demo.res.ch fasse une requête ajax pour afficher le contenu dynamique envoyer par notre server web dynamique.

Nous allons d'abord modifier le Dockerfile de notre image apache-php-image et insérer les commandes d'installation de vim.

``
FROM php:7.2-apache

RUN apt-get update && \
  apt-get install -y vim

COPY /content/ /var/www/html/
``

et effectuer à nouveau un docker build pour créer une nouvelle image. On se connecte ensuite au container interactivement avec la commande docker run -it pour vérifier que l'outil vi fonctionne bien dans le container.

On effectue la même manipulation sur les deux autres images que nous avions créé précédemment.

On va nommer nos container ainsi :

* apache_rp pour l'image apache-rp
* express_presences pour l'image express_presences
* apache_static pour l'image php_httpd

Ayant spécifier les adresses IP en dur pour nos containers, il nous faut vérifier que les même IP ont été attribuées à nos nouveaux container, sinon nous devrons modifier les IP dans la configuration de notre Reverse Proxy.


### Requête Ajax pour récupérer la liste dynamique

Grâce à JQuery, nous allons récupérer la liste retournée par /api/presences/ et l'afficher dans la page statique de notre container statique en mettant à jour les données affichées à intervalle régulier.

Notre api nous renvoie un tableau de membres ayant chacun un tableau associé avec ses présences, on veut afficher le tableau complet sur notre page statique.

Nous allons travailler dans nos container Docker directement, nous allons donc lancer un docker exec interactif sur /bin/bash pour entrer dans le container et pouvoir modifier les fichiers.

#### Appel au script et ajout d'élément DOM d'accueil dans index.html

D'abord, dans index.html de notre container apache_static, nous allons ajouter la ligne suivante pour appeler le script que nous allons créer ensuite.

``html
<script src="js/presences.js"></script>
``

Il nous faut ensuite un élément dans lequel accueillir notre contenu. Pour celà, nous allons ajouter une classe "presences" dans notre page html.

``html
<h3> Here is our presences list </h3>
<div class="presences"></div>
``

#### Création de la structure de dossier et du script presences.js

Nous allons maintenant créer un dossier js qui accueillera nos scripts et allons y créer un fichier "presences.js".

``javascript
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
``

Le style CSS a aussi été modifié pour permettre l'affichage du tableau, il est placé dans le sous-dossier assets.

Les modifications qui précèdent ont été faites sur un container docker en fonction via l'invite de commande interractive. Le fonctionnement ayant été validé, on va copier les fichiers modifier dans la structure de dossier de notre image apache_static et regénérer une nouvelle image avec la commande docker build et relancer nos container.


## Step 5: Dynamic reverse proxy configuration
