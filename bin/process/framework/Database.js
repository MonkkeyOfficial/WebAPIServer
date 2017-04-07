"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var Configuration_1 = require("./Configuration");
if (!Configuration_1.default.db)
    console.error(' [!] \'db\' property not defined in configuration file.');
var db = mysql.createPool(Configuration_1.default.db);
function default_1(callback) {
    db.getConnection(function (e, connection) {
        var _this = this;
        if (e)
            throw e;
        callback(connection, function (fn) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            fn.apply(_this, args);
            connection.release();
        }; });
    });
}
exports.default = default_1;
//# sourceMappingURL=Database.js.map