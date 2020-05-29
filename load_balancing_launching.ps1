#Ce script lance 2 container contenu static et 2 container contenu dynamic
#Il récupère ensuite leurs ip et lance le container reverse proxy en les lui passant

$STATIC_PORT = 80
$DYNAMIC_PORT = 3000

# run 2 nodes statiques

docker run -d --name apache_static1 php_httpd
docker run -d --name apache_static2 php_httpd

# run 2 nodes dynamiques

docker run -d --name express_presences1 express_presences
docker run -d --name express_presences2 express_presences

# Création des variables d'envirronement à passer au container du rp

$static1 = docker inspect apache_static1 --format '{{ .NetworkSettings.IPAddress }}'
$static2 = docker inspect apache_static2 --format '{{ .NetworkSettings.IPAddress }}'

$static1 + ':' + $STATIC_PORT
$static2 + ':' + $STATIC_PORT

$dynamic1 = docker inspect express_presences1 --format '{{ .NetworkSettings.IPAddress }}'
$dynamic2 = docker inspect express_presences2 --format '{{ .NetworkSettings.IPAddress }}'

$dynamic1 + ':' + $DYNAMIC_PORT
$dynamic2 + ':' + $DYNAMIC_PORT

# Lancer le container rp avec les variables

docker run -d -e STATIC_APP1=$static1 -e STATIC_APP2=$static2 -e DYNAMIC_APP1=$dynamic1 -e DYNAMIC_APP2=$dynamic2 --name apache_rp apache-rp