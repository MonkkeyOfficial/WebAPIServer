var exec = require('child_process').exec,
    fs = require('fs'),
    config = require('./../config.js');

// info = {
//     zipFilePath
// }
module.exports = {
    // req:Request
    // callback: (info:info, disposeTempFile:() => void) => void
    createCompressedFromRequest: function(filePath, callback) {
        callback({ zipFilePath: filePath }, () => {
            fs.unlink(filePath, (e) => { if(e) console.error(e); });
        });
    },
    // folder:string
    // callback: (info:info, disposeTempFile:() => void) => void
    createCompressed: function(folder, callback) {
        require('tmp').file((e, path, fd, cleanUpCallback) => {
            exec('tar -zcvf ' + path + ' -C ' + folder + ' .', (e) => {
                callback({ zipFilePath: path }, cleanUpCallback);
            });
        });
    },
    removeImage: function(oldImageName, callback, errorCallback) {
        exec('docker rmi -f ' + oldImageName, (e,so,se) => {
            errorCallback = errorCallback ? errorCallback : () => {};
            callback = callback ? callback : () => {};
            
            if(e)
                errorCallback(JSON.stringify(e));
            else if(se && se.length > 0)
                errorCallback(se);
            else
                callback();
        });
    },
    // info: info
    // callback: (dockerImageId: string) => void
    createImage: function(info, callback, errorCallback) {
        var root = '/root';
        var destFileName = 'content.tgz';
        var destFilePath = root + '/' + destFileName;
        var destFolder = root + '/bin';
        exec('docker run -idt ' + config.compilation.image_base + ' timeout ' + config.compilation.timeout_sec + 's bash', (e,id,se) => {
            if(e)
            {
                if(errorCallback)
                    errorCallback(e, 'system.image', "Internal error : Couldn't start the base snapshot. Please, contact the server owner.", se);
                return;
            }
            id = id.trim();
            var mng = (callback, type, message) => function(e, o, se) {
                if(e || se)
                {
                    exec('docker rm -f ' + id);
                    if(errorCallback)
                        errorCallback(e, type, message, se);
                }
                else
                    callback(o);
            };
            exec('docker cp ' + info.zipFilePath + ' ' + id + ':' + destFilePath, mng(() => {
            exec('docker exec ' + id + ' tar -zxvf ' + destFilePath + ' -C ' + destFolder, mng(() => {
            exec('docker exec ' + id + ' cat ' + destFolder + '/_d__config__', mng(configStr => {
                var configContent;
                try
                {
                    configContent = JSON.parse(configStr);
                }
                catch(ex)
                {
                    if(errorCallback)
                        errorCallback(ex, "Can't parse the configuration file.");
                    return;
                }

                exec('docker exec ' + id + ' bash -c "cd ' + destFolder + ' && bash _d__install__"', mng(installLog => {
                exec('docker exec ' + id + ' mv ' + destFolder + '/_d__config__ ' + root + '/config.json', mng(() => {
                exec('docker commit ' + id, mng(newKey => {
                    exec('docker rm -f ' + id);
                    callback({
                        key: newKey.trim(),
                        config: configContent,
                        installLog: installLog
                    });
                }, 'system.image', "Internal server error : Can't save the system. Please, contact the server owner."));
                }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
                }, 'user.archive', "Couldn't execute the file _d__install__ at the root folder of the archive."));
            }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
            }, 'user.archive', "Couldn't extract files from the uploaded archive."));
            }, 'system.image', "Internal server error : Couldn't copy the archive to the snapshot. Please contact the server owner."));
        });
    }
}
