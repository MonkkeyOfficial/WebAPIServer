"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var Configuration_1 = require("./Configuration");
if (!Configuration_1.default.db)
    console.error(' [!] \'db\' property not defined in configuration file.');
var db = mysql.createPool(Configuration_1.default.db);
function default_1(callback) {
    db.getConnection(function (e, connection) {
        if (e)
            throw e;
        callback(connection);
    });
}
exports.default = default_1;
//# sourceMappingURL=Database.js.map