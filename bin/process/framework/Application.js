"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Application = (function () {
    function Application() {
        this.express = express();
    }
    Application.prototype.get = function (path) {
        var handler = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            handler[_i - 1] = arguments[_i];
        }
        (_a = this.express).get.apply(_a, [path].concat(handler));
        return this;
        var _a;
    };
    Application.prototype.post = function (path) {
        var handler = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            handler[_i - 1] = arguments[_i];
        }
        (_a = this.express).post.apply(_a, [path].concat(handler));
        return this;
        var _a;
    };
    Application.prototype.patch = function (path) {
        var handler = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            handler[_i - 1] = arguments[_i];
        }
        (_a = this.express).patch.apply(_a, [path].concat(handler));
        return this;
        var _a;
    };
    Application.prototype.delete = function (path) {
        var handler = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            handler[_i - 1] = arguments[_i];
        }
        (_a = this.express).delete.apply(_a, [path].concat(handler));
        return this;
        var _a;
    };
    Application.prototype.match = function (method, path) {
        var handler = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            handler[_i - 2] = arguments[_i];
        }
        if (method instanceof Array) {
            for (var k in method)
                this.match.apply(this, [method[k], path].concat(handler));
        }
        else
            (_a = this.express)[method].apply(_a, [path].concat(handler));
        return this;
        var _a;
    };
    Application.prototype.run = function (port, callback) {
        return this.express.listen(port, callback);
    };
    Application.prototype.byType = function (req) {
        var handlers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            handlers[_i - 1] = arguments[_i];
        }
        var types = [];
        var map = {};
        handlers.forEach(function (v) {
            types.push(v.type);
            map[v.type] = v.action;
        });
        var type = req.accepts(types);
        if (type)
            map[type]();
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=Application.js.map