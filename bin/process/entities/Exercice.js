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
var ImageCompilable_1 = require("./ImageCompilable");
var IExercice_1 = require("./shared/IExercice");
var Error_1 = require("../app/Error");
var Exercice = (function (_super) {
    __extends(Exercice, _super);
    function Exercice() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Exercice.fromDB = function (data) {
        var obj = new Exercice();
        IExercice_1.IExercice.copyTo(data, obj);
        return obj;
    };
    Exercice.prototype.compile = function (options, callback) {
        var _this = this;
        ImageCompilable_1.ImageUtil.compile(options, function (e, r) {
            if (r) {
                _this.configuration = r.configuration;
                _this.install_log = r.log;
                _this.docker_key = r.dockerKey;
                _this.config = JSON.stringify(r.configuration);
            }
            callback(e, r);
        });
    };
    Exercice.prototype.execute = function (options, callback) {
        ImageCompilable_1.ImageUtil.execute({
            dockerKey: this.docker_key,
            timeout: options.timeout ? options.timeout : 5,
            stdin: options.stdin ? options.stdin : null
        }, function (e, stdout) {
            if (e) {
                callback(e, null);
                return;
            }
            var result;
            try {
                result = JSON.parse(stdout);
            }
            catch (ex) {
                callback(new Error_1.default(ex, 'system.imageRuntime', "The result of the image execution is not a valid JSON string.", stdout));
                return;
            }
            result.success = result.success !== undefined ? result.success : true;
            callback(e, result);
        });
    };
    return Exercice;
}(IExercice_1.IExercice));
exports.Exercice = Exercice;
//# sourceMappingURL=Exercice.js.map