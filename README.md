# Laboratoire infrastructure HTTP

## Etape 1: Serveur HTTP statique avec Apache httpd

Apr�s avoir fork� le repo du laboratoire, nous allons cr�er un container Docker � partir de l'image php sur docker.hub et contenant un serveur httpd fonctionnel. 

### Build de l'image, run du container et test d'acc�s depuis un browser
Nous allons d'abord cr�er la structure du contenu statique que nous voulons afficher sur notre serveur. Pour cel� nous allons choisir un template bootstrap d�nich� sur internet et customis� pour pr�senter le cours RES. Nous allons placer ce contenu dans un dossier content.

Nous allons ensuite cr�er un Dockerfile dans le m�me dossier que le dossier content et allons y sp�cifier le contenu suivant. Nous utiliserons une image Docker contenant PHP coupl� � un serveur Apache.

```
#On r�cup�re l'image sur dockerhub
FROM php:7.2-apache
#Copie du contenu du dossier content (filesystem local) dans le r�pertoire du serveur web de l'image
COPY /content/ /var/www/html/
```

G�n�ration de l'image avec la commande en �tant dans le r�pertoire du Dockerfile.
```
docker build --tag php_httpd .
```

Lancement d'un container avec l'image cr��e et �coutant sur le port 8080. On a du port forwarding du port 8080 de l'h�te sur le port 80 du container.

```
docker run -d -p 8080:80 php_httpd
```

On peut ensuite y acc�der en tappant 192.168.99.100:8080 dans le navigateur. L'adresse ip est celle-ci car j'utilise Docker Toolbox sur mon pc pour l'utiliser conjointement avec mes machines virtuelles. L'IP d'acc�s peut ainsi varier selon la configuration du poste.

### Fichier de configuration Apache

Les fichiers de configurations sont accessible dans le r�pertoire /etc/apache2 et on s'int�resse pour le moment plus sp�cifiquement aux fichiers apache2.conf et /sites-available/000-default.conf.

Le premier est le point central de toute la configuration du serveur Apache. En effet, la configuration est scind�e en plusieurs fichiers de configuration. Ce fichier fait le lien entre eux.

Le 2�me contient les configuration propres aux h�tes virtuels et aux chemin d'acc�s aux racines des diff�rents sites ainsi qu'aux ports qui leurs sont attribu�s.


## Etape 2: Serveur HTTP dynamique avec express.js
Dans cette partie, nous allons �crire une application Node.js et apprendre � utiliser Postman pour tester notre application.

### R�cup�ration de l'image et Dockerfile
Nous allons utiliser l'image node:12.16.3 qui est la derni�re version stable et est disponible sur hub.docker.

Le Dockerfile se d�cline comme ceci.
```
FROM node:12.16.3
COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
```

### Initialisation de l'application NodeJS

Dans le r�pertoire src que nous allons copier dans notre container, nous allons lancer la commande suivante pour initialiser l'application. Mais avant celà, il nous faut installer NodeJS sur notre machine en t�l�chargeant l'installer sur le [site de NodeJS](https://nodejs.org/en/download/).
```
npm init
```

Cette commande va g�n�rer un fichier package.json qui contient les informations propres à notre application.

La commande suivante va ajouter la d�pendance chance.js pour la g�n�ration de contenu al�atoire dans le package.json.

```
npm install --save chance
```

La suite de commandes pr�c�dentes g�n�re le package.json suivant.

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

On fait un build de l'image et on lance un container, ceci va avoir pour effet d'afficher un nom al�atoire dans notre console. Notre container s'arrête d�s la fin du script du coup pas moyen pour le moment de l'acc�der depuis un navigateur par exemple.

### Implementation d'un serveur HTTP en NodeJS

#### Installation du framework Express.js et test de fonctionnement

On lance la commande suivante pour installer le framework dans notre r�pertoire src.

```
npm install --save express
```

Le r�pertoire node_modules contient les d�pendances des diff�rents packages install�s, en g�n�ral, on d�fini ce dossier dans le fichier .gitignore car il est volumineux.

On ins�re ensuite le code suivant dans notre index.js.

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

On va donc �couter sur le port 3000 avec notre application et d�s qu'une requête HTTP (GET) venant d'un client est reçue avec comme contenu '/', on retourne un message.

Pour lancer notre application en local
```
node index.js
```

Pour se connecter en telnet � notre application
```
>telnet localhost 3000
>GET / HTTP/1.0
```

#### Cr�ation d'une premi�re petite application en NodeJs

Pour se familiariser avec NodeJs, le framework Express.js et l'outil chance.js, nous avons modifier l'index.js pour qu'il renvoie une liste au format json de membres avec une liste de pr�sences.

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

// G�n�re un nombre de pr�sence al�atoires pour des membres
function generatePresencesAndMembers() {
        var numberOfPresences = bordedRandomNumber(1,4);
        var numberOfMembers = bordedRandomNumber(1,5);

        //Un membre a un nom, un pr�nom, un sexe et une date de naissance et un tableau //de pr�sences
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

// Retourne un nombre al�atoire entre min et max
function bordedRandomNumber(minV, maxV) {
        return chance.integer({
                min: minV,
                max: maxV
        });
}
```

## Step 3: Reverse proxy with apache (static configuration)
Cette partie a pour but la mise en place d'un reverse proxy, c'est � dire un point central d'acc�s � notre infrastructure web. Ce reverse proxy va en effet recevoir les diff�rentes requ�tes adress�es � notre infrastructure et les dispatcher vers la bonne destination interne.

### D�marrage des container et tests de fonctionnement
Nous allons ici d�marrer des container � partir des images cr��es dans les deux �tapes pr�c�dentes.

`
>docker run -d --name apache_static php_httpd
>docker run -d --name express_dynamic express_presences

`

Ensuite, gr�ce � la commande docker inspect pour chaque container, on trouve (dans NetworkSettings/IPAddress) l'adresse IP donn�e au container.

* 172.17.0.2 pour apache_static
* 172.17.0.2 pour express_dynamic

Utilisant powershell sous windows comme interface de ligne de commande, cette commande correspond � un grep -i en bash
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
qui nous permet de nous connecter � notre machine virtuelle docker pour atteindre nos container. En effet, ceux-ci ne sont pas accessibles depuis l'ext�rieur du fait que nous n'avons pas fait de port forwarding.

On lance ensuite une connexion telnet � chaqun des container puis on leur envoie une requ�te HTTP.

`
GET / HTTP/1.0
`

### Configuration du Reverse Proxy et routage des requ�tes

Dans cette configuration, les adresses ip des containers sont ins�r�es en dur dans la configuration. Cette mani�re de faire n'est pas souhaitable si on souhaite obtenir une solution robuste. En effet, les adresses ip assign�es aux container peuvent varier.

Notre reverse proxy va �tre impl�ment� dans un container Docker bas� sur la m�me image que pour le contenu statique que nous avons cr�� auparavant. L'image php:7.2-apache.

La configuration voulue pour le reverse proxy doit nous permettre:

* d'atteindre le site statique dans le container apache_static en sp�cifiant la requ�te
`
GET / HTTP/1.0
Host: demo.res.ch
`
* d'atteindre le site dynamique (liste de pr�sence) du container express_dynamic via la requ�te
`
GET /api/presences/ HTTP/1.0
`
#### configuration Dockerfile et des fichiers de configuration Apache
Nous allons cr�er un nouveau r�pertoire apache-reverse-proxy qui va contenir les fichiers n�cessaires � la cr�ation de notre image personnalis�e pour le reverse proxy.

Tout d'abord, un petit mot sur la structure de la configuration d'Apache.
/etc/apache2, est le r�pertoire contenant les fichiers de configuration du service Apache. Ses sous-dossiers importants pour notre configuration sont :

* mods-available : les modules disponibles
* mods-enabled : les modules activ�s via l'utilitaire a2enmod
* sites-available : les sous-sites disponibles
* sites-enabled : les sous-sites activ�s via l'utilitaire a2ensite

Le Dockerfile de notre image sera le suivant.

``
FROM php:7.2-apache                                                                                                                                                                                                                                                         COPY conf/ /etc/apache2                                                                                                                                                                                                                                                     RUN a2enmod proxy proxy_http                                                                                                          RUN a2ensite 000-* 001-*
``
La commande COPY va copier les fichiers de configuration Apache dans le r�pertoire de configuration du container � sa cr�ation. Ici il s'agit de copier le contenu du dossier sites-available (sous-dossier de conf) dans le container pour d�finir les 2 sites :
* 000-default.conf qui d�finit le virtual host par d�faut. On le d�fini comme �a pour que le client, s'il envoie une requ�te sans d�finir l'en-t�te "Host:", n'arrive pas sur la configuration statique.

RUN a2enmod ... va lancer l'utilitaire pour installer les 2 modules n�cessaires pour configurer le proxy sur notre serveur.

RUN a2ensite ... va activer les deux sites que nous avons copi� pr�c�demment.

``
<VirtualHost *:80>
</VirtualHost>
``

* 001-reverse-proxy.conf qui d�fini les param�tres du routage vers nos deux containers.

``
<VirtualHost *:80>
        ServerName demo.res.ch

        ProxyPass "/api/presences/" "http://172.17.0.3:3000/"
        ProxyPassReverse "/api/presences/" "http://172.17.0.3:3000/"

        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
``
Dans ce fichier, on peut voir qu'on sp�cifie le ServerName, donc le contenu de l'en-t�te Host: attendu, Proxy Pass va sp�cifier une r��criture de l'url. Donc quand le client envoie "/api/presences/" au reverse proxy, celui-ci va faire passer l'URL "http://172.17.0.3:3000/" et ainsi permettre d'�tre opaque sur la structure pr�sente derri�re lui.

A l'inverse on r��crit l'URL de base pour les r�ponses venant dans l'autre sens.


Nous allons ensuite g�n�rer notre image via la commande docker build sous le nom "apache-rp".
Puis nous allons lancer un container avec la commande suivante.

``
docker run -d -p 8080:80 apache-rp
``

#### V�rification du fonctionnement correct de nos routes

Si on tape l'adresse ip de la VM Docker avec le port 8080, on atteint bien une page d'interdiction d'acc�s. En effet, on suit le sous-site par d�faut 000.

Il faut maintenant configurer le nom DNS demo.res.ch dans notre fichier hosts pour le faire correspondre � l'adresse ip de notre VM. Pour cel� et sous Windows, il faut aller sous C:\Windows\System32\drivers\etc\hosts et ins�rer la ligne suivante dans le fichier.

``
192.168.99.100 demo.res.ch
``

## Step 4: AJAX requests with JQuery

Dans cette partie, nous allons faire en sorte que notre site accessible via demo.res.ch fasse une requ�te ajax pour afficher le contenu dynamique envoyer par notre server web dynamique.

Nous allons d'abord modifier le Dockerfile de notre image apache-php-image et ins�rer les commandes d'installation de vim.

``
FROM php:7.2-apache

RUN apt-get update && \
  apt-get install -y vim

COPY /content/ /var/www/html/
``

et effectuer � nouveau un docker build pour cr�er une nouvelle image. On se connecte ensuite au container interactivement avec la commande docker run -it pour v�rifier que l'outil vi fonctionne bien dans le container.

On effectue la m�me manipulation sur les deux autres images que nous avions cr�� pr�c�demment.

On va nommer nos container ainsi :

* apache_rp pour l'image apache-rp
* express_presences pour l'image express_presences
* apache_static pour l'image php_httpd

Ayant sp�cifier les adresses IP en dur pour nos containers, il nous faut v�rifier que les m�me IP ont �t� attribu�es � nos nouveaux container, sinon nous devrons modifier les IP dans la configuration de notre Reverse Proxy.


### Requ�te Ajax pour r�cup�rer la liste dynamique

Gr�ce � JQuery, nous allons r�cup�rer la liste retourn�e par /api/presences/ et l'afficher dans la page statique de notre container statique en mettant � jour les donn�es affich�es � intervalle r�gulier.

Notre api nous renvoie un tableau de membres ayant chacun un tableau associ� avec ses pr�sences, on veut afficher le tableau complet sur notre page statique.

Nous allons travailler dans nos container Docker directement, nous allons donc lancer un docker exec interactif sur /bin/bash pour entrer dans le container et pouvoir modifier les fichiers.

#### Appel au script et ajout d'�l�ment DOM d'accueil dans index.html

D'abord, dans index.html de notre container apache_static, nous allons ajouter la ligne suivante pour appeler le script que nous allons cr�er ensuite.

``html
<script src="js/presences.js"></script>
``

Il nous faut ensuite un �l�ment dans lequel accueillir notre contenu. Pour cel�, nous allons ajouter une classe "presences" dans notre page html.

``html
<h3> Here is our presences list </h3>
<div class="presences"></div>
``

#### Cr�ation de la structure de dossier et du script presences.js

Nous allons maintenant cr�er un dossier js qui accueillera nos scripts et allons y cr�er un fichier "presences.js".

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
						
						//Creation d'une liste de presences � ins�rer dans une cellule du tableau
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
	//lancement de la fonction � intervalle r�gulier
	setInterval(loadPresences, 5000);
});
``

Le style CSS a aussi �t� modifi� pour permettre l'affichage du tableau, il est plac� dans le sous-dossier assets.

Les modifications qui pr�c�dent ont �t� faites sur un container docker en fonction via l'invite de commande interractive. Le fonctionnement ayant �t� valid�, on va copier les fichiers modifier dans la structure de dossier de notre image apache_static et reg�n�rer une nouvelle image avec la commande docker build et relancer nos container.


## Step 5: Dynamic reverse proxy configuration
