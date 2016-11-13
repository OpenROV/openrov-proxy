#!/bin/bash
cat /etc/environment_no_proxy > /etc/environment
git config --system --unset http.proxy
git config --system --unset https.proxy
git config --system --unset url.https://github.com/.insteadOf
npm config delete proxy --global
npm config delete https-proxy --global
rm /.bowerrc
rm /etc/apt/apt.conf.d/80proxy
