var connect = require('connect'),
    serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic("."));
app.listen((process.env.PORT || 5000));