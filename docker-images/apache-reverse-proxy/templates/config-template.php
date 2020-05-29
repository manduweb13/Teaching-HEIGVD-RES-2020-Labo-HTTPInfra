<?php
    $static_app = getenv('STATIC_APP');
    $dynamic_app = getenv('DYNAMIC_APP');

    // Si les variables n'ont pas été fournies au container, on insère les valeurs par défaut

    if(empty($static_app)){
	    $static_app = "172.17.0.2:80";
    }

    if(empty($dynamic_app)){
	    $dynamic_app = "172.17.0.3:3000";
    }

?>


<VirtualHost *:80>
        ServerName demo.res.ch

        ProxyPass '/api/presences/' 'http://<?php print "$dynamic_app"?>/'
        ProxyPassReverse '/api/presences/' 'http://<?php print "$dynamic_app"?>/'

        ProxyPass '/' 'http://<?php print "$static_app"?>/'
        ProxyPassReverse '/' 'http://<?php print "$static_app"?>/'
</VirtualHost>
