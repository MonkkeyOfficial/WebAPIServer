"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs = require("fs");
var Configuration_1 = require("../app/Configuration");
var Error_1 = require("../app/Error");
var ImageCompilableResult = (function () {
    function ImageCompilableResult(config, dockerKey, log) {
        this.configuration = config;
        this.dockerKey = dockerKey;
        this.log = log;
    }
    return ImageCompilableResult;
}());
exports.ImageCompilableResult = ImageCompilableResult;
var ImageUtil = (function () {
    function ImageUtil() {
    }
    ImageUtil.execute = function (options, callback) {
        var child = child_process_1.exec('docker run --rm -i ' + options.dockerKey + ' timeout ' + options.timeout + 's /bin/node /root/index.js', function (e, stdout, se) {
            if (e || se && se.trim().length > 0) {
                callback(new Error_1.default(e, 'undefined', undefined, se));
                return;
            }
            callback(null, stdout);
        });
        if (options.stdin === undefined || options.stdin === null)
            child.stdin.write('{}');
        else if (options.stdin.constructor === Object || options.stdin.constructor === Array)
            child.stdin.write(JSON.stringify(options.stdin));
        else
            child.stdin.write(options.stdin.toString());
    };
    ImageUtil.compile = function (options, callback) {
        var root = '/root';
        var destFileName = 'content.tgz';
        var destFilePath = root + '/' + destFileName;
        var destFolder = root + '/bin';
        function errorCallback(e, type, message, se) {
            if (options.deleteFileOnExit || options.deleteFileOnError)
                fs.unlink(options.zipFilePath);
            if (callback)
                callback(new Error_1.default(e, type, message, se));
        }
        child_process_1.exec('docker run -idt ' + Configuration_1.default.compilation.image_base + ' timeout ' + Configuration_1.default.compilation.timeout_sec + 's bash', function (e, id, se) {
            if (e) {
                errorCallback(e, 'system.image', "Internal error : Couldn't start the base snapshot. Please, contact the server owner.", se);
                return;
            }
            id = id.trim();
            var mng = function (callback, type, message) { return function (e, o, se) {
                if (e || se) {
                    child_process_1.exec('docker rm -f ' + id);
                    errorCallback(e, type, message, se);
                }
                else
                    callback(o);
            }; };
            child_process_1.exec('docker cp "' + options.zipFilePath + '" ' + id + ':' + destFilePath, mng(function () {
                child_process_1.exec('docker exec ' + id + ' tar -zxvf ' + destFilePath + ' -C ' + destFolder, mng(function () {
                    child_process_1.exec('docker exec ' + id + ' cat ' + destFolder + '/_d__config__', mng(function (configStr) {
                        var configContent;
                        try {
                            configContent = JSON.parse(configStr);
                        }
                        catch (ex) {
                            errorCallback(ex, "Can't parse the configuration file.");
                            return;
                        }
                        child_process_1.exec('docker exec ' + id + ' bash -c "cd ' + destFolder + ' && bash _d__install__"', mng(function (installLog) {
                            child_process_1.exec('docker exec ' + id + ' mv ' + destFolder + '/_d__config__ ' + root + '/config.json', mng(function () {
                                child_process_1.exec('docker commit ' + id, mng(function (newKey) {
                                    child_process_1.exec('docker rm -f ' + id);
                                    if (options.deleteFileOnExit || options.deleteFileOnSuccess)
                                        fs.unlink(options.zipFilePath);
                                    callback(null, new ImageCompilableResult(configContent, newKey.trim(), installLog));
                                }, 'system.image', "Internal server error : Can't save the system. Please, contact the server owner."));
                            }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
                        }, 'user.archive', "Couldn't execute the file _d__install__ at the root folder of the archive."));
                    }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
                }, 'user.archive', "Couldn't extract files from the uploaded archive."));
            }, 'system.image', "Internal server error : Couldn't copy the archive to the snapshot. Please contact the server owner."));
        });
    };
    ImageUtil.delete = function (dockerKey, callback) {
        child_process_1.exec('docker rmi -f ' + dockerKey, function (e, so, se) {
            callback = callback ? callback : function () { };
            if (e)
                callback(e);
            else if (se && se.length > 0)
                callback(se);
            else
                callback(null);
        });
    };
    return ImageUtil;
}());
exports.ImageUtil = ImageUtil;
//# sourceMappingURL=ImageCompilable.js.map