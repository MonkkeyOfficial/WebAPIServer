"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Model_1 = require("./app/Model");
var Configuration_1 = require("./app/Configuration");
var Application_1 = require("./app/Application");
var multer = require("multer");
Application_1.default.match('get', '/', function (req, res) {
    Model_1.default(function (c) {
        c.query('SELECT * FROM user', function (e, r) {
            if (e)
                throw e;
            console.log(Model_1.User.fromDB(r[0]));
            c.release();
        });
    });
});
var upload = multer({
    dest: '/tmp/'
});
Application_1.default.post('/exo/:id/compile', upload.single('file'), function (req, res) {
    Application_1.default.byType(req, {
        type: 'json',
        action: function () {
        }
    }, {
        type: 'html',
        action: function () { return Application_1.default.toRootPage(res); }
    });
});
Application_1.default.get('/exo/:id', function (req, res) {
    Application_1.default.byType(req, {
        type: 'json',
        action: function () {
            return Model_1.default(function (db) {
                return db.query('SELECT * FROM exercice WHERE id = ? LIMIT 1', [req.params.id], function (e, r) {
                    if (e)
                        res.json({ success: false, error: e });
                    else if (!r || r.length === 0)
                        res.json({ success: false, error: "Can't find the element of uid : " + req.params.id });
                    else
                        res.json({
                            success: true,
                            exercice: r[0]
                        });
                    db.release();
                });
            });
        }
    }, {
        type: 'html',
        action: function () { return Application_1.default.toRootPage(res); }
    });
});
Application_1.default.run(Configuration_1.default.port, function () {
    console.log(' [o] Started on port ' + Configuration_1.default.port + '.');
});
//# sourceMappingURL=index.js.map