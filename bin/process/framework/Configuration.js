"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var config = JSON.parse(fs.readFileSync('./config.json').toString());
exports.default = config;
function initialize(callback) {
    var handlers = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        handlers[_i - 1] = arguments[_i];
    }
    if (handlers.length === 0) {
        callback(true);
        return;
    }
    var isValid = true;
    var countOut = handlers.length;
    function callbackCountOut(valid) {
        isValid = isValid && valid;
        --countOut;
        if (countOut <= 0)
            callback(isValid);
    }
    for (var k in handlers) {
        var handler = handlers[k];
        var result = handler(config, callbackCountOut);
        if (result !== undefined && result !== null && result.constructor === Boolean)
            callbackCountOut(result);
    }
}
exports.initialize = initialize;
function initializeSync() {
    var handlers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        handlers[_i] = arguments[_i];
    }
    for (var k in handlers)
        if (!handlers[k](config))
            return false;
    return true;
}
exports.initializeSync = initializeSync;
function spreadValues(object, values) {
    for (var keyName in values) {
        var value = values[keyName];
        if (!object[keyName] || !value || value.constructor !== Object) {
            object[keyName] = value;
            continue;
        }
        spreadValues(object[keyName], value);
    }
}
exports.spreadValues = spreadValues;
function applyMode(config) {
    if (!config.mode)
        config.mode = 'prod';
    if (config.modes && config.modes[config.mode])
        spreadValues(config, config.modes[config.mode]);
}
exports.applyMode = applyMode;
//# sourceMappingURL=Configuration.js.map