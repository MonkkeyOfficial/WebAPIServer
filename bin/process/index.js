"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multer = require("multer");
var APIResponse_1 = require("./entities/shared/APIResponse");
var ImageCompilable_1 = require("./entities/ImageCompilable");
var Model_1 = require("./app/Model");
var Configuration_1 = require("./app/Configuration");
var Application_1 = require("./app/Application");
var Error_1 = require("./app/Error");
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
var utils;
(function (utils) {
    function findExerciceById(db, unitId, callback) {
        db.query('SELECT * FROM exercice WHERE id = ? LIMIT 1', [unitId], function (e, r) {
            if (e) {
                callback(new Error_1.default(e, 'system.database', "Unkown error while requesting the database."));
                return;
            }
            if (!r || !r.length) {
                callback(new Error_1.default(undefined, 'user.database', "Can't find the unit of uid '" + unitId + "'."));
                return;
            }
            var exercice = Model_1.Exercice.fromDB(r[0]);
            callback(null, exercice);
        });
    }
    utils.findExerciceById = findExerciceById;
    function compileFromDB(unitId, filePath, callback) {
        Model_1.default(function (db, rs) {
            callback = rs(callback);
            findExerciceById(db, unitId, function (e, exercice) {
                if (e) {
                    callback(e);
                    return;
                }
                exercice.compile({
                    zipFilePath: filePath,
                    deleteFileOnExit: true
                }, function (e, r) {
                    if (e) {
                        callback(e);
                        return;
                    }
                    ImageCompilable_1.ImageUtil.delete(exercice.docker_key, function (e) {
                        if (e) {
                            callback(e);
                            return;
                        }
                        db.query('UPDATE exercice SET docker_key = ?, install_log = ?, config = ? WHERE id = ?', [r.dockerKey, r.log, JSON.stringify(r.configuration), exercice.id], function (e, r) {
                            if (e)
                                callback(new Error_1.default(e));
                            else
                                callback(null);
                        });
                    });
                });
            });
        });
    }
    utils.compileFromDB = compileFromDB;
    function executeFromDB(unitId, body, callback) {
        Model_1.default(function (db, rs) {
            callback = rs(callback);
            findExerciceById(db, unitId, function (e, exercice) {
                if (e) {
                    callback(e);
                    return;
                }
                if (!exercice.docker_key) {
                    callback(new Error_1.default(undefined, 'user.compilationMissing', "No compilation done for unit of uid '" + unitId + "'."));
                    return;
                }
                var timeout = 5;
                exercice.execute({
                    timeout: timeout,
                    stdin: body
                }, callback);
            });
        });
    }
    utils.executeFromDB = executeFromDB;
})(utils || (utils = {}));
var upload = multer({
    dest: '/tmp/'
});
Application_1.default.post('/exo/:id/compile', upload.single('file'), function (req, res) {
    Application_1.default.byType(req, {
        type: 'json',
        action: function () {
            return utils.compileFromDB(req.params.id, req.file.path, function (e) { return res.json(new APIResponse_1.default.APIExoCompile(e)); });
        }
    }, {
        type: 'html',
        action: function () { return Application_1.default.toRootPage(res); }
    });
});
Application_1.default.post('/exo/:id/invoke', function (req, res) {
    Application_1.default.byType(req, {
        type: 'json',
        action: function () {
            return utils.executeFromDB(req.params.id, req.body, function (e, r) { return res.json(new APIResponse_1.default.APIExoExecute(e, r)); });
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
                    var error = null;
                    var result = null;
                    if (e)
                        error = new Error_1.default(e);
                    else if (!r || r.length === 0)
                        error = new Error_1.default(null, 'user.missing', "Can't find the element of uid : " + req.params.id);
                    else
                        result = r[0];
                    res.json(new APIResponse_1.default.APIExoInformation(error, result));
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
    return console.log(' [o] Started on port ' + Configuration_1.default.port + '.');
});
//# sourceMappingURL=index.js.map