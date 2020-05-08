# Laboratoire infrastructure HTTP

## Etape 1: Serveur HTTP statique avec Apache httpd

Après avoir forké le repo du laboratoire, nous allons créer un container Docker à partir de l'image php sur docker.hub et contenant un serveur httpd fonctionnel. 

### Build de l'image, run du container et test d'accès depuis un browser
Nous allons d'abord créer la structure du contenu statique que nous voulons afficher sur notre serveur. Pour celà nous allons choisir un template bootstrap déniché sur internet et customisé pour présenter le cours RES. Nous allons placer ce contenu dans un dossier cotent.

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

Les fichier de configurations sont accessible dans le répertoire /etc/apache2 et on s'intéresse pour le moment plus spécifiquement aux fichiers apache2.conf et /sites-available/000-default.conf.

Le premier est le point central de toute la configuration du serveur Apache. En effet, la configuration est splitée en plusieurs fichiers de configuration. Ce fichier fait le lien entre eux.

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

Dans le répertoire src que nous allons copier dans notre container, nous allons lancer la commande suivante pour initialiser l'application. Mais avant celà, il nous faut installer NodeJS sur notre machine en téléchargeant l'installer sur le [site de NodeJS](https://nodejs.org/en/download/).
```
npm init
```

Cette commande va générer un fichier package.json qui contient les informations propres à notre application.

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

On fait un build de l'image et on lance un container, ceci va avoir pour effet d'afficher un nom aléatoire dans notre console. Notre container s'arrête dès la fin du script du coup pas moyen pour le moment de l'accéder depuis un navigateur par exemple.

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

On va donc écouter sur le port 3000 avec notre application et dès qu'une requête HTTP (GET) venant d'un client est reçue avec comme contenu '/', on retourne un message.

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

## Step 4: AJAX requests with JQuery

## Step 5: Dynamic reverse proxy configuration
