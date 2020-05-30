<VirtualHost *:80>
        ServerName demo.res.ch


	<Location /lb-view>
		SetHandler balancer-manager
	</Location>
	ProxyPass /lb-view !

        <Proxy balancer://staticbalancer>
                BalancerMember 'http://172.17.0.2:80'
                BalancerMember 'http://172.17.0.3:80'
                ProxySet lbmethod=byrequests
        </Proxy>

        <Proxy balancer://dynamicbalancer>
                BalancerMember 'http://172.17.0.4:3000'
                BalancerMember 'http://172.17.0.5:3000'
                ProxySet lbmethod=byrequests
        </Proxy>

        ProxyPass '/api/presences/' 'balancer://dynamicbalancer'
        ProxyPassReverse '/api/presences/' 'balancer://dynamicbalancer'

        ProxyPass '/' 'balancer://staticbalancer/'
        ProxyPassReverse '/' 'balancer:/staticbalancer/'
</VirtualHost>
