#!/bin/bash
set -x
set -e
# set the openrov startup
ln -s /opt/openrov/proxy/openrov-proxy.service /etc/init.d/openrov-proxy
update-rc.d openrov-proxy defaults

mkdir -p /etc/nginx/locations-enabled
ln -s /opt/openrov/proxy/nginx.location /etc/nginx/locations-enabled/proxy.conf
