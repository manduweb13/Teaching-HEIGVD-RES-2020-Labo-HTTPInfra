
<?php
    $static_app1 = getenv('STATIC_APP1');
    $dynamic_app1 = getenv('DYNAMIC_APP1');

    $static_app2 = getenv('STATIC_APP2');
    $dynamic_app2 = getenv('DYNAMIC_APP2');

?>

<VirtualHost *:80>
        ServerName demo.res.ch


	<Location /lb-view>
		SetHandler balancer-manager
	</Location>
	ProxyPass /lb-view !

        <Proxy balancer://staticbalancer>
                BalancerMember 'http://<?php print "$static_app1"?>'
                BalancerMember 'http://<?php print "$static_app2"?>'
                ProxySet lbmethod=byrequests
        </Proxy>

        <Proxy balancer://dynamicbalancer>
                BalancerMember 'http://<?php print "$dynamic_app1"?>'
                BalancerMember 'http://<?php print "$dynamic_app2"?>'
                ProxySet lbmethod=byrequests
        </Proxy>

        ProxyPass '/api/presences/' 'balancer://dynamicbalancer'
        ProxyPassReverse '/api/presences/' 'balancer://dynamicbalancer'

        ProxyPass '/' 'balancer://staticbalancer/'
        ProxyPassReverse '/' 'balancer:/staticbalancer/'
</VirtualHost>
