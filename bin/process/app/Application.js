"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var session = require("express-session");
var bodyParser = require("body-parser");
var express = require("express");
var path = require("path");
var Application_1 = require("./../framework/Application");
var Configuration_1 = require("./Configuration");
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.call(this) || this;
        var app = _this.express;
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(session(Configuration_1.default.session));
        app.use(express.static('public'));
        return _this;
    }
    App.instance = function () {
        if (!this._app)
            this._app = new App();
        return this._app;
    };
    App.prototype.toRootPage = function (response) {
        response.sendFile('./views/index.html', { root: path.join(__dirname, '../../..') });
    };
    return App;
}(Application_1.Application));
exports.App = App;
exports.default = App.instance();
//# sourceMappingURL=Application.js.map