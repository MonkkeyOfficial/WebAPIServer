var compiler = require('./compile.js'),
    logger = require('../logger.js'),
    errorBuilder = require('../error.js'),
    db = require('../db.js');

module.exports = {
    update: function(unitId, filePath, callback)
    {
        db.query('SELECT i.* FROM dockerimage i INNER JOIN exercice e ON e.image_id = i.id WHERE e.uid = ?', [ unitId ], (e, r) => {
            if(e)
            {
                callback({ success: false, error: { code: 1, message: "Unkown error while requesting the database." } });
                logger.error('Unkown error while requesting the database.', unitId);
                return;
            }

            if(!r || !r.length || r.length < 1)
            {
                callback({ success: false, error: { code: 10, message: "Can't find the unit id '" + unitId + "'." } });
                logger.error("Can't find the unit id '" + unitId + "'.", unitId);
                return;
            }

            unitId = r[0].id;

            logger.log('Compiling...', unitId);
            compiler.createCompressedFromRequest(filePath, (info, release) => {
                compiler.createImage({
                    zipFilePath: info.zipFilePath
                }, data => {
                    db.query('UPDATE dockerimage as i INNER JOIN exercice e ON e.image_id = i.id SET i.image_name = ?, i.config = ?, i.install_log = ? WHERE e.uid = ?', [ data.key, JSON.stringify(data.config), data.installLog, unitId ], (e,r) => {
                        logger.log('Successfuly compiled.', unitId);
                        callback({ success: true, id: unitId, keyId: data.key });
                    });

                    if(r.image_name && r.image_name.trim().length > 0)
                    {
                        var old = r.image_name.trim();
                        compiler.removeImage(old, () => {
                            logger.log('Successfuly deleted the old compiled version.', unitId);
                        }, (e) => {
                            logger.error('Error while deleting the old compiled vesion : ' + e, unitId);
                        });
                    }
                    release();
                }, (e, type, msg, se) => {
                    callback({
                        success: false,
                        id: unitId,
                        error: errorBuilder(e, type, msg, se)
                    });
                });
            });
        });
    },

    execute: function(unitId, body, callback)
    {
        db.query('SELECT i.id, i.image_name, i.timeout FROM dockerimage i INNER JOIN exercice e ON e.image_id = i.id WHERE e.uid = ?', [ unitId ], (e,r) => {
            if(e)
            {
                callback({
                    success: false,
                    error: errorBuilder(e, 'system.database', "Unkown error while requesting the database.")
                });
                return;
            }

            if(!r || !r.length || r.length < 1)
            {
                callback({
                    success: false,
                    error: errorBuilder(undefined, 'user.database', "Can't find the unit of uid '" + unitId + "'.")
                });
                return;
            }

            unitId = r[0].id;
            var unit = r[0].image_name;
            if(!unit)
            {
                callback({
                    success: false,
                    error: errorBuilder(undefined, 'user.compilationMissing', "No compilation done for unit of uid '" + unitId + "'.")
                });
                return;
            }

            unit = unit.trim();
            var timeout = r[0].timeout;
            if(timeout.constructor === String)
                timeout = Number.parseInt(timeout);
            timeout = Math.abs(timeout);
            if(timeout > config.execution.timeout_max_sec)
                timeout = config.execution.timeout_max_sec;

            var child = exec('docker run --rm -i ' + unit + ' timeout ' + timeout + 's /bin/node /root/index.js', (e,stdout,se) => {
                if(e || se && se.trim().length > 0)
                {
                    callback({
                        success: false,
                        error: errorBuilder(e, 'undefined', undefined, se)
                    });
                    return;
                }

                var result;
                try
                {
                    result = JSON.parse(stdout);
                }
                catch(ex)
                {
                    callback({
                        success: false,
                        error: errorBuilder(ex, 'system.imageRuntime', "The result of the image execution is not a valid JSON string.", stdout)
                    });
                    return;
                }
                result.success = result.success !== undefined ? result.success : true;
                callback(result);
            });
            if(body === undefined || body === null)
                child.stdin.write('{}');
            else
                child.stdin.write(JSON.stringify(body));

            /* /// TODO : Check if this commented part of the code is useful
            child.on('error', e => {
                callback({
                    success: false,
                    error: errorBuilder(e, 'undefined')
                });
            });*/
        });
    }
}