
Proxy and middleware to retrieve things via the client browser
==============================================================

As the OpenROV does not have access to the internet itself, we need some option
to retrieve files from the web.

THe idea is that the client browser downloads any files needed.
That can't be done easily as cross site scripting rules prohibit access to other URLS.

A way to get around this, is to have a server on the internet, for example on a AWS server that acts as a middleware.

Middleware
----------

The middleware proxy script runs on a server on the internet.
The client browser connects via socket.io to it.
Any request that comes through a proxy from the ROV are sent to the middleware on the server.
The server downloads the files and sends the conntent via socket.io to the client browser.
The Client browser then send it back to the ROV and to the requesting application.

proxy-via-browser
---------

A http server that publishes a simple html file that does all the socket.io connections and passes the messages.
Beside that, it acts as a proxy server to accept connections from commands on the ROV (like npm).


Using npm with a proxy
====================

We have to tell npm to use a proxy and to use HTTP to connect to the registry:


       npm config set registry http://registry.npmjs.org/
       npm config set proxy http://localhost:3000


How to use
==========

On the middleware server

     node middleware/proxy.js


On the ROV

    cd proxy-via-browser
    node index.js 


