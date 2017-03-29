var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    path = require('path');

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});

var compile = require('./web/web.compile.js');
var execute = require('./web/web.execute.js');
var manage = require('./web/web.manage.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.toRootPage = function(res) {
    res.sendFile('./views/index.html', { root: path.join(__dirname, '..') });
}

compile.init(app);
execute.init(app);
manage.init(app);

app.listen(9000);
console.log(' [o] Ready on port 9000.');
