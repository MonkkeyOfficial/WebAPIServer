var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});

var compile = require('./process/web/web.compile.js');
var execute = require('./process/web/web.execute.js');
var manage = require('./process/web/web.manage.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.toRootPage = function(res) {
    res.sendFile('views/index.html', { root: __dirname });
}

compile.init(app);
execute.init(app);
manage.init(app);

app.listen(9000);
console.log(' [o] Ready on port 9000.');
