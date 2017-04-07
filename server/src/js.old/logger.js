var fs = require('fs'),
    db = require('./db.js');

function string(message)
{
    if(message.constructor === Object || message.constructor === Array)
        message = JSON.stringify(message);
    return message;
}

function submit(message, file, isError, dockerImageId)
{
    message = string(message);
    var time = '[' + (new Date()).toISOString() + '] ';
    var dockId = dockerImageId ? '[id:' + dockerImageId + '] ' : '';
    console.log((isError ? ' [!] ' : ' [o] ') + time + dockId + message);
    fs.appendFileSync(file, time + dockId + message);
    db.query('INSERT INTO log (message, is_error) VALUES (?, ?)', [ message, isError ]);
    if(dockerImageId)
        db.query('INSERT INTO imagelog (dockerimage_id, message, is_error) VALUES (?, ?, ?)', [ dockerImageId, message, isError ]);
}

module.exports = {
    errorFile: 'errors.log',
    logFile: 'messages.log',
    error: function(message, dockerImageId) {
        submit(message, module.exports.errorFile, true, dockerImageId);
    },
    log: function(message, dockerImageId) {
        submit(message, module.exports.logFile, false, dockerImageId);
    }
}