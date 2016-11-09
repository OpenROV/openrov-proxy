#!/bin/bash
if [ ! -f /etc/environment_no_proxy ]; then
    cp /etc/environment /etc/environment_no_proxy
    else
    echo HTTP_PROXY=http://localhost:3000 >> /etc/environment
    echo HTTPS_PROXY=http://localhost:3000 >> /etc/environment
    echo http_proxy=http://localhost:3000 >> /etc/environment
    echo https_proxy=http://localhost:3000 >> /etc/environment
    echo no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com" >> /etc/environment
fi

git config --system http.proxy http://localhost:3000
git config --system https.proxy http://localhost:3000
git config --system url.https://github.com/.insteadOf git://github.com/

npm config set proxy http://localhost:3000 --global
npm config set https-proxy http://localhost:3000 --global

echo { > /.bowerrc
echo '"proxy":"http://localhost:3000",' >> /.bowerrc
echo '"https-proxy":"http://localhost:3000"' >> /.bowerrc
echo } >> /.bowerrc
echo 'Acquire::http::Proxy "http://localhost:3000";' > /etc/apt/apt.conf.d/80proxy
echo 'Acquire::https::Proxy "http://localhost:3000";' >> /etc/apt/apt.conf.d/80proxy
echo 'Acquire::ftp::Proxy "http://localhost:3000";' >> /etc/apt/apt.conf.d/80proxy
