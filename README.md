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


## Step 2: Dynamic HTTP server with express.js

## Step 3: Reverse proxy with apache (static configuration)

## Step 4: AJAX requests with JQuery

## Step 5: Dynamic reverse proxy configuration
